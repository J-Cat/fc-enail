/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line no-undef
const CracoLessPlugin = require('craco-less');

// eslint-disable-next-line no-undef
module.exports = {
  eslint: {
    enable: false
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            // modifyVars: { '@primary-color': '#1DA57A' },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
