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
      beforeInit(args) {
        console.log("Initiating MF");

        // const loadingElement = document.getElementById("loading");
        // loadingElement.style.display = "block";

        return args;
      },
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