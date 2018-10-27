module.exports = function api(options) {
  const seneca = this

  const { recipient, value } = options

  seneca.add('init:api', (args, done) => {
    seneca.act({ role: 'web' }, {
      routes: {
        prefix: '/',
        pin: 'role:api,path:*',
        map: {
          buyaccount: { POST: true, suffix: '/' },
          ping: { GET: true, suffix: '/' }
        }
      }
    }, done)
  })

  seneca.add({ role: 'api', path: 'ping' }, (args, done) => {
    done(null, { ping: new Date() })
  })

  seneca.add({ role: 'api', path: 'buyaccount' }, (args, done) => {
    const { accountName, publicKey, address, signature, txid } = args.args.body
    const sender = address

    if (!accountName || accountName.length !== 12) {
      return done('invalid accountName')
    }
    if (!publicKey) {
      return done('invalid publicKey')
    }
    if (!address) {
      return done('invalid address')
    }
    if (!signature) {
      return done('invalid signature')
    }
    if (!txid) {
      return done('invalid txid')
    }

    seneca.act({ role: 'btc', cmd: 'checkSignature' }, {
      accountName, publicKey, address, signature
    }, (err, result) => {
      if (err) return done(err)

      seneca.act({ role: 'btc', cmd: 'checkAccount' }, {
        publicKey, accountName
      }, (err, result) => {
        if (err) return done(err)

        seneca.act({ role: 'btc', cmd: 'checkPayment' }, {
          txid, sender, recipient, value
        }, (err, result) => {
          if (err) return done(err)

          seneca.act({ role: 'eos', cmd: 'createAccount' }, {
            accountName, publicKey
          }, (err, result) => {
            if (err) return done(err)

            done(null, result)
          })
        })
      })
    })
  })
}
