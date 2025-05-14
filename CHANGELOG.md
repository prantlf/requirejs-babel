# Changes

## [1.5.0](https://github.com/prantlf/requirejs-babel/compare/v1.4.0...v1.5.0) (2025-05-14)

### Features

* Upgrade dependencies ([a62cd6a](https://github.com/prantlf/requirejs-babel/commit/a62cd6a8df40f939e7e8af057e90a0481d7ae0d3))

## [1.4.0](https://github.com/prantlf/requirejs-babel/compare/v1.3.2...v1.4.0) (2024-07-26)

### Features

* Upgrade dependencies ([b74eb78](https://github.com/prantlf/requirejs-babel/commit/b74eb78015812d38642c63628e2fcc5f199d667f))

## [1.3.2](https://github.com/prantlf/requirejs-babel/compare/v1.3.1...v1.3.2) (2022-02-08)

### Bug Fixes

* Include api.js in the NPM package ([fcda471](https://github.com/prantlf/requirejs-babel/commit/fcda471efbc98f2dbd88a9f616129c70dbbe369f))

## [1.3.1](https://github.com/prantlf/requirejs-babel/compare/v1.3.0...v1.3.1) (2022-02-08)

### Bug Fixes

* Fix loading of the babel transformation plugin in the API mode ([a1faddf](https://github.com/prantlf/requirejs-babel/commit/a1faddf955946a3cc0bb87de406961a017eba6eb))

## [1.3.0](https://github.com/prantlf/requirejs-babel/compare/v1.2.1...v1.3.0) (2022-02-07)

### Features

* Add programmatic API ([503d301](https://github.com/prantlf/requirejs-babel/commit/503d301b604e13df5dfbccf1703382a86b8a2a8a))

## [1.2.1](https://github.com/prantlf/requirejs-babel/compare/v1.2.0...v1.2.1) (2022-01-17)

### Bug Fixes

* Do not pass the option skipModules to Babel ([5652f4a](https://github.com/prantlf/requirejs-babel/commit/5652f4af4e21a8f84b7c0439773a886ddc2ed53c))

## [1.2.0](https://github.com/prantlf/requirejs-babel/compare/v1.1.0...v1.2.0) (2022-01-17)

### Features

* Allow skipping modules by names or prefixes ([5ce68bf](https://github.com/prantlf/requirejs-babel/commit/5ce68bf66599c6e434ceea50789456e5ae52ede7))
* Allow using a different plugin alias than es6 ([86c5be9](https://github.com/prantlf/requirejs-babel/commit/86c5be9e9d972f18e62115980a088c4993496982))

## [1.1.0](https://github.com/prantlf/requirejs-babel/compare/v1.0.6...v1.1.0) (2022-01-09)

### Features

* Replace all plugins with babel-plugin-transform-modules-requirejs-babel ([84a3d1f](https://github.com/prantlf/requirejs-babel/commit/84a3d1f9bc162532658e9aa00ebe7df2782ccbb1))

## [1.0.6](https://github.com/prantlf/requirejs-babel/compare/v1.0.5...v1.0.6) (2022-01-08)

### Bug Fixes

* Do not prefix by es6! the three pseudo-modules - require, module and exports ([067d41d](https://github.com/prantlf/requirejs-babel/commit/067d41d4132d8551cba32946a5445bb376f307dc))

## [1.0.5](https://github.com/prantlf/requirejs-babel/compare/v1.0.4...v1.0.5) (2022-01-06)

### Bug Fixes

* Fix resolving relative paths, ensure single default export ([67acc5e](https://github.com/prantlf/requirejs-babel/commit/67acc5eb214f8c68ff9bfac2d0ad6f071322410c))

## [1.0.3](https://github.com/prantlf/requirejs-babel/compare/v1.0.2...v1.0.3) (2022-01-02)

### Bug Fixes

* Do not append the .js extension to module names relative to the current path ([8f93a0e](https://github.com/prantlf/requirejs-babel/commit/8f93a0e60f2eb96cd16aafd4a46de90a409f0b1b))
* Do not transpile source files already in the AMD format ([919a891](https://github.com/prantlf/requirejs-babel/commit/919a89195d7019cfddebc18b4580a3f3b71a0a16))
* Propagate errors from loading missing files ([d69c42d](https://github.com/prantlf/requirejs-babel/commit/d69c42d2d45e0c3b8e1441485bd2b5669f0a84da))

## [1.0.2](https://github.com/prantlf/requirejs-babel/compare/v1.0.1...v1.0.2) (2022-01-01)

### Bug Fixes

* Do not use the method hasOwnProperty directly ([8da13e4](https://github.com/prantlf/requirejs-babel/commit/8da13e4e7720fe07f3d21eaec936adcc16b52c15))
* Generate source maps in the runtime mode and in the build mode if they are enabled ([8fdb6cf](https://github.com/prantlf/requirejs-babel/commit/8fdb6cf30c34dda7b384d238773411b4d2ce9bdb))

## [1.0.1](https://github.com/prantlf/requirejs-babel/compare/v1.0.0...v1.0.1) (2019-04-02)

### Bug Fixes

* Do not pass the es6 plugin option "fileExtension" to babel ([1f12bbb](https://github.com/prantlf/requirejs-babel/commit/1f12bbbefa447df2267a864107b82bd7ac2c3643))

## [1.0.0](https://github.com/prantlf/requirejs-babel/compare/0.0.9...v1.0.0) (2019-04-02)

* Add support for the current Babel 7 ([5cfb600](https://github.com/prantlf/requirejs-babel/commit/5cfb600095c321593b0152bb60870216ed926a40))
* Ensure, that each (concurrent) plugin usage has its own options ([7ccb155](https://github.com/prantlf/requirejs-babel/commit/7ccb1552cfe156766059f35f08127cd0548a2997))
* Do not try loading modules mapped to "empty:" ([3ccf294](https://github.com/prantlf/requirejs-babel/commit/3ccf294b26f490d2bf58451bd3dba146cebb7b0f))
* Publish this fork as a new package: requirejs-babel7 ([01fa785](https://github.com/prantlf/requirejs-babel/commit/01fa7854208349036c6871842242c978a3e05496))

The first release after forking the original project.
