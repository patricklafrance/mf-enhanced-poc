import { App } from "./App.jsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { init, loadRemote } from "@module-federation/enhanced/runtime";

import { HelloWorld } from "remote1/HelloWorld.jsx";

// const fallbackPlugin = function () {
//   return {
//     name: 'fallback-plugin',
//     errorLoadRemote(args) {
//       const fallback = 'fallback';
//       return fallback;
//     },
//   };
// };

// init({
//     name: "host",
//     remotes: [
//         {
//             name: "remote1",
//             entry: "http://localhost:8081/mf-manifest.json"
//         },
//         {
//             name: "remote2",
//             entry: "http://localhost:8082/mf-manifest.json"
//         }
//     ],
//     shared: {
//         "react": {
//             singleton: true,
//             eager: true
//         },
//         "react-dom": {
//             singleton: true,
//             eager: true
//         },
//         "lodash": {
//             singleton: true,
//             eager: true
//         }
//     }
//     // plugins: [fallbackPlugin()]
// });

// let HelloWorld;

// const module1 = await loadRemote("remote1/HelloWorld.jsx").catch(() => console.log("failed to load remote 1"));
// if (module1) {
//     HelloWorld = module1.HelloWorld;
// }

// let sayHello;

// const module2 = await loadRemote("remote2/sayHello.js").catch(() => console.log("failed to load remote 2"));
// if (module2) {
//     sayHello = module2.sayHello;
// }

const root = createRoot(document.getElementById("root"));

root.render(
    <StrictMode>
        <>
            <App />
            {HelloWorld && <HelloWorld />}
            {/* {sayHello && <div>{sayHello()}</div>} */}
        </>
    </StrictMode>
);
