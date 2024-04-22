// @ts-check

import { timeEnd } from "./performance.js";

console.log("************* bootstrap.jsx");

import { App } from "./App.jsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { loadRemote } from "@module-federation/enhanced/runtime";

loadRemote("remote1/HelloWorld.jsx")
    .then(mod => {
        console.log("Loaded remote 1", mod);
    })
    .catch(() => console.log("Failed to load remote 1"));

loadRemote("remote2/sayHello.js")
    .then(mod => {
        console.log("Loaded remote 2", mod);
    })
    .catch(() => console.log("Failed to load remote 2"));

const root = createRoot(document.getElementById("root"));

timeEnd();

root.render(
    <StrictMode>
        <>
            <App />
            {/* {HelloWorld && <HelloWorld />}
            {sayHello && <div>{sayHello()}</div>} */}
        </>
    </StrictMode>
);
