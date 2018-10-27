const mock = require('mock-require')

const chai = require('chai')
chai.use(require('chai-spies'))
const expect = chai.expect

const txMock = {
  newaccount: chai.spy(),
  buyrambytes: chai.spy(),
  delegatebw: chai.spy()
}
mock('eosjs', function EOS() {
  return {
    transaction: (fn) => {
      fn(txMock)
      return Promise.resolve({ transaction_id: '0x123' })
    }
  }
})

const httpEndpoint = 'https://jungle.eosio.cr'
const chainId = '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'

const options = {
  params: {
    serviceAccount: 'sevenflash12',
    bytesAmount: '10000',
    netAmount: '100.0000',
    cpuAmount: '100.0000'
  },
  config: {
    keyProvider: '',
    httpEndpoint: httpEndpoint,
    chainId: chainId,
  }
}

const init = (done) => {
  return require('seneca')()
    .test(done)
    .use(require('../src/modules/eos.js'), options)
}

const accountName = 'sevenflashss'
const publicKey = 'EOS6J2765xNSyjNi26QHPrj851FKYxuy88jE37ZWaCeLuQmtv9Lwn'

describe('eos microservice', function() {
  this.timeout(42000)

  it('should create an account', (done) => {
    const seneca = init(done)

    seneca.act({ role: 'eos', cmd: 'createAccount' }, { accountName, publicKey }, (err, result) => {
      expect(result.transaction_id).to.be.equal('0x123')
      expect(txMock.newaccount).to.have.been.called()
      expect(txMock.buyrambytes).to.have.been.called()
      expect(txMock.delegatebw).to.have.been.called()
      done()
    })
  })
})
