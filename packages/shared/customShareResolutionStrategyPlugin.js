/*
This custom share dependency resolution strategy ensure that only the host app can ask for a new major version of a library.
Otherwise, any remote can request for an higher non-major version.

Examples:

host:        2.0     
remote-1:    2.1   <-----       
remote-2:    2.0

host:        2.0   <-----  
remote-1:    3.1     
remote-2:    2.0

host:        2.0    
remote-1:    3.1     
remote-2:    2.1   <----- 

host:       >2.0    
remote-1:    3.1     
remote-2:    2.1   <----- 
*/

import { parse, minVersion, rcompare } from "semver";

const isDebug = false;

function log(...args) {
    if (isDebug) {
        console.log(...args);
    }
}

function findHighestVersionForMajor(entries, major) {
    return entries.find(x => {
        return parse(x.version).major === major;
    });
}

export default function () {
    return {
        name: "custom-share-resolution-strategy-plugin",
        // async beforeRequest(args) {
        //     console.log("***** beforeRequest", args);

        //     const { origin } = args;

        //     origin.loaderHook.lifecycle.fetch.emit = (url, fetchOptions) => {
        //         console.log("*********** fetching: ", url);

        //         return new Promise((resolve) => {
        //             fetch(url, fetchOptions)
        //                 .then((...args) => {
        //                     resolve(...args);
        //                 })
        //                 .catch("********* HEY HO IT FAILED");
        //         });
        //     };

        //     // origin.loaderHook.lifecycle.fetch = 

        //     return args;
        // },
        // createScript(args) {
        //     console.log("***** createScript", args);

        //     const { url } = args;

        //     const element = document.createElement("script");

        //     // Adding a timestamp to make sure the remote entry points are never cached.
        //     // View: https://github.com/module-federation/module-federation-examples/issues/566.
        //     element.src = `${url}?t=${Date.now()}`;
        //     element.type = "text/javascript";
        //     element.async = true;
            
        //     element.onerror = error => {
        //         console.log("************************* failed to load:", url, error);
        //     };

        //     return element;
        // },
        // errorLoadRemote(args) {
        //     console.log("************** errorLoadRemote", args);

        //     return args;
        // },
        resolveShare(args) {
            const { shareScopeMap, scope, pkgName, version } = args;

            log(`[custom-share-resolution-strategy-plugin] resolving ${pkgName}:`, args);

            // This custom strategies only applies to singleton shared dependencies.
            const entries = Object.values(shareScopeMap[scope][pkgName]).filter(x => x.shareConfig.singleton);

            // Not a singleton dependency.
            if (entries.length === 0) {
                log(`[custom-share-resolution-strategy-plugin] ${pkgName} is not a singleton dependency, aborting.`);

                return args;
            }

            // If there's only one version entry, then it means that everyone is requesting the same version
            // of the dependency.
            if (entries.length <= 1) {
                log(`[custom-share-resolution-strategy-plugin] there's only one version requested for ${pkgName}, resolving to:`, entries[0].version, entries[0]);

                return args;
            }

            args.resolver = () => {
                log(`%c[custom-share-resolution-strategy-plugin] there's more than one requested version for ${pkgName}:`, "color: black; background-color: yellow;", entries.length, shareScopeMap[scope][pkgName],);

                const cleanedEntries = entries.map(x => ({
                    ...x,
                    // Removing any special characters like >,>=,^,~ etc...
                    version: minVersion(x.version).version
                }));

                // From higher to lower versions.
                const sortedEntries = cleanedEntries.sort((x, y) => rcompare(x.version, y.version));

                log("[custom-share-resolution-strategy-plugin] sorted the entries by version from higher to lower", sortedEntries);

                const highestVersionEntry = sortedEntries[0];

                log(`[custom-share-resolution-strategy-plugin] ${pkgName} highest requested version is`, highestVersionEntry.version, highestVersionEntry);

                // The host is always right!
                if (highestVersionEntry.from === "host") {
                    log(`%c[custom-share-resolution-strategy-plugin] this is the host version, great, resolving to:`, "color: black; background-color: yellow;", highestVersionEntry.version, highestVersionEntry);

                    return highestVersionEntry;
                }

                log(`[custom-share-resolution-strategy-plugin] ${pkgName} highest requested version is not from the host.`);

                const hostEntry = sortedEntries.find(x => x.from === "host");

                // Found nothing, that's odd but let's not break the app for this.
                if (!hostEntry) {
                    log(`%c[custom-share-resolution-strategy-plugin] the host is not requesting any version of ${pkgName}, aborting.`, "color: black; background-color: yellow;");

                    return highestVersionEntry;
                }

                log(`[custom-share-resolution-strategy-plugin] ${pkgName} version requested by the host is:`, hostEntry.version, hostEntry);

                const parsedHighestVersion = parse(highestVersionEntry.version);
                const parsedHostVersion = parse(hostEntry.version);

                // Major versions should always be introduced by the host application.
                if (parsedHighestVersion.major > parsedHostVersion.major) {
                    log("[custom-share-resolution-strategy-plugin] the major number of the highest requested version is higher than the major number of the version requested by the host, looking for another version to resolve to.");

                    // Start at the second entry since the first entry is the current higher version entry.
                    // The result could either be the actual host entry or any other entry that is higher than the version requested
                    // by the host, but match the host entry major version number.
                    const fallbackEntry = findHighestVersionForMajor(sortedEntries.splice(1), parsedHostVersion.major);

                    log(`%c[custom-share-resolution-strategy-plugin] the highest requested version for ${pkgName} that is in-range with the requested host major version number is:`, "color: black; background-color: yellow;", fallbackEntry.version, fallbackEntry);
                    log(`%c[custom-share-resolution-strategy-plugin] reverting to:`, "color: black; background-color: yellow;", fallbackEntry.version);

                    return fallbackEntry;
                }
                
                return shareScopeMap[scope][pkgName][version];
            };

            return args;
        }
    }
}