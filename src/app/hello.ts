import { Service, wire, observable } from "feret";
import { Test } from "./test";

@Service
export class Hello {
  @observable counter = 0;
  test = wire(Test);

  increment() {
    this.counter += this.test.page;
  }
}
