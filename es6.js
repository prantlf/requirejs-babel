define([
//>>excludeStart('excludeBabel', pragmas.excludeBabel)
  'babel', 'babel-plugin-transform-modules-requirejs-babel', 'module'
//>>excludeEnd('excludeBabel')
], function(
//>>excludeStart('excludeBabel', pragmas.excludeBabel)
  babel, transformModulesRequireJSBabel, module
//>>excludeEnd('excludeBabel')
) {
//>>excludeStart('excludeBabel', pragmas.excludeBabel)
  var buildMap = {};
  var fetchText, presetMinify;

  // Initialise the fetchText variable with a function to download
  // from a URL or to read from the file system.
  if (typeof window !== 'undefined' && window.navigator && window.document) {
    fetchText = function (url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            callback(null, xhr.responseText);
          } else {
            callback(new Error(xhr.statusText));
          }
        }
      };
      xhr.send(null);
    };
  } else {
    var fs = require.nodeRequire('fs');
    fetchText = function (path, callback) {
      // Asynchronous reading is not possible during the build in the optimizer.
      try {
        callback(null, fs.readFileSync(path, 'utf8'));
      } catch (error) {
        callback(error);
      }
    };
  }

  // Plugins outside `@babel/standalone` have to be registered by this API.
  babel.registerPlugin('transform-modules-requirejs-babel', transformModulesRequireJSBabel);

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
      return 'es6!' + sourcePath;
    }
  }

  // The plugin options is a mixture of the plugin's options and of Babel's
  // options. Babels will complain if an unknown options is detected.
  var excludedOptions = [
    'extraPlugins', 'resolveModuleSource', 'fileExtension',
    'mixedAmdAndEsm', 'onlyAmd'
  ];
  var pluginOptions = module.config();
  // Assume that the original sources are JavaScript files by default.
  var fileExtension = pluginOptions.fileExtension || '.js';
  // Flags to enforce or suppress the transpilation of not yet defined modules.
  var mixedAmdAndEsm = pluginOptions.mixedAmdAndEsm;
  var onlyAmd = pluginOptions.onlyAmd;
  // Method to update paths of module dependencies, to prefix JavaScript module
  // name with `es6!`, above all.
  var resolveModuleSource = pluginOptions.resolveModuleSource;
  var customResolvePath = resolveModuleSource ?
    function (moduleName, parentName, options) {
      return resolveModuleSource(moduleName, parentName, options, resolvePath);
    } : resolvePath;
  // Create default options for the Babel transpilation applied by this plugin.
  var defaultPlugins = [
    ['transform-modules-requirejs-babel', { resolvePath: customResolvePath }]
  ];
  var defaultOptions = {
    plugins: (pluginOptions.extraPlugins || []).concat(defaultPlugins)
  };
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  for (var key in pluginOptions) {
    if (hasOwnProperty.call(pluginOptions, key) && excludedOptions.indexOf(key) < 0) {
      defaultOptions[key] = pluginOptions[key];
    }
  }

//>>excludeEnd('excludeBabel')
  return {
    load: function (name, req, onload, reqConfig) {
      // If the module has been already defined from a module bundle, it was
      // already transpiled, when the output bundle was written. No need to
      // re-transpile it. This can happen only during the runtime.
      //
      // The re-transpilation is however necessary, if a testing page or a unit
      // test loads source ESM modules with extensions, which are going to be
      // consumed by a bundled module. Then the bundled module has to prefix
      // each of its dependencies with `es6!` to ensure their transpilation.
      // This mixed mode can to be enabled by the flag `mixedAmdAndEsm`, if needed.
      //
      // If the whole application is transpiled, there is no need to transpile
      // ESM modules or prefix dependencies of AMD modules. Even not yet defined
      // modules can be loaded just by `require` to get better performance.
      if (!mixedAmdAndEsm && !reqConfig.isBuild && req.specified(name) || onlyAmd) {
        return req([name], onload, onload.error);
      }
//>>excludeStart('excludeBabel', pragmas.excludeBabel)

      // Paths relative to the current directory include the file extension.
      // Otherwise the file extension must not be used for JavaScript modules.
      var extensionIndex = name.length - fileExtension.length;
      // The file name should include the orioginal extension in the source maps.
      var sourceFileName = name.lastIndexOf(fileExtension) === extensionIndex ?
                           name : name + fileExtension;
      // Compilation and bundling of module sub-trees can be skipped, if those
      // are mapped to the pseudo-path `empty:`, meaning that those modules
      // are external and will be loaded during the runtime.
      var url = req.toUrl(sourceFileName);
      if (url.indexOf('empty:') === 0) {
        return onload();
      }

      // Clone Babel options for the next execution without modifying the original.
      var options = {};
      for (var key in defaultOptions) {
        options[key] = defaultOptions[key];
      }
      options.sourceFileName = sourceFileName;
      // Always produce the source maps when transpiling in the browser, otherwise
      // the debugging would me impossible. When building and bundling, check if
      // the source maps were enabled for the output.
      options.sourceMap = (!reqConfig.isBuild || reqConfig.generateSourceMaps) && 'inline';

      // Babel can be used to minify the transpiled output. Either bythe flag
      // `minified` in the es6 plugin configuration, of by the flag `minify`
      // in the optimizer configuration. This option depends on the Babel preset
      // `minify` and is available only during the build time.
      if ((options.minified || reqConfig.minify) && reqConfig.isBuild) {
        // Make sure that the preset has been loaded and registered.
        if (!presetMinify) {
          presetMinify = require.nodeRequire('babel-preset-minify');
          babel.registerPreset('minify', presetMinify);
        }
        // Modify the Babel configuration to enable minification.
        options.minified = true;
        options.comments = false;
        if (!options.presets) {
          options.presets = ['minify'];
        } else if (!options.presets.includes('minify')) {
          options.presets.slice().push('minify');
        }
      }

      // Fetch the text of the source module by AJAX and transpile it.
      fetchText(url, function (error, text) {
        var code;

        if (error) {
          return onload.error(error);
        }

        try {
          code = babel.transform(text, options).code;
        } catch (error) {
          // RequireJS did not always log this error.
          console.log('Transpiling "' + name + '" (resolved to "' + url + '") failed:');
          console.log(error);
          return onload.error(error);
        }

        // Remember the transpiled content for the writing phase during the build.
        if (reqConfig.isBuild) {
          buildMap[name] = code;
        }

        onload.fromText(code);
      });
    },

    write: function (pluginName, moduleName, write) {
      if (moduleName in buildMap) {
        // Add the transpiled module under the original name. Earlier modules
        // refer it with that name, before the module was converted to ESM.
        write.asModule(moduleName, buildMap[moduleName]);
        // Add a stub of the module with the name prefixed by `es6!`. Modules
        // compiled with es6 refer it with that name and this stub will simplify
        // the module loading by skipping the plugin evaluation.
        write.asModule(pluginName + '!' + moduleName,
          '\ndefine([\'' + moduleName + '\'], function (exp) { return exp; });\n');
      }
//>>excludeEnd('excludeBabel')
    }
  };
});
