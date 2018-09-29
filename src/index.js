require('dotenv').config()

console.log(process.env.SERVICE_PRIVATE_KEY)

const SenecaWeb = require('seneca-web')
const Express = require('express')
const Router = Express.Router
const context = new Router()

const app = Express()
  .use(require('body-parser').json())
  .use(context)
  .listen(process.env.PORT)

const eosOptions = {
  params: {
    serviceAccount: process.env.SERVICE_ACCOUNT,
    bytesAmount: '10000',
    netAmount: '100',
    cpuAmount: '100'
  },
  config: {
    keyProvider: process.env.SERVICE_PRIVATE_KEY,
    httpEndpoint: 'https://jungle.eosio.cr',
    chainId: '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'
  }
}

const apiOptions = {
  recipient: 'mqtaf5jVoHDQ8zhhJ7bvQimBJh5Ty5J75Q',
  value: '0.1'
}

const btcOptions = {}

const insightOptions = {
  baseURL: 'https://test-insight.bitpay.com/api'
}

const seneca = require('seneca')({ debug: { undead: true } })
  .use(SenecaWeb, {
    context: context,
    adapter: require('seneca-web-adapter-express'),
    options: { parseBody: false }
  })
  .use(require('./modules/eos.js'), eosOptions)
  .use(require('./modules/insight.js'), insightOptions)
  .use(require('./modules/btc.js'), btcOptions)
  .use(require('./modules/api.js'), apiOptions)
