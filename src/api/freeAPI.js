module.exports = function api(options) {
  const seneca = this

  const { recipient, value } = options

  seneca.add('init:api', (args, done) => {
    seneca.act({ role: 'web' }, {
      routes: {
        prefix: '/',
        pin: 'role:api,path:*',
        map: {
          newaccount: { POST: true, suffix: '/' },
          ping: { GET: true, suffix: '/' }
        }
      }
    }, done)
  })

  seneca.add({ role: 'api', path: 'ping' }, (args, done) => {
    done(null, { ping: new Date() })
  })

  seneca.add({ role: 'api', path: 'newaccount' }, (args, done) => {
    seneca.act({ role: 'eos', cmd: 'createAccount' }, args.args.body, done)
  })
}
