require('dotenv').config()

const SenecaWeb = require('seneca-web')
const Express = require('express')
const Router = Express.Router
const context = new Router()

const app = Express()
  .use(require('body-parser').json())
  .use(context)
  .listen(process.env.PORT)

const eosEndpoint = process.env.MAINNET == true ?
  'https://api.eosnewyork.io' :
  'https://jungle.eosio.cr'

const chainId = process.env.MAINNET == true ?
  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' :
  '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'

const insightEndpoint = process.env.MAINNET == true ?
  'https://insight.bitpay.com/api' :
  'https://test-insight.bitpay.com/api'

const keyPrefix = 'EOS'

const eosOptions = {
  params: {
    serviceAccount: process.env.SERVICE_ACCOUNT,
    bytesAmount: '10000',
    netAmount: '1.0000',
    cpuAmount: '1.0000'
  },
  config: {
    keyProvider: process.env.SERVICE_PRIVATE_KEY,
    httpEndpoint: eosEndpoint,
    chainId: chainId,
    keyPrefix: keyPrefix
  }
}

const apiOptions = {
  recipient: 'mqtaf5jVoHDQ8zhhJ7bvQimBJh5Ty5J75Q',
  value: '0.1'
}

const btcOptions = {}

const insightOptions = {
  baseURL: insightEndpoint
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
  .use(require('./api/defaultAPI.js'), apiOptions)
