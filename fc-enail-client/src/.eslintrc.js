// .eslintrc.js
'use strict';

const baseConfig = require('eslint-config-react-app');
const baseOverrides = Array.isArray(baseConfig.overrides) ? baseConfig.overrides : [baseConfig.overrides];
const baseTsOverride = baseOverrides.find(x => x.files.find(f => f.indexOf('*.ts') > 0));

module.exports = {
    ...baseConfig,
    overrides: [
        {
            ...baseTsOverride,
            rules: {
                ...baseTsOverride.rules,

                // Remove with next npm release of eslint-config-react-app:
                'default-case': 'off',
                'no-useless-constructor': 'off',
                '@typescript-eslint/no-useless-constructor': 'warn',
                'no-dupe-class-members': 'off',

                // my rules
                '@typescript-eslint/no-namespace': 'warn'
            },
        }
    ],
    rules: {
        ...baseConfig.rules,
    },
};