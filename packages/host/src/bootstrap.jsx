import { App } from "./App.jsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { init, loadRemote } from "@module-federation/enhanced/runtime";

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
//             eager: true,
//             version: "18.2.0"
//         },
//         "react-dom": {
//             singleton: true,
//             eager: true,
//             version: "18.2.0"
//         }
//     }
//     // plugins: [fallbackPlugin()]
// });

const { HelloWorld } = loadRemote("remote1/HelloWorld.jsx").catch(() => console.log("failed to load remote 1"));
const { sayHello } = loadRemote("remote2/sayHello.js").catch(() => console.log("failed to load remote 2"));

// ---------------------

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
//   name: '@demo/app-main',
//   remotes: [
//     {
//       name: '@demo/app2',
//       entry: 'http://localhost:3006/remoteEntry.js',
//       alias: 'app2',
//     },
//   ],
//   plugins: [fallbackPlugin()],
// });

// loadRemote('app2/un-existed-module').then((mod) => {
//     console.log(mod);

// //   expect(mod).toEqual('fallback');
// });

// ---------------------

const root = createRoot(document.getElementById("root"));

root.render(
    <StrictMode>
        <>
            <App />
            {HelloWorld && <HelloWorld />}
            {/* <div>{sayHello()}</div> */}
        </>
    </StrictMode>
);
