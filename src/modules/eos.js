const Eos = require('eosjs')

module.exports = function eos(options) {
  const seneca = this

  seneca.add({ role: 'eos', cmd: 'createAccount' }, createAccount)

  const {
    params: { serviceAccount, bytesAmount, netAmount, cpuAmount },
    config: { chainId, httpEndpoint, keyProvider, mockTransactions, keyPrefix }
  } = options

  const node = Eos({
    chainId, httpEndpoint, keyProvider, mockTransactions, keyPrefix
  })

  function createAccount(args, done) {
    const { accountName, publicKey } = args

    node.transaction(tx => {
      tx.newaccount({
        creator: serviceAccount,
        owner: publicKey,
        active: publicKey,
        name: accountName
      })

      tx.buyrambytes({
        payer: serviceAccount,
        receiver: accountName,
        bytes: Number.parseInt(bytesAmount)
      })

      tx.delegatebw({
        from: serviceAccount,
        receiver: accountName,
        stake_net_quantity: `${netAmount} ${keyPrefix}`,
        stake_cpu_quantity: `${cpuAmount} ${keyPrefix}`,
        transfer: 0
      })
    }).then((result) => {
      done(null, result)
    }).catch((err) => {
      done(err)
    })
  }
}
