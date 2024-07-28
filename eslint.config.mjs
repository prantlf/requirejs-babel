import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2015,
      sourceType: 'commonjs'
    }
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        define: 'readonly'
      }
    }
  },
  {
    files: ['server.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
]
