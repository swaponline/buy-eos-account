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

    checkSignature({
      accountName, publicKey, address, signature
    })
      .then(() => {
        return checkAccount({
          publicKey, accountName
        })
      })
      .then(() => {
        return checkPayment({
          txid, sender, recipient, value
        })
      })
      .then(() => {
        return createAccount({
          accountName, publicKey
        })
      })
      .then((result) => {
        done(null, result)
      })
      .catch((err) => {
        done(err)
      })
  })

  function checkSignature({ accountName, publicKey, address, signature }) {
    return new Promise((resolve, reject) => {
      if (!accountName || accountName.length !== 12) {
        return reject('invalid accountName')
      }
      if (!publicKey) {
        return reject('invalid publicKey')
      }
      if (!address) {
        return reject('invalid address')
      }
      if (!signature) {
        return reject('invalid signature')
      }

      seneca.act({ role: 'btc', cmd: 'checkSignature' }, { accountName, publicKey, address, signature }, (err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
    })
  }

  function checkAccount({ publicKey, accountName }) {
    return new Promise((resolve, reject) => {
      seneca.act({ role: 'btc', cmd: 'checkAccount' }, { publicKey, accountName }, (err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
    })
  }

  function checkPayment({ txid, sender, recipient, value }) {
    return new Promise((resolve, reject) => {
      if (!txid) {
        return reject('invalid txid')
      }

      seneca.act({ role: 'btc', cmd: 'checkPayment' }, { txid, sender, recipient, value }, (err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
    })
  }

  function createAccount({ accountName, publicKey }) {
    return new Promise((resolve, reject) => {
      seneca.act({ role: 'eos', cmd: 'createAccount' }, { accountName, publicKey }, (err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
    })
  }
}
