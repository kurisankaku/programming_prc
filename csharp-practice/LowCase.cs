using System;

class UpCase {
  static void Main() {
    char ch;

    for(int i = 0; i < 10; i++) {
      ch = (char) ('A' + i);
      Console.Write(ch);

      ch = (char) (ch | 32); //32 is 0000 0000 0010 0000
      Console.Write(ch + " ");
    }
    Console.WriteLine();
  }
}
