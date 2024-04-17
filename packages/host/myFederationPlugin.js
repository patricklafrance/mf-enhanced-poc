export default function() {
    return {
      name: "my-plugin",
      beforeInit(args) {
        console.log('beforeInit: ', args);
        return args;
      },
      beforeRequest(args) {
        console.log('beforeRequest: ', args);
        return args;
      },
      afterResolve(args) {
        console.log('afterResolve', args);
        return args;
      },
      onLoad(args) {
        console.log('onLoad: ', args);
        return args;
      },
      async loadShare(args) {
        console.log('loadShare:', args);
      },
      async beforeLoadShare(args) {
        console.log('beforeloadShare:', args);
        return args;
      },
      errorLoadRemote({id, error, from, origin}) {
        console.log(id, "offline", error);

        const pg = function () {
          console.log(id, 'offline', error);
          return "FAILED";
        };

        return getModule(pg, from);
      },
    };
}