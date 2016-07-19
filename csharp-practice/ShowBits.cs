using System;

class ShowBits {
  public int numbits;

  public ShowBits(int n) {
    numbits = n;
  }

  public void Show(ulong val) {
    ulong mask = 1;

    mask <<= numbits - 1;
    int spacer = 0;
    for(; mask != 0; mask >>= 1) {
      if((val & mask) != 0) Console.Write("1");
      else Console.Write("0");

      spacer++;

      if((spacer % 8) == 0) {
        Console.Write(" ");
        spacer = 0;
      }
    }
    Console.WriteLine();
  }
}

class ShowBitsDemo {
  static void Main() {
    ShowBits b = new ShowBits(8);
    ShowBits i = new ShowBits(32);
    ShowBits li = new ShowBits(64);

    Console.WriteLine("123 in binary: ");
    b.Show(123);
    Console.WriteLine("\n87987 in binary: ");
    i.Show(87987);
    Console.WriteLine("\n237658768 in binary: ");
    li.Show(237658768);
  }
}
