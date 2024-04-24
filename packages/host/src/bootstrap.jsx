// @ts-check

import { timeEnd } from "./performance.js";

console.log("************* bootstrap.jsx");

import { App } from "./App.jsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { loadRemote } from "@module-federation/enhanced/runtime";

await loadRemote("remote1/HelloWorld.jsx")
    .then(mod => {
        console.log("Loaded remote 1", mod);
    })
    .catch((error) => console.log("Failed to load remote 1", error));

await loadRemote("remote2/sayHello.js")
    .then(mod => {
        console.log("Loaded remote 2", mod);
    })
    .catch((error) => console.log("Failed to load remote 2", error));

timeEnd();

const root = createRoot(document.getElementById("root"));

root.render(
    <StrictMode>
        <>
            <App />
            {/* {HelloWorld && <HelloWorld />}
            {sayHello && <div>{sayHello()}</div>} */}
        </>
    </StrictMode>
);
