using System;

public class HelloWorld
{
  static public void Main ()
  {
    Console.WriteLine("Hello Mono World.");
    Console.WriteLine("Here is 10/3: {0:#.##}", 10.0/3.0);
    Console.WriteLine("Current balance is {0:C}", 12323.09m);
    Console.WriteLine(default(int));
  }
}
