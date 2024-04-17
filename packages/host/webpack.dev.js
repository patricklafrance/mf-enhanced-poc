// ts-check

import HtmlWebpackPlugin from "html-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import ModuleFederation from "@module-federation/enhanced/webpack";
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const fallbackPlugin = function () {
  return {
    name: 'fallback-plugin',
    errorLoadRemote(args) {
      const fallback = 'fallback';
      return fallback;
    },
  };
};

/** @type {import("webpack").Configuration} */
export default {
    mode: "development",
    target: "web",
    devtool: "inline-source-map",
    devServer: {
        port: 8080,
        historyApiFallback: true,
        hot: true
    },
    entry: "./src/index.js",
    output: {
        // The trailing / is very important, otherwise paths will ne be resolved correctly.
        publicPath: "http://localhost:8080/",
        uniqueName: "host-app"
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "swc-loader"
                }
            },
            {
                // https://stackoverflow.com/questions/69427025/programmatic-webpack-jest-esm-cant-resolve-module-without-js-file-exten
                test: /\.js/,
                resolve: {
                    fullySpecified: false
                }
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: "asset/resource"
            }
        ]
    },
    plugins: [
        new ModuleFederation.ModuleFederationPlugin({
            name: "host",
            remotes: {
                "remote1": "remote1@http://localhost:8081/mf-manifest.json",
                "remote2": "remote2@http://localhost:8082/mf-manifest.json"
            },
            shared: {
                "react": {
                    singleton: true,
                    eager: true
                },
                "react-dom": {
                    singleton: true,
                    eager: true
                }
            },
            runtimePlugins: [require.resolve("./fallbackPlugin.js")]
            // runtimePlugins: [fallbackPlugin()]
            // runtimePlugins: [require.resolve("./myFederationPlugin.js")]
        }),
        new HtmlWebpackPlugin({
            template: "./public/index.html"
        }),
        new ReactRefreshWebpackPlugin()
    ]
};
