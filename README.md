# Babel Plugin for RequireJS

[![NPM version](https://badge.fury.io/js/requirejs-babel7.png)](http://badge.fury.io/js/requirejs-babel7)
[![Build Status](https://travis-ci.org/prantlf/requirejs-babel.png)](https://travis-ci.org/prantlf/requirejs-babel)
[![devDependency Status](https://david-dm.org/prantlf/requirejs-babel/dev-status.svg)](https://david-dm.org/prantlf/requirejs-babel#info=devDependencies)

[![NPM Downloads](https://nodei.co/npm/requirejs-babel7.png?downloads=true&stars=true)](https://www.npmjs.com/package/requirejs-babel7)

A [Babel] loader plugin for [RequireJS]. This is a fork of the [requirejs-babel project] to support [Babel 7]. Look for the support of Babel 5, 6 and 7 in the following NPM modules:

* [Babel 5] - [requirejs-babel]
* [Babel 6] - [requirejs-babel6]
* [Babel 7] - [requirejs-babel7]

## Installation

This module can be installed in your project using [NPM] or [Yarn]. Make sure, that you use [Node.js] version 6 or newer.

```sh
npm install --save-dev requirejs-babel7 @babel/standalone babel-plugin-module-resolver-standalone
```

```sh
yarn add requirejs-babel7 @babel/standalone babel-plugin-module-resolver-standalone
```

This plugin has been tested to work with `@babel/standalone 7.x` and `babel-plugin-module-resolver-standalone 0.x`, which are required as peer dependencies.

## Usage

Add the following paths to the RequireJS configuration:

```javascript
paths: {
  es6: 'node_modules/requirejs-babel7/es6',
  babel: 'node_modules/@babel/standalone/babel.min',
  'babel-plugin-module-resolver': 'node_modules/babel-plugin-module-resolver-standalone/index'
}
```

Reference ES6 source files files via the `es6!` plugin prefix:

```javascript
define(['es6!your-es6-module'], function (module) {
  // ...
});
```

You can use the ES6 module syntax in modules loaded by the `es6!` plugin including the keyword `import` for loading nested dependencies.

If you use the RequireJS optimizer `r.js`, you have to exclude Babel with the module-resolver plugin and bundle the requirejs-babel7 plugin without the compiling functionality by adding the following to the RequireJS build configuration:

```json
exclude: ['babel', 'babel-plugin-module-resolver'],
pragmasOnSave: {
  excludeBabel: true
}
```

See also a [simple demo] project:

```sh
npm start
open http://localhost:8967/demo/normal.html
```

## Advanced

If you are going to use ES6 classes, you will need to add the `external-helpers` plugin and include a script with Babel external helpers. If you are going to use `async`/`await` keywords, you will need to add the `transform-async-to-generator` plugin and include the script with Babel polyfills. Depending on the target web browser, which you need to support, you can enable presers `es2015` (default), `es2016` or `es2017`.

Install `@babel/cli` for generating Babel helpers and `@babel/polyfill`, if you need it:

```sh
npm install --save-dev @babel/cli @babel/core @babel/polyfill
```

```sh
yarn add @babel/cli @babel/core @babel/polyfill
```

Generate a script with Babel helpers:

```sh
babel-external-helpers -t var > babel-helpers.js
```

Add the following RequireJS configuration:

```js
config: {
  es6: {
    extraPlugins: ['transform-async-to-generator', 'external-helpers'],
    presets: ['es2015']
  }
}
```

You can use any [options] of [babel.transform] for configuring the `es6` plugin. Use the `extraPlugins` key not to replace [mandatory plugins] added by `es6!`. You can customize the [default module name resolution] with the `resolveModuleSource` key (see [resolvePath] for more information) to transpile only modules with a special file extension:

```js
// import * from 'es5module.js'  -> define(['es5module])
// import * from 'es6module.mjs' -> define(['es6!es6module])
fileExtension: '.mjs',
resolveModuleSource: function (sourcePath, currentFile, opts) {
  if (sourcePath.indexOf('!') < 0) {
    var lengthWithoutExtension = sourcePath.length - 3
    if (sourcePath.lastIndexOf('.js') === lengthWithoutExtension) {
      return sourcePath.substr(0, lengthWithoutExtension)
    }
    --lengthWithoutExtension
    if (sourcePath.lastIndexOf('.mjs') === lengthWithoutExtension) {
      return 'es6!' + sourcePath.substr(0, lengthWithoutExtension)
    }
  }
}
```

Before you load the main application module by `require`, make sure, that you included babel helpers and Babe polyfills, if you need it. For example:

```html
<script src="node_modules/@babel/polyfill/dist/polyfill.js"></script>
<script src="babel-helpers.js"></script>
```

See also an [advanded demo] project:

```sh
npm start
open http://localhost:8967/demo-polyfill/normal.html
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality.

## License

Copyright (c) 2019 Ferdinand Prantl

Licensed under the MIT license.

[Babel]: https://babeljs.io/
[Babel 5]: https://babeljs.io/blog/2015/03/31/5.0.0
[Babel 6]: https://babeljs.io/blog/2015/10/29/6.0.0
[Babel 7]: https://babeljs.io/blog/2018/08/27/7.0.0
[RequireJS]: http://requirejs.org
[requirejs-babel project]: https://github.com/mikach/requirejs-babel
[requirejs-babel]: https://www.npmjs.com/package/requirejs-babel
[requirejs-babel6]: https://www.npmjs.com/package/requirejs-babel6
[requirejs-babel7]: https://www.npmjs.com/package/requirejs-babel7
[@babel/standalone]: https://github.com/babel/babel/tree/master/packages/babel-standalone
[Node.js]: http://nodejs.org/
[NPM]: https://www.npmjs.com/
[Yarn]: https://yarnpkg.com/
[simple demo]: https://github.com/prantlf/requirejs-babel/tree/master/demo]
[advanded demo]: https://github.com/prantlf/requirejs-babel/tree/master/demo]
[babel.transform]: https://babeljs.io/docs/en/babel-core#transform
[options]: https://babeljs.io/docs/en/options
[mandatory plugins]: https://github.com/prantlf/requirejs-babel/blob/master/es6.js#L48
[default module name resolution]: https://github.com/prantlf/requirejs-babel/blob/master/es6.js#L38
[resolvePath]: https://github.com/tleunen/babel-plugin-module-resolver/blob/master/DOCS.md#resolvepath
