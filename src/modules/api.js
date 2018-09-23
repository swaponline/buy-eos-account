module.exports = function api(options) {
  const seneca = this

  const { recipient, value } = options

  seneca.add({ role: 'api', cmd: 'newaccount' }, main)
  seneca.add({ role: 'api', path: 'newaccount' }, (args, done) => {
    seneca.act({ role: 'api', cmd: 'newaccount' }, args.args.body, done)
  })

  function main(args, done) {
    const { accountName, publicKey, address, signature, txid } = args
    const sender = address

    if (!accountName || accountName.length !== 12) {
      return done({ error: 'invalid accountName' })
    }
    if (!publicKey) {
      return done({ error: 'invalid publicKey'})
    }
    if (!address) {
      return done({ error: 'invalid address' })
    }
    if (!signature) {
      return done({ error: 'invalid signature' })
    }
    if (!txid) {
      return done({ error: 'invalid txid' })
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

            done({ result })
          })
        })
      })
    })
  }
}
