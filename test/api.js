const chai = require('chai')
chai.use(require('chai-spies'))
const expect = chai.expect

const checkSignatureSpy = chai.spy.returns({ verified: true })
const checkAccountSpy = chai.spy.returns({ verified: true })
const checkPaymentSpy = chai.spy.returns({ verified: true })
const createAccountSpy = chai.spy()

const init = (done) => {
  return require('seneca')()
    .test(done)
    .use(require('../src/modules/api.js'), {
      recipient: 'mqtaf5jVoHDQ8zhhJ7bvQimBJh5Ty5J75Q',
      value: '0.1'
    })
    .add({ role: 'btc', cmd: 'checkSignature' }, (args, done) => {
      done(null, checkSignatureSpy(args))
    })
    .add({ role: 'btc', cmd: 'checkAccount' }, (args, done) => {
      done(null, checkAccountSpy(args))
    })
    .add({ role: 'btc', cmd: 'checkPayment' }, (args, done) => {
      done(null, checkPaymentSpy(args))
    })
    .add({ role: 'eos', cmd: 'createAccount' }, (args, done) => {
      done(null, createAccountSpy(args))
    })
}

describe('api microservice', () => {
  describe('register EOS account for user after BTC payment', () => {
    it('should process correct request', (done) => {
      const seneca = init(done)

      const {
        account, publicKey, address, signature, txid, accountName, sender, recipient, value
      } = {
        publicKey: '5K2JPteU12iX2ognRLEoghGvbDn2SYdGGBX2E1Yr99pFDTa6Aiq',
        address: 'n1ZCYg9YXtB5XCZazLxSmPDa8iwJRZHhGx',
        signature: 'H3ATU4LkfSGqYTITHYkLb+xq29oYHCjCEV52lXtcu+h+LPCmKXnQ/bw46/R89Dbazy//XhSkXorgkWvjmk8xr8g=',
        txid: '22ecec5d732ea00de6618fe28a836910b213b59935fb1d4936c43b958e263b4e',
        sender: 'mpAaNgjBUU7edRZ1ruoYeuBaXvkWFXDmpY',
        recipient: 'mqtaf5jVoHDQ8zhhJ7bvQimBJh5Ty5J75Q',
        value: '0.1',
        accountName: 'eos3kmfpt43l'
      }

      const args = { accountName, publicKey, address, signature, txid }
      const signatureArgs = { accountName, publicKey, address, signature }
      const accountArgs = { publicKey, accountName }
      const paymentArgs = { txid, sender, recipient, value }

      seneca.act({ role: 'api', cmd: 'newaccount' }, args, (err, result) => {
        expect(checkSignatureSpy).to.have.been.called()
        expect(checkAccountSpy).to.have.been.called()
        expect(checkPaymentSpy).to.have.been.called()
        expect(createAccountSpy).to.have.been.called()
        done()
      })
    })
  })
})
