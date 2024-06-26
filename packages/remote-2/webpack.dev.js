// ts-check

import ModuleFederation from "@module-federation/enhanced/webpack";
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** @type {import("webpack").Configuration} */
export default {
    mode: "development",
    target: "web",
    devtool: "inline-source-map",
    entry: "./src/index.js",
    output: {
        publicPath: "http://localhost:8082/",
        uniqueName: "remote2"
    },
    devServer: {
        port: 8082,
        historyApiFallback: true,
        // Otherwise hot reload in the host failed with a CORS error
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        hot: true
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
            name: "remote2",
            filename: "remoteEntry.js",
            exposes: {
              "./sayHello.js": "./src/sayHello.js"
            },
            shared: {
                "lodash": {
                    singleton: true
                },
                "useless-lib": {
                    singleton: true
                }
            }
        })
    ]
};