// config-overrides.js
const {
    override,
    // useEslintRc,
    disableEsLint,
    addLessLoader
} = require('customize-cra');

module.exports = override(
    // useEslintRc(),
    disableEsLint(),
    addLessLoader()
);