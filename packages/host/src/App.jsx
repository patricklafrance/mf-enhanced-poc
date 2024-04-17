import { Suspense } from "react";
import { join } from "lodash";

export function App() {
    return (
        <Suspense fallback={<div>Loading....</div>}>
            <div>{join(["Hello", "from", "host-app"], "-")}</div>
        </Suspense>
    );
}