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

export default function () {
    return {
        name: "custom-share-resolution-strategy-plugin",
        resolveShare(args) {
            log("resolveShare:", args);

            const { shareScopeMap, scope, pkgName, version } = args;

            if (pkgName !== "useless-lib") {
                return args;
            }

            log("[custom-share-resolution-strategy-plugin] resolving useless-lib.");

            args.resolver = () => {
                const defaultResolverResult = shareScopeMap[scope][pkgName][version];
                const entries = Object.values(shareScopeMap[scope][pkgName]);

                // If there's only one version entry, then it means that everyone is requesting the same version
                // of the dependency.
                if (entries.length <= 1) {
                    return defaultResolverResult;
                }

                log("[custom-share-resolution-strategy-plugin] there's more than one requested version for useless-lib.", entries.length, shareScopeMap[scope][pkgName]);

                entries.sort((x, y) => compareVersions(x.version, y.version));

                log("[custom-share-resolution-strategy-plugin] sorted the entries by version", entries);

                const higherVersionEntry = entries[entries.length - 1];

                log("[custom-share-resolution-strategy-plugin] useless-lib higher requested version is", higherVersionEntry.version, higherVersionEntry);

                // The host is always right!
                if (higherVersionEntry.from === "host") {
                    return higherVersionEntry;
                }

                log("[custom-share-resolution-strategy-plugin] useless-lib higher requested version is not from the host.");

                const hostEntry = entries.find(x => x.from === "host");

                // Found nothing, that's odd but let's not break the app for this.
                if (!hostEntry) {
                    log("[custom-share-resolution-strategy-plugin] the host is not requesting any version of useless-lib, aborting.");

                    return higherVersionEntry;
                }

                log("[custom-share-resolution-strategy-plugin] useless-lib version request by the host is", hostEntry.version, hostEntry);

                const [higherVersionMajor] = splitSemver(higherVersionEntry.version);
                const [hostMajor] = splitSemver(hostEntry.version)[0];

                // Major version should always be introduced by the host application.
                if (higherVersionMajor > hostMajor) {
                    log("[custom-share-resolution-strategy-plugin] the major component of higher requested version is higher than the host major version, reverting to the host version.");

                    return hostEntry;
                }
                
                return defaultResolverResult;
            };

            return args;
        }
    }
}