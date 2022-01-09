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
      try {
        callback(null, fs.readFileSync(path, 'utf8'));
      } catch (error) {
        callback(error);
      }
    };
  }

  babel.registerPlugin('transform-modules-requirejs-babel', transformModulesRequireJSBabel);

  function parentDir (path) {
    var lastSlash = path.lastIndexOf('/');
    return lastSlash > 0 ? path.substring(0, lastSlash + 1) : undefined;
  }

  function shortenPath(path) {
    return path.charAt(0) === '.' && path.charAt(1) === '/' ? path.substring(2) : path;
  }

  function pointsToParent(path) {
    return path.charAt(0) === '.' && path.charAt(1) === '.' && path.charAt(2) === '/';
  }

  function joinPath (first, second) {
    second = shortenPath(second)
    if (first !== undefined) {
      while (pointsToParent(second)) {
        second = shortenPath(second.substring(3));
        first = parentDir(first);
        if (first === undefined) {
          return second;
        }
      }
      second = first + second;
    }
    return second;
  }

  // Ensures that every JavaScript dependency will be converted.
  function resolvePath (sourcePath, currentFile) {
    // Ignore paths with other plugins applied and the three built-in
    // pseudo-modules of RequireJS.
    if (sourcePath.indexOf('!') < 0 && sourcePath !== 'require' &&
      sourcePath !== 'module' && sourcePath !== 'exports') {
      // If sourcePath is relative to currentFile - starts with ./ or ../ -
      // prepend the parent directory of currentFile to it.
      if (sourcePath.charAt(0) === '.' && (sourcePath.charAt(1) === '/' ||
          sourcePath.charAt(1) === '.' && sourcePath.charAt(2) === '/')) {
        sourcePath = joinPath(parentDir(currentFile), sourcePath);
      }
      return 'es6!' + sourcePath;
    }
  }

  var excludedOptions = [
    'extraPlugins', 'resolveModuleSource', 'fileExtension',
    'mixedAmdAndEsm', 'onlyAmd'
  ];
  var pluginOptions = module.config();
  var fileExtension = pluginOptions.fileExtension || '.js';
  var mixedAmdAndEsm = pluginOptions.mixedAmdAndEsm;
  var onlyAmd = pluginOptions.onlyAmd;
  var resolveModuleSource = pluginOptions.resolveModuleSource;
  var customResolvePath = resolveModuleSource ?
    function (moduleName, parentName, options) {
      return resolveModuleSource(moduleName, parentName, options, resolvePath);
    } : resolvePath;
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
      if (!mixedAmdAndEsm && !reqConfig.isBuild && req.specified(name) || onlyAmd) {
        return req([name], onload, onload.error);
      }
//>>excludeStart('excludeBabel', pragmas.excludeBabel)

      // Paths relative to the current directory include the file extension.
      var extensionIndex = name.length - fileExtension.length;
      var sourceFileName = name.lastIndexOf(fileExtension) === extensionIndex ?
                            name : name + fileExtension;
      var url = req.toUrl(sourceFileName);

      if (url.indexOf('empty:') === 0) {
        return onload();
      }

      var options = {};
      for (var key in defaultOptions) {
        options[key] = defaultOptions[key];
      }
      options.sourceFileName = sourceFileName;
      options.sourceMap = (!reqConfig.isBuild || reqConfig.generateSourceMaps) && 'inline';
      if ((options.minified || reqConfig.minify) && reqConfig.isBuild) {
        if (!presetMinify) {
          presetMinify  = require.nodeRequire('babel-preset-minify');
          babel.registerPreset('minify', presetMinify);
        }
        options.minified = true;
        options.comments = false;
        if (!options.presets) {
          options.presets = ['minify'];
        } else if (!options.presets.includes('minify')) {
          options.presets.push('minify');
        }
      }

      fetchText(url, function (error, text) {
        if (error) {
          return onload.error(error);
        }

        var code;
        try {
          code = babel.transform(text, options).code;
        } catch (error) {
          console.log('Transpiling "' + name + '" (resolved to "' + url + '") failed:');
          console.log(error);
          return onload.error(error);
        }

        if (reqConfig.isBuild) {
          buildMap[name] = code;
        }

        onload.fromText(code);
      });
    },

    write: function (pluginName, moduleName, write) {
      if (moduleName in buildMap) {
        write.asModule(moduleName, buildMap[moduleName]);
        write.asModule(pluginName + '!' + moduleName,
          '\ndefine([\'' + moduleName + '\'], function (exp) { return exp; });\n');
      }
//>>excludeEnd('excludeBabel')
    }
  };
});
