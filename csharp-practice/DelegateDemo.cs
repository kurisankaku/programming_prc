using System;

delegate string StrMod(string str);

class StringOps {
  public string ReplaceSpaces(string a) {
    Console.WriteLine("Replaces spaces with hyphens.");
    return a.Replace(' ', '-');
  }

  public string RemoveSpaces(string a) {
    string temp = "";
    int i;

    Console.WriteLine("Removing spaces.");
    for (i = 0; i < a.Length;  i++) {
      if (a[i] != ' ') temp += a[i];
    }

    return temp;
  }

  public string Reverse(string a) {
    string temp = "";
    int i;

    Console.WriteLine("Reversing string.");
    for (i = a.Length - 1; i >= 0; i--) {
      temp += a[i];
    }
    return temp;
  }

  class DelegateTest {
    static void Main() {
      StringOps so = new StringOps();

      StrMod strOp = so.ReplaceSpaces;
      strOp += so.RemoveSpaces;
      strOp += so.Reverse;

      string str = strOp("This is a test.");
      Console.WriteLine(str);
      Console.WriteLine();
    }
  }
}
