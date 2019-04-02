const connect = require('connect')
const blockFavicon = require('connect-block-favicon')
const serveStatic = require('serve-static')

function startServer ({ root = '.', port = 8967 } = {}) {
  console.log(`Starting a local web server in the directory "${root}" on the port ${port}...`)
  return new Promise((resolve, reject) => {
    const server = connect()
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
