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
          buyaccount: { POST: true, suffix: '/' },
          ping: { GET: true, suffix: '/' }
        }
      }
    }, done)
  })

}
