const chai = require('chai')
chai.use(require('chai-spies'))
const expect = chai.expect

const bitcoin = require('bitcoinjs-lib')
const bitcoinMessage = require('bitcoinjs-message')

const createAccount = chai.spy()

const init = (done) => {
  return require('seneca')()
    .test(done)
    .use(require('../src/modules/btc.js'), {
      recipient: '',
    })
    .add({ role: 'insight', cmd: 'getTransaction' }, (args, done) => {
      done(null, require('./mocks/transaction.js'))
    })
    .add({ role: 'eos', cmd: 'createAccount' }, createAccount)
}

const sign = (args) => {
  const { accountName, publicKey, address, encodedPrivateKey } = args

  const message = JSON.stringify({ accountName, publicKey })

  const keyPair = bitcoin.ECPair.fromWIF(encodedPrivateKey, bitcoin.networks.bitcoin)
  const privateKey = keyPair.d.toBuffer(32)

  const signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed)

  return signature
}

describe('btc microservice', () => {
  describe('check signature', () => {
    it('should accept valid signature', (done) => {
      const seneca = init(done)

      const encodedPrivateKey = 'L2dKABrAe4B6tBMjNSSxM9E153VAVXp38fYmCZLVGzdyS8FJt22W'

      const accountName = 'eos3kmfpt43l'
      const publicKey = 'EOS7KmFPT83Liaertj278s8f72VupnUVaqL6BmN2xTjjj6LN6ZrJ2'
      const address = '1G1jReACZT9cjdqbDjuVRoVeAEG8PPLgQm'

      const signature = sign({ accountName, publicKey, address, encodedPrivateKey })

      const args = {
        accountName,
        publicKey,
        address,
        signature
      }

      seneca.act({ role: 'btc', cmd: 'checkSignature' }, args, (err, result) => {
        expect(result.verified).to.be.equal(true)
        done()
      })
    })

    it('should reject invalid signature', (done) => {
      const seneca = init(done)

      const args = {
        accountName: 'eos3kmfpt43l',
        publicKey: 'EOS7KmFPT83Liaertj278s8f72VupnUVaqL6BmN2xTjjj6LN6ZrJ2',
        address: 'n1ZCYg9YXtB5XCZazLxSmPDa8iwJRZHhGx',
        signature: 'H/DIn8uA1scAuKLlCx+/9LnAcJtwQQ0PmcPrJUq90aboLv3fH5fFvY+vmbfOSFEtGarznYli6ShPr9RXwY9UrIY='
      }

      seneca.act({ role: 'btc', cmd: 'checkSignature' }, args, (err, result) => {
        expect(result.verified).to.be.equal(false)
        done()
      })
    })
  })

  describe('check payment', () => {
    it('should accept correct payment', (done) => {
      const seneca = init(done)

      const args = {
        txid: '22ecec5d732ea00de6618fe28a836910b213b59935fb1d4936c43b958e263b4e',
        sender: 'mpAaNgjBUU7edRZ1ruoYeuBaXvkWFXDmpY',
        recipient: 'mqtaf5jVoHDQ8zhhJ7bvQimBJh5Ty5J75Q',
        value: '0.1'
      }

      seneca.act({ role: 'btc', cmd: 'checkPayment' }, args, (err, result) => {
        expect(result.verified).to.be.equal(true)
        done()
      })
    })

    it('should reject transaction from different sender', (done) => {
      const seneca = init(done)

      const args = {
        txid: '22ecec5d732ea00de6618fe28a836910b213b59935fb1d4936c43b958e263b4e',
        sender: 'mpAaNgjBUU7edRZ1ruoYeuBaXvkWFXDmpX',
        recipient: 'mqtaf5jVoHDQ8zhhJ7bvQimBJh5Ty5J75Q',
        value: '0.1'
      }

      seneca.act({ role: 'btc', cmd: 'checkPayment' }, args, (err, result) => {
        expect(result.verified).to.be.equal(false)
        done()
      })
    })

    it('should reject transaction with different value', (done) => {
      const seneca = init(done)

      const args = {
        txid: '22ecec5d732ea00de6618fe28a836910b213b59935fb1d4936c43b958e263b4e',
        sender: 'mpAaNgjBUU7edRZ1ruoYeuBaXvkWFXDmpY',
        recipient: 'mqtaf5jVoHDQ8zhhJ7bvQimBJh5Ty5J75Q',
        value: '0.2'
      }

      seneca.act({ role: 'btc', cmd: 'checkPayment' }, args, (err, result) => {
        expect(result.verified).to.be.equal(false)
        done()
      })
    })

    it('should reject transaction with different recipient', (done) => {
      const seneca = init(done)

      const args = {
        txid: '22ecec5d732ea00de6618fe28a836910b213b59935fb1d4936c43b958e263b4e',
        sender: 'mpAaNgjBUU7edRZ1ruoYeuBaXvkWFXDmpY',
        recipient: 'mqtaf5jVoHDQ8zhhJ7bvQimBJh5Ty5J75X',
        value: '0.1'
      }

      seneca.act({ role: 'btc', cmd: 'checkPayment' }, args, (err, result) => {
        expect(result.verified).to.be.equal(false)
        done()
      })
    })

    it('should reject user who made payment and already registered account', (done) => {
      done()
    })
  })

  describe('check account', () => {
    it('should accept account that corresponds to public key', (done) => {
      const seneca = init(done)

      const args = {
        publicKey: 'EOS7KmFPT83Liaertj278s8f72VupnUVaqL6BmN2xTjjj6LN6ZrJ2',
        accountName: 'eos3kmfpt43l'
      }

      seneca.act({ role: 'btc', cmd: 'checkAccount' }, args, (err, result) => {
        expect(result.verified).to.be.equal(true)
        done()
      })
    })
    it('should reject account that does not correspond to public key', (done) => {
      const seneca = init(done)

      const args = {
        publicKey: 'EOS7KmFPT83Liaertj278s8f72VupnUVaqL6BmN2xTjjj6LN6ZrJ2',
        accountName: 'eos7kmfpt43l'
      }

      seneca.act({ role: 'btc', cmd: 'checkAccount' }, args, (err, result) => {
        expect(result.verified).to.be.equal(false)
        done()
      })
    })
  })
})
