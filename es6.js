define([
//>>excludeStart('excludeBabel', pragmas.excludeBabel)
  'babel', 'babel-plugin-module-resolver', 'module'
//>>excludeEnd('excludeBabel')
], function(
//>>excludeStart('excludeBabel', pragmas.excludeBabel)
  babel, moduleResolver, module
//>>excludeEnd('excludeBabel')
) {
//>>excludeStart('excludeBabel', pragmas.excludeBabel)
  var buildMap = {};
  var fetchText;

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
  } else if (typeof process !== 'undefined' && process.versions
             && process.versions.node) {
    var fs = require.nodeRequire('fs');
    fetchText = function (path, callback) {
      try {
        callback(null, fs.readFileSync(path, 'utf8'));
      } catch (error) {
        callback(error);
      }
    };
  }

  babel.registerPlugin('module-resolver', moduleResolver);

  function resolvePath (sourcePath) {
    if (sourcePath.indexOf('!') < 0) {
      return 'es6!' + sourcePath;
    }
  }
  var excludedOptions = ['extraPlugins', 'resolveModuleSource', 'fileExtension'];
  var pluginOptions = module.config();
  var fileExtension = pluginOptions.fileExtension || '.js';
  var defaultOptions = {
    plugins: (pluginOptions.extraPlugins || []).concat([
      'transform-modules-amd',
      [
        'module-resolver',
        {
          resolvePath: pluginOptions.resolveModuleSource || resolvePath
        }
      ]
    ])
  };
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  for (var key in pluginOptions) {
    if (hasOwnProperty.call(pluginOptions, key) && excludedOptions.indexOf(key) < 0) {
      defaultOptions[key] = pluginOptions[key];
    }
  }

//>>excludeEnd('excludeBabel')
  return {
//>>excludeStart('excludeBabel', pragmas.excludeBabel)
    load: function (name, req, onload, config) {
      var sourceFileName = name + fileExtension;
      var url = req.toUrl(sourceFileName);

      if (url.indexOf('empty:') === 0) {
        return onload();
      }

      var options = {};
      for (var key in defaultOptions) {
        options[key] = defaultOptions[key];
      }
      options.sourceFileName = sourceFileName;
      options.sourceMap = (!config.isBuild || config.generateSourceMaps) && 'inline';

      fetchText(url, function (error, text) {
        if (error) {
          return onload.error(error);
        }

        var code;
        try {
          code = babel.transform(text, options).code;
        } catch (error) {
          return onload.error(error);
        }

        if (config.isBuild) {
          buildMap[name] = code;
        }

        onload.fromText(code);
      });
    },

    write: function (pluginName, moduleName, write) {
      if (moduleName in buildMap) {
        write.asModule(pluginName + '!' + moduleName, buildMap[moduleName]);
      }
    }
//>>excludeEnd('excludeBabel')
  };
});
