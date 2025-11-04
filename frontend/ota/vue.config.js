const { defineConfig } = require("@vue/cli-service");
const backendHostname = process.env.BACKENDHOSTNAME;
const backendPort = process.env.BACKENDPORT;
const SocketHostname = process.env.VUE_APP_SOCKET_HOSTNAME;
const SocketPort = process.env.VUE_APP_SOCKET_PORT;
console.log(`http://${backendHostname}:${backendPort}`, "aaaaaaaaaa");
console.log(`http://${SocketHostname}:${SocketPort}`, "bbbbbbbbbb");
module.exports = defineConfig({
  devServer: {
    proxy: {
      "/backend": {
        target: `http://${backendHostname}:${backendPort}`,
        changeOrigin: true,
        pathRewrite: {
          "^/backend": "",
        },
      },
      "/socket": {
        target: `http://${SocketHostname}:${SocketPort}`,
        changeOrigin: false,
        pathRewrite: {
          "^/socket": "",
        },
        ws: true,
      },
    },
  },
  pluginOptions: {
    vuetify: {},
  },
});
