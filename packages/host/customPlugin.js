/*
This plugin ensure that a script will eargerly timeout if a remote is unavailable. With macOS, this is not an issue as a ERR_CONNECTION_REFUSED is
returned within about 20ms but on Windows, it can takes up to 2500ms.
*/

export default function () {
    return {
        name: "custom-plugin",
        async beforeRequest(args) {
            throw new Error("beforeRequest custom error");

            return args;
        },
        async errorLoadRemote(args) {
            console.log("*********errorLoadRemote", args, args.lifecycle);

            return args;
        },
        createScript({ url }) {
            const element = document.createElement("script");

            // Adding a timestamp to make sure the remote entry points are never cached.
            // View: https://github.com/module-federation/module-federation-examples/issues/566.
            element.src = `${url}?t=${Date.now()}`;
            element.type = "text/javascript";

            return element;
        }
    }
}