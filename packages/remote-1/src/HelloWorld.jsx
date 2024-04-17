import { join } from "lodash";
import { version } from "useless-lib";

console.log(version);

export function HelloWorld() {
    return (
        <div>{join(["Hello", "from", "remote-1"], "-")}</div>
    )
}