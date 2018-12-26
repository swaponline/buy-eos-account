require('dotenv').config()

const SenecaWeb = require('seneca-web')
const Express = require('express')
const Router = Express.Router
const context = new Router()

const app = Express()
  .use(require('body-parser').json())
  .use(context)
  .listen(process.env.PORT)

const eosEndpoint = process.env.MAINNET == 'true' ?
  'https://api.eosnewyork.io' :
  'http://jungle2.cryptolions.io:80'

const chainId = process.env.MAINNET == 'true' ?
  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' :
  'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473'

const insightEndpoint = process.env.MAINNET == 'true' ?
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
  recipient: process.env.PAYMENT_RECIPIENT,
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
