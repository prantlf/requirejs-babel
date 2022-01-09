({
  baseUrl: './',

  name: 'src/index',
  out: 'main-built.js',

  paths: {
    es6: '../es6',
    babel: '../node_modules/@babel/standalone/babel',
    'babel-plugin-transform-modules-requirejs-babel': '../node_modules/babel-plugin-transform-modules-requirejs-babel/index'
  },

  config: {
    es6: {
      extraPlugins: ['transform-async-to-generator', 'external-helpers'],
      presets: ['es2015'],
      targets: 'ie 11'
    }
  },

  exclude: [
    'babel', 'babel-plugin-transform-modules-requirejs-babel'
  ],

  optimize: 'uglify2',
  generateSourceMaps: true,
  preserveLicenseComments: false,

  pragmasOnSave: {
    excludeBabel: true
  }
})
