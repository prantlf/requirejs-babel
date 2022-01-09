({
  baseUrl: './',

  name: 'src/index',
  out: 'main-built.js',

  paths: {
    es6: '../es6',
    babel: '../node_modules/@babel/standalone/babel',
    'babel-plugin-module-resolver': '../node_modules/babel-plugin-module-resolver-standalone/index',
    'babel-plugin-amd-checker': '../node_modules/babel-plugin-amd-checker/index',
    'babel-plugin-amd-default-export': '../node_modules/babel-plugin-amd-default-export/index',
    'lit-html': '../node_modules/lit-html'
  },

  exclude: [
    'babel', 'babel-plugin-module-resolver',
    'babel-plugin-amd-checker', 'babel-plugin-amd-default-export'
  ],

  optimize: 'none',
  generateSourceMaps: true,
  preserveLicenseComments: false,

  pragmasOnSave: {
    excludeBabel: true
  }
})
