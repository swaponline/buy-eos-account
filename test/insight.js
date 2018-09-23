const expect = require('chai').expect

const init = (done) => {
  return require('seneca')()
    .test(done)
    .use(require('../src/modules/insight.js'), {
      baseURL: 'https://test-insight.bitpay.com/api'
    })
}


describe('insight microservice', () => {
  it('should return transaction details', (done) => {
    const seneca = init(done)

    const expectedDetails = require('./mocks/transaction.js')

    const args = {
      txid: '22ecec5d732ea00de6618fe28a836910b213b59935fb1d4936c43b958e263b4e'
    }

    seneca.act({ role: 'insight', cmd: 'getTransaction' }, args, (err, result) => {
      delete result.confirmations

      expect(result).to.be.deep.equal(expectedDetails)
      done()
    })
  })
})
