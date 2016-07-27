using System;

delegate void MyEventHandler();

class MyEvent {
  public event MyEventHandler SomeEvent;

  public void Fire() {
    if (SomeEvent != null) {
      SomeEvent();
    }
  }

  class X {
    public void Xhandler() {
      Console.WriteLine("Event received by X object.");
    }
  }

  class Y {
    public void Yhandler() {
      Console.WriteLine("Event received by Y object.");
    }
  }

  class EventDemo {
    static void Handler() {
      Console.WriteLine("Event received by EventDemo.");
    }

    static void Main() {
      MyEvent evt = new MyEvent();
      X xOb = new X();
      Y yOb = new Y();

      evt.SomeEvent += Handler;
      evt.SomeEvent += xOb.Xhandler;
      evt.SomeEvent += yOb.Yhandler;

      evt.Fire();
      evt.SomeEvent -= xOb.Xhandler;
      evt.Fire();
    }
  }
}
