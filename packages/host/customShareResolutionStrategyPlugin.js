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
*/

import { compareVersions } from "compare-versions";

const isDebug = true;

function log(...args) {
    if (isDebug) {
        console.log(...args);
    }
}

function splitSemver(semver) {
    return semver.split(".");
}

function findHighestVersionForMajor(entries, major) {
    return entries.find(x => {
        return splitSemver(x.version)[0] === major;
    });
}

export default function () {
    return {
        name: "custom-share-resolution-strategy-plugin",
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
                log(`[custom-share-resolution-strategy-plugin] there's more than one requested version for ${pkgName}:`, entries.length, shareScopeMap[scope][pkgName]);

                // From higher to lower versions.
                const sortedEntries = entries
                    .toSorted((x, y) => compareVersions(x.version, y.version))
                    .reverse();

                log("[custom-share-resolution-strategy-plugin] sorted the entries by version", sortedEntries);

                const higherVersionEntry = sortedEntries[0];

                log(`[custom-share-resolution-strategy-plugin] ${pkgName} higher requested version is`, higherVersionEntry.version, higherVersionEntry);

                // The host is always right!
                if (higherVersionEntry.from === "host") {
                    log(`[custom-share-resolution-strategy-plugin] this is the host version, great, resolving to:`, higherVersionEntry.version, higherVersionEntry);

                    return higherVersionEntry;
                }

                log(`[custom-share-resolution-strategy-plugin] ${pkgName} higher requested version is not from the host.`);

                const hostEntry = sortedEntries.find(x => x.from === "host");

                // Found nothing, that's odd but let's not break the app for this.
                if (!hostEntry) {
                    log(`[custom-share-resolution-strategy-plugin] the host is not requesting any version of ${pkgName}, aborting.`);

                    return higherVersionEntry;
                }

                log(`[custom-share-resolution-strategy-plugin] ${pkgName} version request by the host is:`, hostEntry.version, hostEntry);

                const [higherVersionMajor] = splitSemver(higherVersionEntry.version);
                const [hostMajor] = splitSemver(hostEntry.version)[0];

                // Major versions should always be introduced by the host application.
                if (higherVersionMajor > hostMajor) {
                    // log("[custom-share-resolution-strategy-plugin] the major number of the higher requested version is higher than the host major version number, reverting to the host version.");
                    
                    log("[custom-share-resolution-strategy-plugin] the major number of the higher requested version is higher than the major version number of the version requested by the host, looking for another version to resolve to.");

                    // Start at the second entry since the first entry is the current higher version entry.
                    // The result could be either be the actual host entry or any other entry that is higher than the version requested
                    // by the host, but match the host entry major version number.
                    const fallbackEntry = findHighestVersionForMajor(sortedEntries.splice(1), hostMajor);

                    log(`[custom-share-resolution-strategy-plugin] the highest request version for ${pkgName} that is in-range with the requested host major version number is:`, fallbackEntry.version, fallbackEntry);
                    log(`[custom-share-resolution-strategy-plugin] reverting to:`, fallbackEntry.version);

                    return fallbackEntry;
                }
                
                return shareScopeMap[scope][pkgName][version];
            };

            return args;
        }
    }
}