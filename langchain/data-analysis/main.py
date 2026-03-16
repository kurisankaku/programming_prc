import getpass
import os
from daytona import Daytona, DaytonaConfig
from langchain_daytona import DaytonaSandbox
import csv
import io
from langchain.tools import tool
from slack_sdk import WebClient
import uuid
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.types import interrupt, Command

from langgraph.checkpoint.memory import InMemorySaver
from deepagents import create_deep_agent

os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
os.environ["GEMINI_API_KEY"] = getpass.getpass("Enter your Gemini API key: ")
daytona_api_key = getpass.getpass("Enter your Daytona API key: ")
slack_token = getpass.getpass("Enter your Slack API token: ")
slack_channel_id = getpass.getpass("Enter your Slack channel ID: ")
slack_client = WebClient(token=slack_token)

daytona_config = DaytonaConfig(api_key=daytona_api_key)


@tool(parse_docstring=True)
def slack_send_message(text: str, file_path: str | None = None) -> str:
    """Send message, optionally including attachments such as images.

    Args:
        text: (str) text content of the message
        file_path: (str) file path of attachments in the filesystem.
    """
    if not file_path:
        slack_client.chat_postMessage(channel=slack_channel_id, text=text)
        return "Message sent to Slack successfully."
    else:
        fp = backend.download_files([file_path])
        slack_client.files_upload_v2(
            channel=slack_channel_id,
            content=fp[0].content,
            initial_comment=text,
        )
        return "Message with attachment sent to Slack successfully."


@tool(parse_docstring=True)
def ask_human(question: str) -> str:
    """Ask the human user a question and wait for their response.

    Args:
        question: The question to ask the human user.
    """
    answer = interrupt(question)
    return answer


data = [
    ["Date", "Product", "Units Sold", "Revenue"],
    ["2025-08-01", "Widget A", 10, 250],
    ["2025-08-02", "Widget B", 5, 125],
    ["2025-08-03", "Widget A", 7, 175],
    ["2025-08-04", "Widget C", 3, 90],
    ["2025-08-05", "Widget B", 8, 200],
]

buf = io.StringIO()
csv.writer(buf).writerows(data)
csv_bytes = buf.getvalue().encode("utf-8")

try:
    sandbox = Daytona(daytona_config).create()
    backend = DaytonaSandbox(sandbox=sandbox)
    backend.upload_files([("/home/daytona/data/sales_data.csv", csv_bytes)])

    result = backend.execute("echo ready")
    print(result)

    checkpointer = InMemorySaver()
    agent = create_deep_agent(
        model=ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            temperature=1.0,
        ),
        system_prompt=(
            "The working directory is /home/daytona. "
            "Always use /home/daytona/ as the base path for reading and writing files. "
            "Before running Python scripts, install required packages with "
            "'pip install <package>' using the execute tool. "
            "When you need to ask the user a question, you MUST use the ask_human tool."
        ),
        tools=[slack_send_message, ask_human],
        backend=backend,
        checkpointer=checkpointer,
    )

    thread_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}, "recursion_limit": 50}
    input_message = {
        "role": "user",
        "content": (
            "Analyze /home/daytona/data/sales_data.csv and generate a beautiful plot. "
            "When finished, send your analysis and the plot to Slack using the tool."
        ),
    }
    stream_input = {"messages": [input_message]}
    while True:
        interrupt_value = None
        for step in agent.stream(stream_input, config, stream_mode="updates"):
            for key, update in step.items():
                if key == "__interrupt__":
                    interrupt_value = update
                    continue
                if (
                    update
                    and (messages := update.get("messages"))
                    and isinstance(messages, list)
                ):
                    for message in messages:
                        message.pretty_print()

        if interrupt_value is not None:
            # ask_human ツールが呼ばれた場合 → Command(resume=...) で再開
            user_input = input("\nYou: ").strip()
            stream_input = Command(resume=user_input)
        else:
            # ask_human なしで終了した場合 → 新規メッセージとして送信（Enterのみで終了）
            user_input = input("\nYou (Enterで終了): ").strip()
            if not user_input:
                break
            stream_input = {"messages": [{"role": "user", "content": user_input}]}

finally:
    sandbox.delete()
