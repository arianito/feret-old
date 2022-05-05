import React from "react";
import { useObserver, useService } from "feret";
import { Hello } from "./hello";
import { Test } from "./test";

export function App() {
  useObserver([Hello]);
  const hello = useService(Hello);
  const test = useService(Test);

  return (
    <div>
      {hello.counter}
      <button onClick={() => hello.increment()}>increment</button>
      <button onClick={() => test.show()}>show</button>
    </div>
  );
}
