const path = require('path');
const tsImportPluginFactory = require('ts-import-plugin');
const { getLoader } = require('react-app-rewired');
const { updateConfig } = require('react-app-rewire-antd-theme');

const rewireLess = require('react-app-rewire-less');

const themeOptions = {
  antDir: path.join(__dirname, './node_modules/antd-mobile'),
  generateOnce: false,
  indexFileName: 'index.html',
  mainLessFile: path.join(__dirname, './src/index.less'),
  publicPath: '',
  stylesDir: path.join(__dirname, './src/styles'),
  themeVariables: [],
  varFile: path.join(__dirname, './src/styles/variables.less')
}

module.exports = function override(config, env) {
    const tsLoader = getLoader(
        config.module.rules,
        rule =>
            rule.loader &&
            typeof rule.loader === 'string' &&
            rule.loader.includes('ts-loader')
    );

    tsLoader.options = {
        getCustomTransformers: () => ({
            before: [
                tsImportPluginFactory([{
                    libraryDirectory: 'es',
                    libraryName: 'antd-mobile',
                    style: true
                },{
                    libraryDirectory: 'es',
                    libraryName: 'antd',
                    style: true
                }])
            ]
        })
    };

    config = rewireLess.withLoaderOptions({
      javascriptEnabled: true,
      modifyVars: {
          // '@icon-url': '"/iconfont/iconfont"'
      }
    })(config, env);

    config = updateConfig(config, env, themeOptions);
 
    return config;
};