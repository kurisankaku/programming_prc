using System;

class SimpleQueue {
  public char[] q;
  public int putloc, getloc;

  public SimpleQueue(int size) {
    q = new char[size + 1];
    putloc = getloc = 0;
  }

  public void Put(char ch) {
    if (putloc == q.Length - 1) {
      Console.WriteLine(" -- Queue is full.");
      return;
    }

    putloc++;
    q[putloc] = ch;
  }

  public char Get() {
    if (getloc == putloc) {
      Console.WriteLine(" -- Queue is empty.");
      return (char) 0;
    }

    getloc++;
    return q[getloc];
  }

  class QDemo {
    static void Main() {
      SimpleQueue bigQ = new SimpleQueue(100);
      SimpleQueue smallQ = new SimpleQueue(4);
      char ch;
      int i;

      Console.WriteLine("Using bigQ to stroe the alphabet.");
      for(i = 0; i < 26; i++) {
        bigQ.Put((char) ('A' + i));
      }

      Console.Write("Contents of bigQ: ");
      for(i = 0; i < 26; i++) {
        ch = bigQ.Get();
        if (ch != (char) 0) Console.Write(ch);
      }

      Console.WriteLine("\n");
      Console.WriteLine("Using smallQ to generate errors.");

      for(i = 0; i < 5; i++) {
        Console.Write("Attempting to store " + (char) ('Z' - i));
        smallQ.Put((char) ('Z' - i));
        Console.WriteLine();
      }
      Console.WriteLine();

      Console.Write("Contents of smallQ: ");
      for(i = 0; i < 5; i++) {
        ch = smallQ.Get();
        if (ch != (char) 0) Console.Write(ch);
      }
    }
  }
}
