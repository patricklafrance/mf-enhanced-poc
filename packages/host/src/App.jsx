import { Suspense, useEffect } from "react";
import { join } from "lodash";

export function App() {
    useEffect(() => {
        const loadingElement = document.getElementById("loading");
        loadingElement.style.display = "none";
    }, []);

    return (
        <Suspense fallback={<div>Loading....</div>}>
            <div>{join(["Hello", "from", "host-app"], "-")}</div>
        </Suspense>
    );
}