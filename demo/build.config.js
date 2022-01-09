({
  baseUrl: './',

  name: 'src/index',
  out: 'main-built.js',

  paths: {
    es6: '../es6',
    babel: '../node_modules/@babel/standalone/babel',
    'babel-plugin-transform-modules-requirejs-babel': '../node_modules/babel-plugin-transform-modules-requirejs-babel/index',
    'lit-html': '../node_modules/lit-html'
  },

  exclude: [
    'babel', 'babel-plugin-transform-modules-requirejs-babel'
  ],

  optimize: 'none',
  generateSourceMaps: true,
  preserveLicenseComments: false,

  pragmasOnSave: {
    excludeBabel: true
  }
})
