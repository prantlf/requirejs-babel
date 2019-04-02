const connect = require('connect')
const blockFavicon = require('connect-block-favicon')
const serveStatic = require('serve-static')

const pad = {
  twoZeros (number) {
    return number < 10 ? `0${number}` : number
  },
  threeZeros (number) {
    return number < 10 ? `00${number}` : number < 100 ? `0${number}` : number
  }
}

function log (req, res, next) {
  const date = new Date
  console.log(`${time('Hour')}:${time('Minute')}:${time('Second')}.${time('Millisecond', 'three')} ${req.url}`)
  next()

  function time (part, padding = 'two') {
    const value = date[`get${part}s`]()
    return pad[`${padding}Zeros`](value)
  }
}

function startServer ({ root = '.', port = 8967 } = {}) {
  console.log(`Starting a local web server in the directory "${root}" on the port ${port}...`)
  return new Promise((resolve, reject) => {
    const server = connect()
      .use(log)
      .use(blockFavicon())
      .use(serveStatic(root, {
        etag: false
      }))
      .on('error', error => {
        server.close()
        reject(error)
      })
      .listen(port, () => {
        console.log('The local web server is listening...')
        resolve({ server, port })
      })
  })
}

startServer().catch(error => {
  console.error(error)
  process.exitCode = 1
})
