# import os
# from datetime import datetime, timedelta

# # 対象のディレクトリ
# target_directory = "/Users/kuriyama/Desktop/saqina_db"

# current_time = datetime.now()

# files = os.listdir(target_directory)
# files.sort()
# # ディレクトリ内のファイル名を変更
# for filename in files:
#     old_path = os.path.join(target_directory, filename)
#     if os.path.isfile(old_path):
#         current_time = current_time + timedelta(seconds=1)
#         new_filename = f'{current_time.strftime("%Y%m%d%H%M%S")}_{filename}'
#         new_path = os.path.join(target_directory, new_filename)
#         os.rename(old_path, new_path)
#         print(f"Renamed: {old_path} -> {new_path}")

# import os
# import re
# from datetime import datetime

# import pymysql
# from sshtunnel import SSHTunnelForwarder

# # SSH接続情報
# ssh_host = "54.168.51.15"
# ssh_port = 22
# ssh_user = "ec2-user"
# ssh_key_path = "/Users/kuriyama/Public/aidane/saqina/pem/dev-bastion-saqina.pem"

# # MySQL接続情報
# mysql_host = "saquina-skin-master-instance-cluster.cluster-cubqr7d4cap4.ap-northeast-1.rds.amazonaws.com"
# mysql_port = 3306
# mysql_user = "admin"
# mysql_password = "admin123"
# mysql_db = "BpBizDB"

# # 対象のディレクトリ
# target_directory = "/Users/kuriyama/Desktop/saqina_db_1"

# current_time = datetime.now()

# files = os.listdir(target_directory)
# files.sort()
# target_tables = []
# # ディレクトリ内のファイル名を変更
# for filename in files:
#     old_path = os.path.join(target_directory, filename)
#     if os.path.isfile(old_path):
#         table_name = old_path.split(".")[0].split("/")[-1]
#         target_tables.append(table_name)

# # SSHトンネルを作成
# with SSHTunnelForwarder(
#     (ssh_host, ssh_port),
#     ssh_username=ssh_user,
#     ssh_pkey=ssh_key_path,
#     remote_bind_address=(mysql_host, mysql_port),
# ) as tunnel:
#     # トンネル経由でMySQLに接続
#     connection = pymysql.connect(
#         host="127.0.0.1",
#         port=tunnel.local_bind_port,
#         user=mysql_user,
#         password=mysql_password,
#         database=mysql_db,
#     )

#     try:
#         with connection.cursor() as cursor:
#             cursor.execute(
#                 "select TABLE_NAME from information_schema.tables where table_schema = 'BpBizDB' and table_type != 'VIEW' and TABLE_NAME not in %s",
#                 (tuple(target_tables),),
#             )
#             result = cursor.fetchall()

#             results_table = []
#             for row in result:
#                 table_name = row[0]
#                 results_table.append(table_name)

#             for table in results_table:
#                 print(table)
#                 cursor.execute(f"SHOW CREATE TABLE {table}")
#                 result = cursor.fetchone()
#                 create_table_sql = result[1]
#                 create_table_sql = create_table_sql.replace(
#                     re.search(r"AUTO_INCREMENT=\d+", create_table_sql).group(), ""
#                 )
#                 with open(f"{table}.sql", "w") as file:
#                     file.write(result[1] + ";\n")
#     finally:
#         connection.close()


import os
import re

# 対象のディレクトリ
target_directory = "/Users/kuriyama/Desktop/saqina_db"

# ディレクトリ内のファイルを処理
for filename in os.listdir(target_directory):
    file_path = os.path.join(target_directory, filename)
    if os.path.isfile(file_path):
        with open(file_path, "r") as file:
            content = file.read()

        # AUTO_INCREMENT の部分を削除
        new_content = re.sub(r"AUTO_INCREMENT=\d+", "", content)

        # ファイルを上書き
        with open(file_path, "w") as file:
            file.write(new_content)

        print(f"Processed: {file_path}")

