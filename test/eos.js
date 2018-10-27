const mock = require('mock-require')

const chai = require('chai')
chai.use(require('chai-spies'))
const expect = chai.expect

const txMock = {
  newaccount: chai.spy(),
  buyrambytes: chai.spy(),
  delegatebw: chai.spy()
}

const httpEndpoint = 'https://seven.swap.online/telos-endpoint'
const chainId = '6c8aacc339bf1567743eb9c8ab4d933173aa6dca4ae6b6180a849c422f5bb207'

const options = {
  params: {
    serviceAccount: 'sevenflash11',
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

const accountName = 'tlos3vxfpgec'
const publicKey = 'TLOS6J2765xNSyjNi26QHPrj851FKYxuy88jE37ZWaCeLuQmtv9Lwn'

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
