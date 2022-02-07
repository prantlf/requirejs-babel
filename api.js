var { transform, registerPlugin, registerPreset } = require('@babel/standalone');
// var { transform } = require('@babel/core');
var transformModulesRequireJSBabel = require('babel-plugin-transform-modules-requirejs-babel');

var presetMinify;

// Plugins outside `@babel/standalone` have to be registered by this API.
registerPlugin('transform-modules-requirejs-babel', transformModulesRequireJSBabel);

// Returns the parent directory by cutting the file name after the last slash,
// leaving the slash in the result. If there is no slash in the path - the path
// is just a file name, it will return `undefined`.
function parentDir (path) {
  var lastSlash = path.lastIndexOf('/');
  return lastSlash > 0 ? path.substring(0, lastSlash + 1) : undefined;
}

// Trims the leading "./" off the path.
function shortenPath(path) {
  while (path.charAt(0) === '.' && path.charAt(1) === '/') {
    path = path.substring(2);
  }
  return path;
}

// Checks if the path starts with "../".
function pointsToParent(path) {
  return path.charAt(0) === '.' && path.charAt(1) === '.' && path.charAt(2) === '/';
}

// Joins two paths together and avoids leaving "/./" or "/../" in the middle.
function joinPath (first, second) {
  // If the second part starts with "./", it can be safely removed.
  second = shortenPath(second)
  // The parent path can be undefined, if the file is located in the current directory.
  if (first !== undefined) {
    // As long as "../" can be removed from the second path, shorten the first one.
    while (pointsToParent(second)) {
      // Remove the leading "../" and trim futher all leading "./".
      second = shortenPath(second.substring(3));
      // Cut the last directory from the first path.
      first = parentDir(first);
      // If the last part of the first path was removed and there is no parent
      // directory to go further, return the rest of the second path.
      if (first === undefined) {
        return second;
      }
    }
    // Return what remains from the first path concatenated with the second one.
    second = first + second;
  }
  return second;
}

exports.transform = function transformModule (text, name, transformOptions) {
  // Ensures that every JavaScript dependency will be prefixed by `es6!`.
  // Relative paths will be converted to be relative to the parent module.
  function resolvePath (sourcePath, currentFile) {
    // Ignore paths with other plugins applied and the three built-in
    // pseudo-modules of RequireJS.
    if (sourcePath.indexOf('!') < 0 && sourcePath !== 'require' &&
      sourcePath !== 'module' && sourcePath !== 'exports') {
      // If `sourcePath` is relative to `currentFile` - starts with ./ or ../ -
      // prepend the parent directory of `currentFile` to it. This was needed
      // for modules located outside the source root (`baseUrl`), which were
      // mapped there using the `paths` of `map` configuration properties.
      if (sourcePath.charAt(0) === '.' && (sourcePath.charAt(1) === '/' ||
          sourcePath.charAt(1) === '.' && sourcePath.charAt(2) === '/')) {
        sourcePath = joinPath(parentDir(currentFile), sourcePath);
      }
      return pluginName + '!' + sourcePath;
    }
  }

  if (!transformOptions) {
    transformOptions = {};
  }

  // The plugin options is a mixture of the plugin's options and of Babel's
  // options. Babels will complain if an unknown options is detected.
  var excludedOptions = [
    'extraPlugins', 'resolveModuleSource', 'fileExtension'
  ];
  // Enable an inline source map.
  var sourceMap = transformOptions.sourceMap;
  // Allow using a different plugin alias than `es6` in the source code.
  var pluginName = transformOptions.pluginName || 'es6';
  // Assume that the original sources are JavaScript files by default.
  var fileExtension = transformOptions.fileExtension || '.js';
  // Method to update paths of module dependencies, to prefix JavaScript module
  // name with `es6!`, above all.
  var resolveModuleSource = transformOptions.resolveModuleSource;
  var customResolvePath = resolveModuleSource ?
    function (moduleName, parentName, options) {
      return resolveModuleSource(moduleName, parentName, options, resolvePath);
    } : resolvePath;
  // Create default options for the Babel transpilation applied by this plugin.
  var plugins = [
    ['transform-modules-requirejs-babel', { resolvePath: customResolvePath }]
    // [transformModulesRequireJSBabel, { resolvePath: customResolvePath }]
  ];
  var babelOptions = { plugins: (transformOptions.extraPlugins || []).concat(plugins) };
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  for (var key in transformOptions) {
    if (hasOwnProperty.call(transformOptions, key) && excludedOptions.indexOf(key) < 0) {
      babelOptions[key] = transformOptions[key];
    }
  }

  // Paths relative to the current directory include the file extension.
  // Otherwise the file extension must not be used for JavaScript modules.
  var extensionIndex = name.length - fileExtension.length;
  // The file name should include the orioginal extension in the source maps.
  var sourceFileName = name.lastIndexOf(fileExtension) === extensionIndex ?
                       name : name + fileExtension;

  babelOptions.sourceFileName = sourceFileName;
  // Always produce the source maps when transpiling in the browser, otherwise
  // the debugging would me impossible. When building and bundling, check if
  // the source maps were enabled for the output.
  babelOptions.sourceMap = sourceMap && 'inline';

  // Babel can be used to minify the transpiled output. Either bythe flag
  // `minified` in the es6 plugin configuration, of by the flag `minify`
  // in the optimizer configuration. This option depends on the Babel preset
  // `minify` and is available only during the build time.
  if (babelOptions.minified) {
    // Make sure that the preset has been loaded and registered.
    if (!presetMinify) {
      presetMinify = require('babel-preset-minify');
      registerPreset('minify', presetMinify);
    }
    // Modify the Babel configuration to enable minification.
    babelOptions.minified = true;
    babelOptions.comments = false;
    if (!babelOptions.presets) {
      babelOptions.presets = ['minify'];
      // babelOptions.presets = [presetMinify];
    } else if (!babelOptions.presets.includes('minify')) {
      babelOptions.presets.slice().push('minify');
      // babelOptions.presets.slice().push(presetMinify);
    }
  }

  return transform(text, babelOptions).code;
};
