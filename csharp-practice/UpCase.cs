using System;

class UpCase {
  static void Main() {
    char ch;

    for(int i = 0; i < 10; i++) {
      ch = (char) ('a' + i);
      Console.Write(ch);

      ch = (char) (ch & 65503); //65503 is 1111 1111 1101 1111
      Console.Write(ch + " ");
    }
    Console.WriteLine();
  }
}
