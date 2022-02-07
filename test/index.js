const { readdir, readFile } = require('fs/promises')
const { join, relative } = require('path')
const { equal } = require('assert')
const { transform } = require('../api')

async function testTransform() {
  console.log('transform with sourcemap')
  const code = await transform('import A from "name"', 'test.js', { sourceMap: true })
  equal(code, `define(["es6!name"], function (A) {\n  "use strict";\n});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QuanMiXSwibmFtZXMiOlsiQSJdLCJtYXBwaW5ncyI6IlFBQWMsVSxhQUFQQSxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEEgZnJvbSBcIm5hbWVcIiJdfQ==`)
}

async function testMinify() {
  console.log('minify')
  const code = await transform('import Name from "name"', 'test.js', { minified: true })
  equal(code, 'define(["es6!name"],function(){"use strict"});')
}

async function testPluginSingle(dir, input) {
  console.log(input)
  const content = await readFile(join(__dirname, 'input', input), 'utf8')
  const name = input === 'amd-relative.js' ? `test/input/${input}` : input
  const actual = transform(content, name).trimEnd()
  const expected = (await readFile(join(__dirname, 'output', input), 'utf8')).trimEnd()
  if (expected !== actual) {
    console.log()
    throw new Error(`expected !== actual (${expected.length}, ${actual.length})

${expected}
${actual}`)
  }
}

async function testPluginAll() {
  const dir = relative(process.cwd(), join(__dirname, 'input'))
  let inputs = process.argv.slice(2)
  if (!inputs.length) {
    inputs = await readdir(dir)
    inputs.unshift('api')
  }
  for (const input of inputs) {
    if (input === 'api') {
      await testTransform()
      await testMinify()
    } else if (input.endsWith('.js')) {
      await testPluginSingle(dir, input)
    }
  }
}

testPluginAll().catch(error => {
  console.error(error)
  process.exitCode = 1
})
