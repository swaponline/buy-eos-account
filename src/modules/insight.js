const request = require('request')

module.exports = function insight(options) {
  const seneca = this

  const { baseURL = 'https://insight.bitpay.com/api' } = options

  seneca.add({ role: 'insight', cmd: 'getTransaction' }, getTransaction)

  function getTransaction(args, done) {
    const { txid, testnet } = args

    request(`${baseURL}/tx/${txid}`, (error, response, body) => {
      if (error) return done(error)

      if (response.statusCode == 200) {
        const transaction = JSON.parse(body)
        done(null, transaction)
      } else {
        done(body)
      }
    })
  }
}
