import { Service, wire } from "feret";
import { Hello } from "./hello";

@Service
export class Test {
  page = 2;
  hello = wire(Hello);

  show() {
    alert(this.hello.counter);
  }
}
