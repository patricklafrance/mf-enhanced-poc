export default function () {
  return {
    name: 'fallback-plugin',
    errorLoadRemote(args) {
        console.log("**************** In errorLoadRemote")

      const fallback = 'fallback';
      return fallback;
    },
  };
};