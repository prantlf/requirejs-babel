# Babel Plugin for RequireJS

[![Latest version](https://img.shields.io/npm/v/requirejs-babel7)
 ![Dependency status](https://img.shields.io/librariesio/release/npm/requirejs-babel7)
](https://www.npmjs.com/package/requirejs-babel7)

A [Babel] loader plugin for [RequireJS]. This is a fork of the [requirejs-babel project] to support [Babel 7]. Look for the support of Babel 5, 6 and 7 in the following NPM modules:

* [Babel 5] - [requirejs-babel]
* [Babel 6] - [requirejs-babel6]
* [Babel 7] - [requirejs-babel7]

More complicated RequireJS projects which mix ESM with AMD modules will need to replace official AMD module wrapping plugin ([`@babel/plugin-transform-modules-amd`]) with the specialised  [`babel-plugin-transform-modules-requirejs-babel`].

The official [RequireJS optimizer] (`r.js`) does not wire up source maps from the original (not transpiled) sources to the source map of the output bundle. It makes using Babel or other transpilers unfeasible for serious work. If you want the proper support for source maps, replace the official optimizer package ([`requirejs`]) with the forked [`@prantlf/requirejs`], which is fixed.

If you do not need to transpile the code to an earlier ECMAScript version, have a look at [requirejs-esm]. It converts only the module format from ESM to AMD; it does not transpile the language and that is why it is a lot faster than plugithis n using [Babel].

## Installation

This module can be installed in your project using [NPM], [PNPM] or [Yarn]. Make sure, that you use [Node.js] version 6 or newer.

```sh
npm i -D requirejs-babel7 @babel/standalone babel-plugin-transform-modules-requirejs-babel
pnpm i -D requirejs-babel7 @babel/standalone babel-plugin-transform-modules-requirejs-babel
yarn add requirejs-babel7 @babel/standalone babel-plugin-transform-modules-requirejs-babel
```

This plugin has been tested to work with `@babel/standalone 7.x`, `babel-plugin-transform-modules-requirejs-babel 0.x`, which are required as peer dependencies.

## Usage

Add the following paths to the RequireJS configuration:

```javascript
paths: {
  es6: 'node_modules/requirejs-babel7/es6',
  babel: 'node_modules/@babel/standalone/babel.min',
  'babel-plugin-transform-modules-requirejs-babel': 'node_modules/babel-plugin-transform-modules-requirejs-babel/index'
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

If you use the RequireJS optimizer `r.js`, you have to exclude Babel with the `babel-plugin-transform-modules-requirejs-babel` plugin and bundle the `es6` plugin without the compiling functionality by adding the following to the RequireJS build configuration:

```js
exclude: [
  'babel', 'babel-plugin-transform-modules-requirejs-babel'
],
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

Install `@babel/cli` for generating Babel helpers, if you need them:

```sh
npm i -D @babel/cli @babel/core
pnpm i -D @babel/cli @babel/core
yarn add @babel/cli @babel/core
```

If you need the polyfills, you can use [babel-polyfills-generator]; the [@babel/polyfill] package was deprecated:

```sh
npm i -D babel-polyfills-generator core-js regenerator-runtime
pnpm i -D babel-polyfills-generator core-js regenerator-runtime
yarn add babel-polyfills-generator core-js regenerator-runtime
```

Generate a script with Babel helpers, if you need them:

```sh
babel-external-helpers -t global > babel-helpers.js
```

Generate a script with Babel polyfills, if you need them:

```sh
generate-babel-polyfills demo-polyfill
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
resolveModuleSource: function (sourcePath, currentFile, options, originalResolvePath) {
  // Ignore paths with other plugins applied and the three built-in
  // pseudo-modules of RequireJS.
  if (sourcePath.indexOf('!') < 0 && sourcePath !== 'require' &&
      sourcePath !== 'module' && sourcePath !== 'exports') {
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
<script src="babel-polyfills.min.js"></script>
<script src="babel-helpers.min.js"></script>
```

See also an [advanced demo] project:

```sh
npm start
open http://localhost:8967/demo-polyfill/normal.html
```

## Options

The `es6` plugin supports configuration with the following defaults, other recognised options are [documented for Babel transform]:

```js
{
  es6: {
    // Babel plugins to insert before the plugins added by the `es6` RequireJS plugin.
    extraPlugins: [],
    // Update paths of module dependencies.
    resolveModuleSource: func, // see above
    // Allow using a different plugin alias than `es6` in the source code.
    pluginName: 'es6',
    // The file extension of source files transformed by Babel.
    fileExtension: '.js',
    // Skip modules already in the AMD format without trying to parse them.
    // Module prefixes like "lib/vendor/" are accepted too. Skipped modules
    // must have all their deep dependencies already transformed.
    skipModules: [],
    // Enforce transpiling even if a optimized module has been loaded.
    mixedAmdAndEsm: false,
    // Suppress transpiling even if an optimized module has not been loaded yet.
    onlyAmd: false,
    // Enable minification using `babel-preset-minify`.
    minified: false
  }
}
```

Other options can be passed among the optimiser's options:

```js
{
  // Enable minification using `babel-preset-minify`.
  minify: false
}
```

If you want to enable Babel minification by one of the flags above, you need to install the NPM module `babel-preset-minify`.

## API

The transformation applied by the plugin can be performed programmatically too.

```js
const { transform } = require('requirejs-babel7/api')
const code = transform('import a from "a"', 'test', { sourceMap: true })
```

The `transform` method supports a subset of plugin options:

```js
{
  es6: {
    // Babel plugins to insert before the plugins added by the `es6` RequireJS plugin.
    extraPlugins: [],
    // Update paths of module dependencies.
    resolveModuleSource: func, // see above
    // Allow using a different plugin alias than `es6` in the source code.
    pluginName: 'es6',
    // The file extension of source files transformed by Babel.
    fileExtension: '.js',
    // Enable adding an inline source map to the code output.
    sourceMap: false,
    // Enable minification using `babel-preset-minify`.
    minified: false
  }
}
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Lint and test your code.

## License

Copyright (c) 2015-2019 Mykhailo Kachanovskyi<br>
Copyright (c) 2019-2024 Ferdinand Prantl

Licensed under the MIT license.

[Babel]: https://babeljs.io/
[Babel 5]: https://babeljs.io/blog/2015/03/31/5.0.0
[Babel 6]: https://babeljs.io/blog/2015/10/29/6.0.0
[Babel 7]: https://babeljs.io/blog/2018/08/27/7.0.0
[RequireJS]: http://requirejs.org
[RequireJS optimizer]: https://requirejs.org/docs/optimization.html
[requirejs-babel project]: https://github.com/mikach/requirejs-babel
[requirejs-babel]: https://www.npmjs.com/package/requirejs-babel
[requirejs-babel6]: https://www.npmjs.com/package/requirejs-babel6
[requirejs-babel7]: https://www.npmjs.com/package/requirejs-babel7
[requirejs-esm]: https://www.npmjs.com/package/requirejs-esm
[@babel/standalone]: https://www.npmjs.com/package/@babel/standalone
[@babel/polyfill]: https://www.npmjs.com/package/@babel/polyfill
[babel-polyfills-generator]: https://www.npmjs.com/package/babel-polyfills-generator
[`requirejs`]: https://www.npmjs.com/package/requirejs
[`@prantlf/requirejs`]: https://www.npmjs.com/package/@prantlf/requirejs
[`@babel/plugin-transform-modules-amd`]: https://www.npmjs.com/package/@babel/plugin-transform-modules-amd
[`babel-plugin-transform-modules-requirejs-babel`]: https://www.npmjs.com/package/babel-plugin-transform-modules-requirejs-babel
[Node.js]: http://nodejs.org/
[NPM]: https://www.npmjs.com/
[PNPM]: https://pnpm.io/
[Yarn]: https://yarnpkg.com/
[simple demo]: https://github.com/prantlf/requirejs-babel/tree/master/demo
[advanced demo]: https://github.com/prantlf/requirejs-babel/tree/master/demo
[babel.transform]: https://babeljs.io/docs/en/babel-core#transform
[options]: https://babeljs.io/docs/en/options
[mandatory plugins]: https://github.com/prantlf/requirejs-babel/blob/master/es6.js#L48
[default module name resolution]: https://github.com/prantlf/requirejs-babel/blob/master/es6.js#L93
[resolvePath]: https://github.com/tleunen/babel-plugin-module-resolver/blob/master/DOCS.md#resolvepath
[documented for Babel transform]: https://babeljs.io/docs/en/options
