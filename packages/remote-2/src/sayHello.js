import { join } from "lodash";
import { version } from "useless-lib";

console.log(version);

export function sayHello() {
    return join(["Hello", "from", "remote-2"], "-");
}