export default function () {
  return {
    name: 'fallback-plugin',
    errorLoadRemote({id, error, from, origin}) {
        console.log("**************** In errorLoadRemote", id, error)

    //   const fallback = 'fallback';
    //   return fallback;
    },
  };
};