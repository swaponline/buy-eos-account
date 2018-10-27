const chai = require('chai')
chai.use(require('chai-spies'))
const expect = chai.expect

const createAccountSpy = chai.spy()

const init = (done) => {
  return require('seneca')()
    .test(done)
    .add({ role: 'web' }, (args, done) => {
      done()
    })
    .use(require('../src/api/freeAPI.js'))
    .add({ role: 'eos', cmd: 'createAccount' }, (args, done) => {
      done(null, createAccountSpy(args))
    })
}

describe('free API microservice', () => {
  describe('register account for user', () => {
    it('should process correct request', (done) => {
      const seneca = init(done)

      const {
        accountName, publicKey
      } = {
        publicKey: '5K2JPteU12iX2ognRLEoghGvbDn2SYdGGBX2E1Yr99pFDTa6Aiq',
        accountName: 'eos3kmfpt43l'
      }

      const args = {
        args: {
          body: {
            accountName, publicKey
          }
        }
      }

      seneca.act({ role: 'api', path: 'newaccount' }, args, (err, result) => {
        expect(createAccountSpy).to.have.been.called()
        done()
      })
    })
  })
})
