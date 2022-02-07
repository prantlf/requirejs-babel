const req = { toUrl: file => file }
const config = { isBuild: true }

function onload() {
  this.succeed()
}

onload.init = function () {
  this.promise = new Promise((resolve, reject) => {
    this.succeed = resolve
    this.fail = reject
  })
}

onload.fromText = function (code) {
  this.succeed(code)
}

onload.error = function (error) {
  this.fail(error)
}

module.exports = { req, config, onload }
