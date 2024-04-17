import { join } from "lodash";

export function HelloWorld() {
    return (
        <div>{join(["Hello", "from", "remote-1"], "-")}</div>
    )
}