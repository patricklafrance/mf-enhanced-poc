# wmf-poc-template

This is a template to create POC related to [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/).

The template contains 3 applications:
- An [host application](./packages/host/)
- A remote module named [remote-1](./packages/remote-1/)
- A remote module named [remote-2](./packages/remote-2/)

## Usage

First install the dependencies with PNPM:

```bash
pnpm install
```

### Development server

To start the application in dev mode (make sure ports 8080, 8081 and 8082 are available):

```bash
pnpm dev
```

Open a browser at http://localhost:8080/.

The remote module entries are available at:
- http://localhost:8081/remoteEntry.js for remote-1
- http://localhost:8082/remoteEntry.js for remote-2

If you prefer to start the application and modules separately:

```bash
cd packages/host
pnpm dev
```

```bash
cd packages/remote-1
pnpm dev
```

```bash
cd packages/remote-2
pnpm dev
```

### Production build

To start the application with production build (make sure ports 8080, 8081 and 8082 are available):

```bash
pnpm serve-build
```

Open a browser at http://localhost:8080/.

The remote module entries are available at:
- http://localhost:8081/remoteEntry.js for remote-1
- http://localhost:8082/remoteEntry.js for remote-2

## Findings

- For React Refresh to work properly, the host application and every remote modules must configure webpack `output.uniqueName` option.

- When using the `init` function from `@module-federation/enhanced/runtime` instead of the webpack `ModuleFederationPlugin` plugin, even if configured, the shared dependencies are not recycled. For example, if the host and a remote needs React `18.2.0`, the dependency will be bundled twice.

- When using webpack `ModuleFederationPlugin` plugin, plugin hooks like `errorLoadRemote` will not be called for remotes that are called with `loadRemote`, it will only be called for remotes called with an `import` statement.

- When using webpack `ModuleFederationPlugin` plugin, `ModuleFederationPlugin` will throw even if `errorLoadRemote` is present and handling the error if the remote is configuration points to a manifest file. If the remote configuration points to `remoteEntry.js` instead, it works fine.

In short, the following works:

```js
remotes: {
    "remote1": "remote1@http://localhost:8081/remoteEntry.js"
}
```

but the following doesn't work:

```js
remotes: {
    "remote1": "remote1@http://localhost:8081/mf-manifest.json"
}
```

```
Error
[ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: [ Federation Runtime ]: Failed to get manifestJson for remote1. The manifest URL is http://localhost:8081/mf-manifest.json. Please ensure that the manifestUrl is accessible.

Error message:

TypeError: Failed to fetch
```

- The best way so far seems to use the `init` function to define the remotes, and webpack `ModuleFederationPlugin` plugin to define the shared dependencies.


