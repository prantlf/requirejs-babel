# Babel Plugin for RequireJS

[![Latest version](https://img.shields.io/npm/v/requirejs-babel7)
 ![Dependency status](https://img.shields.io/librariesio/release/npm/requirejs-babel7)
](https://www.npmjs.com/package/requirejs-babel7)

A [Babel] loader plugin for [RequireJS]. This is a fork of the [requirejs-babel project] to support [Babel 7]. Look for the support of Babel 5, 6 and 7 in the following NPM modules:

* [Babel 5] - [requirejs-babel]
* [Babel 6] - [requirejs-babel6]
* [Babel 7] - [requirejs-babel7]

## Installation

This module can be installed in your project using [NPM], [PNPM] or [Yarn]. Make sure, that you use [Node.js] version 6 or newer.

```sh
npm i -D requirejs-babel7 @babel/standalone babel-plugin-module-resolver-standalone babel-plugin-amd-checker
pnpm i -D requirejs-babel7 @babel/standalone babel-plugin-module-resolver-standalone babel-plugin-amd-checker
yarn add requirejs-babel7 @babel/standalone babel-plugin-module-resolver-standalone babel-plugin-amd-checker
```

This plugin has been tested to work with `@babel/standalone 7.x`, `babel-plugin-module-resolver-standalone 0.x` and `babel-plugin-amd-checker 0.x`, which are required as peer dependencies.

## Usage

Add the following paths to the RequireJS configuration:

```javascript
paths: {
  es6: 'node_modules/requirejs-babel7/es6',
  babel: 'node_modules/@babel/standalone/babel.min',
  'babel-plugin-module-resolver': 'node_modules/babel-plugin-module-resolver-standalone/index',
  'babel-plugin-amd-checker': 'node_modules/babel-plugin-amd-checker/index'
}
```

Reference ES6 source files files via the `es6!` plugin prefix:

```javascript
define(['es6!your-es6-module'], function (module) {
  // ...
});
```

You can use the ES6 module syntax in modules loaded by the `es6!` plugin including the keyword `import` for loading nested dependencies. The plugin `es6!` has to be used only in the topmost `require` or `define` statement.

This plugin transpiles only ES6 source files. If it detects a statement calling functions `define`, `require` or `require.config` on the root level of the source file, it will return the text of the source file as-is. Source files, which are already AMD modules, are assumed to contain ES5 only.

If you use the RequireJS optimizer `r.js`, you have to exclude Babel with the module-resolver plugin and bundle the `es6`` plugin without the compiling functionality by adding the following to the RequireJS build configuration:

```js
exclude: ['babel', 'babel-plugin-module-resolver', 'babel-plugin-amd-checker'],
pragmasOnSave: {
  excludeBabel: true // removes the transpiling code from es6.js
}
```

See also a [simple demo] project:

```sh
npm start
open http://localhost:8967/demo/normal.html
```

## Advanced

If you are going to use ES6 classes, you will need to add the `external-helpers` plugin and include a script with Babel external helpers. If you are going to use `async`/`await` keywords, you will need to add the `transform-async-to-generator` plugin and include the script with Babel polyfills. Depending on the target web browser, which you need to support, you can enable presets `es2015` (default), `es2016` or `es2017`.

Install `@babel/cli` for generating Babel helpers and polyfills, if you need them:

```sh
npm i -D @babel/cli @babel/core core-js regenerator-runtime
pnpm i -D @babel/cli @babel/core core-js regenerator-runtime
yarn add @babel/cli @babel/core core-js regenerator-runtime
```

Generate a script with Babel helpers:

```sh
babel-external-helpers -t global > babel-helpers.js
```

Generate a script with Babel polyfills (the package `@babel/polyfill` was deprecated), if you need them:

```sh
rollup -p @rollup/plugin-commonjs -p @rollup/plugin-node-resolve \
  -f iife --sourcemap -o babel-polyfills.js babel-polyfills.src.js
```

From the following `babel-polyfills.src.js`:

```js
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

Add the following RequireJS configuration, depending on your supported targets:

```js
config: {
  es6: {
    extraPlugins: ['transform-async-to-generator', 'external-helpers'],
    presets: ['es2015'],
    targets: 'ie 11'
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

The default implementation of `resolveModuleSource` ensures that every JavaScript dependency will be converted:

```js
function (sourcePath) {
  if (sourcePath.indexOf('!') < 0) {
    return 'es6!' + sourcePath;
  }
}
```

Before you load the main application module by `require`, make sure, that you included Babel helpers and polyfills, if you need them. For example:

```html
<script src="babel-polyfills.js"></script>
<script src="babel-helpers.js"></script>
```

See also an [advanced demo] project:

```sh
npm start
open http://localhost:8967/demo-polyfill/normal.html
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Lint and test your code.

## License

Copyright (c) 2015-2019 Mykhailo Kachanovskyi<br>
Copyright (c) 2019-2022 Ferdinand Prantl

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
[PNPM]: https://pnpm.io/
[Yarn]: https://yarnpkg.com/
[simple demo]: https://github.com/prantlf/requirejs-babel/tree/master/demo
[advanced demo]: https://github.com/prantlf/requirejs-babel/tree/master/demo
[babel.transform]: https://babeljs.io/docs/en/babel-core#transform
[options]: https://babeljs.io/docs/en/options
[mandatory plugins]: https://github.com/prantlf/requirejs-babel/blob/master/es6.js#L48
[default module name resolution]: https://github.com/prantlf/requirejs-babel/blob/master/es6.js#L38
[resolvePath]: https://github.com/tleunen/babel-plugin-module-resolver/blob/master/DOCS.md#resolvepath
