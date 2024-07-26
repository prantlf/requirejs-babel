const { transform } = require('../api')
const { readdir, readFile } = require('fs/promises')
const { join, relative } = require('path')
const { equal } = require('assert')
const tehanu = require('tehanu')
const test = tehanu('es6')

test('transform with sourcemap', async function () {
  const code = await transform('import A from "name"', 'test.js', { sourceMap: true })
  equal(code, `define(["es6!name"], function (A) {\n  "use strict";\n});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBIl0sInNvdXJjZXMiOlsidGVzdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQSBmcm9tIFwibmFtZVwiIl0sIm1hcHBpbmdzIjoiUUFBYyxVQUFNLGFBQWJBLENBQUM7RUFBQTtBQUFBIiwiaWdub3JlTGlzdCI6W119`)
})

test('minify', async function () {
  const code = await transform('import Name from "name"', 'test.js', { minified: true })
  equal(code, 'define(["es6!name"],function(){"use strict"});')
})

async function testPluginSingle(input) {
  const content = await readFile(join(__dirname, 'input', input), 'utf8')
  const name = input === 'amd-relative.js' ? `test/input/${input}` : input
  const actual = transform(content, name).trimEnd()
  const expected = (await readFile(join(__dirname, 'output', input), 'utf8')).trimEnd()
  if (expected !== actual) {
    throw new Error(`expected !== actual (${expected.length}, ${actual.length})

${expected}
${actual}`)
  }
}

async function testPluginAll() {
  const dir = relative(process.cwd(), join(__dirname, 'input'))
  const inputs = await readdir(dir)
  for (const input of inputs) {
    if (input.endsWith('.js')) {
      test(input, () => testPluginSingle(input))
    }
  }
  await tehanu.schedule()
}

testPluginAll().catch(error => {
  console.error(error)
  process.exitCode = 1
})
