# Observations for Zack Jackson

## Import `ModuleFederationPlugin`

The [documentation](https://module-federation.io/guide/basic/webpack.html#register-the-plugin) mentions to import the plugin as follow:

```js
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';
```

However, it cause the following error:

```bash
SyntaxError: Named export 'ModuleFederationPlugin' not found. The requested module '@module-federation/enhanced/webpack' is a CommonJS module, which may not support all module.exports as named exports.

CommonJS modules can always be imported via the default export, for example using:

import pkg from '@module-federation/enhanced/webpack';
const { ModuleFederationPlugin } = pkg;
```

The following syntax will work thought:

```js webpack.config.js
import ModuleFederation from "@module-federation/enhanced/webpack";

new ModuleFederation.ModuleFederationPlugin({
    name: "host",
    ...
})
```

## `errorLoadRemote` and `mf-manifest.json`

When a runtime plugin is configured with the `init` function, and the remote is configured with `mf-manifest.json` as a remote entry, the `errorLoadRemote` hook is called as expected when an attempt to load the remote is done with `loadRemote` and it fails:

```js bootstrap.jsx
init({
    name: "host",
    remotes: [
        {
            name: "remote1",
            entry: "http://localhost:8081/mf-manifest.json"
        }
    ],
    plugins: [{
        name: "test-plugin",
        errorLoadRemote: ({ id }) => {
            console.log(`Error loading remote: ${id}`)
        }
    }]
});

// remote1 is currently offline
loadRemote("remote1/HelloWorld.jsx").then(mod => console.log("Module loaded!", mod));
```

When a runtime plugin is configured with the webpack `ModuleFederationPlugin` plugin, and the remote is configured with `remoteEntry.js` as a remote entry, the `errorLoadRemote` hook is called as expected when an attempt to load the remote is done with an `import` statement and it fails:

```js offlineRemotePlugin.js
export default function () {

    const getErrorMessage = (id, error) => `remote ${id} is offline due to error: ${error}`;
  
    const getModule = (pg, from) => {
      if (from === 'build') {
        return () => ({
          __esModule: true,
          default: pg,
        });
      } else {
        return {
          default: pg,
        };
      }
    };
  
    return {
      name: 'offline-remote-plugin',
      errorLoadRemote({id, error, from, origin}) {
        console.error(id, 'offline');
        const pg = function () {
          console.error(id, 'offline', error);
          return getErrorMessage(id, error);
        };
  
        return getModule(pg, from);
      },
    };
  }
```

```js webpack.config.js
import ModuleFederation from "@module-federation/enhanced/webpack";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

new ModuleFederation.ModuleFederationPlugin({
    name: "host",
    remotes: {
        "remote1": "remote1@http://localhost:8081/remoteEntry.js"
    },
    runtimePlugins: [require.resolve("./offlineRemotePlugin.js")]
})
```

```js bootstrap.tsx
// remote1 is currently offline.
import { HelloWorld } from "remote1/HelloWorld.jsx";
```

It also works as expected with `ModuleFederationPlugin` when there's a failed attempt to load an offline remote with `loadRemote`:

```js
loadRemote("remote1/HelloWorld.jsx").then(mod => console.log("Module loaded!", mod));
```

However, when using ``ModuleFederationPlugin` and the remote is configured with `mf-manifest.json` as an entry point, the `errorLoadRemote` hook is NOT called:

```js webpack.config.js
import ModuleFederation from "@module-federation/enhanced/webpack";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

new ModuleFederation.ModuleFederationPlugin({
    name: "host",
    remotes: {
        "remote1": "remote1@http://localhost:8081/mf-manifest.json"
    },
    runtimePlugins: [require.resolve("./offlineRemotePlugin.js")]
})
```

Instead, the application crash with the following error:

```bash
[ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: Failed to get manifestJson for remote1. The manifest URL is http://localhost:8081/mf-manifest.json. Please ensure that the manifestUrl is accessible.

Error message:

TypeError: Failed to fetch
```

## Configuring a runtime plugin with `ModuleFederationPlugin`

Strangely, the only way to configure a runtime plugin with webpack `ModuleFederationPlugin` plugin, seems to be by using `require.resolve`:

```js webpack.config.js
new ModuleFederation.ModuleFederationPlugin({
    runtimePlugins: [require.resolve("./offlineRemotePlugin.js")]
})
```

```js offlineRemotePlugin.js
export default function () {

    const getErrorMessage = (id, error) => `remote ${id} is offline due to error: ${error}`;
  
    const getModule = (pg, from) => {
      if (from === 'build') {
        return () => ({
          __esModule: true,
          default: pg,
        });
      } else {
        return {
          default: pg,
        };
      }
    };
  
    return {
      name: 'offline-remote-plugin',
      errorLoadRemote({id, error, from, origin}) {
        console.error(id, 'offline');
        const pg = function () {
          console.error(id, 'offline', error);
          return getErrorMessage(id, error);
        };
  
        return getModule(pg, from);
      },
    };
  }
```

The following will fail:

```js
import offlineRemotePlugin from "./offlineRemotePlugin.js";

new ModuleFederation.ModuleFederationPlugin({
    runtimePlugins: [offlineRemotePlugin]
})
```

```bash
[webpack-cli] Invalid options object. Module Federation Plugin has been initialized using an options object that does not match the API schema.
 - options.runtimePlugins[0] should be one of these:
   non-empty string | object { import, async }
   Details:
    * options.runtimePlugins[0] should be a non-empty string.
      -> Runtime Plugin File Path.
    * options.runtimePlugins[0] should be an object:
      object { import, async }
```

The following will also fail:

```js
import offlineRemotePlugin from "./offlineRemotePlugin.js";

new ModuleFederation.ModuleFederationPlugin({
    runtimePlugins: [offlineRemotePlugin()]
})
```

```bash
[webpack-cli] Invalid options object. Module Federation Plugin has been initialized using an options object that does not match the API schema.
 - options.runtimePlugins[0] should be one of these:
   non-empty string | object { import, async }
   Details:
    * options.runtimePlugins[0] has an unknown property 'name'. These properties are valid:
      object { import, async }
    * options.runtimePlugins[0] has an unknown property 'errorLoadRemote'. These properties are valid:
      object { import, async }
    * options.runtimePlugins[0] misses the property 'import'. Should be:
      non-empty string
      -> Runtime Plugin File Path.
    * options.runtimePlugins[0] misses the property 'async'. Should be:
      boolean
```

The following will also fail:

```js webpack.config.js
new ModuleFederation.ModuleFederationPlugin({
    runtimePlugins: [{
        name: "test-plugin",
        errorLoadRemote: () => {
            console.log("error loading remote!")
        }     
    }]
})
```

```bash
[webpack-cli] Invalid options object. Module Federation Plugin has been initialized using an options object that does not match the API schema.
 - options.runtimePlugins[0] should be one of these:
   non-empty string | object { import, async }
   Details:
    * options.runtimePlugins[0] has an unknown property 'name'. These properties are valid:
      object { import, async }
    * options.runtimePlugins[0] has an unknown property 'errorLoadRemote'. These properties are valid:
      object { import, async }
    * options.runtimePlugins[0] misses the property 'import'. Should be:
      non-empty string
      -> Runtime Plugin File Path.
    * options.runtimePlugins[0] misses the property 'async'. Should be:
      boolean
```

## `init` and shared singleton dependency version resolution

We talked in January about an issue I was having with MF 1.0:

>We found out that with our current implementation using "dynamic remote containers", if the "host" application define the "foo" dependency as a shared singleton, if a "remote" application also define the "foo" dependency as a shared singleton dependency but has an higher version installed, it's always the "host" application version of "foo" that will be loaded.
>
>For example:
>
>"host" has "foo" v2.0.0 installed
"remote" has "foo" v2.1.0 installed
>
>"foo" v2.0.0 will be loaded instead of v2.1.0.

You mentioned the following:

> the issue is init takes two args

> init(shareScope[name], [promises])

> promises, is all the other remotes who are also await init(scope, promises)

> calling init manually, we can only init what is known at point of initialization, and with no promise, app will "seal" soon as its done. new remotes added, previous layer is "sealed" and cannot see any new share scope as containers cannot re-init otherwise you overwrite memory references that are in use, like host already iused lib

> host didnt know about remote to wait for init, theres no remote, so it get dep itself. then you init remote but host sealed already and you can only add on, to future containers

> but with v1 - there is no good solution that is worth the work to try and implement

> But /enhanced or rspack - you get the runtime hooks

> and then you get {init,loadRemote,loadShare} methods

> with that - you dont need a federation plugin in the build

> the plugin just inits the runtime, if you use the runtime library, youre the plugin - within limits.

So I tried with `init` and `loadRemote` but I still get the same issue, the host version still always takes precedence over the remote version. Is there anything I should be aware of?

I went through this with Yokota on the MF Discord channel: https://discord.com/channels/1055442562959290389/1230213882061262909/1230243060848398539

The main reason we went with "dynamic remote containers" with MF 1.0 was to gracefully support offline remotes. Now with MF 1.5, we can go back to `ModuleFederationPlugin` and use the `errorLoadRemote` hook to gracefully handle offline remotes. However, there is still an issue... When at least one remote is offline, it seems like `ModuleFederationPlugin` takes longer to resolve the initial shared dependencies and my users are stucked with a blank screen for 4-5 seconds. Is there a way to circumvent this issue?


