using System;

class Base1 {
  public Base1() {
    Console.WriteLine("Base1()");
  }

  public Base1(int x) {
    Console.WriteLine("Base1(int x)");
  }

  public Base1(int x, int y) {
    Console.WriteLine("Base1(int x, int y)");
  }
}

class Test1 : Base1 {
    public Test1(int x) {
      Console.WriteLine("Test1(int x)");
    }
}

public static class ExtensionClass1 {
  public static string AddHoge(this string str) {
    return str + "Hoge1";
  }
}

class Sample {
    static void Main() {
      Test1 test = new Test1(1);
      Console.WriteLine("Fuga".AddHoge());
    }
}
