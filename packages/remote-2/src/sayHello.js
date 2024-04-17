import { join } from "lodash";

export function sayHello() {
    return join(["Hello", "from", "remote-2"], "-");
}