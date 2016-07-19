using System;
using System.Collections.Generic;

class BitsInInteger {
  static String Execute(List<String> list, string number) {
      if (number.Length <= 4) {
        list.Add(number);
        list.Reverse();
        return string.Join(" ", list.ToArray());
      }
      list.Add(number.Substring(number.Length - 4, 4));
      var y1 = number.Substring(0, number.Length - 4);
      return Execute(list, y1);
  }

  static void Main() {
    int digit;
    int val;

    Console.WriteLine("Input number of digits");
    var readDigit = Console.ReadLine();
    if (String.IsNullOrEmpty(readDigit)) {
      digit = 16;
    } else {
      digit = int.Parse(readDigit);
    }

    Console.WriteLine("Input number for converting to bit");
    val = int.Parse(Console.ReadLine());
    var number = "";

    for(int t = (int)Math.Pow(2, digit - 1); t > 0; t = t / 2) {
      if((val & t) != 0) number += "1";
      else number += "0";
    }
    Console.WriteLine(Execute(new List<string>(), number));
    Console.WriteLine();
  }
}
