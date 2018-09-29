const generateAccountName = require('../helpers/generateAccountName.js')

const bitcoinMessage = require('bitcoinjs-message')

module.exports = function btc(options) {
  const seneca = this

  seneca.add({ role: 'btc', cmd: 'checkSignature' }, checkSignature)
  seneca.add({ role: 'btc', cmd: 'checkAccount' }, checkAccount)
  seneca.add({ role: 'btc', cmd: 'checkPayment' }, checkPayment)

  // check signature of user to ensure that he confirms name of account
  function checkSignature(args, done) {
    const { accountName, publicKey, address, signature } = args

    const message = `${accountName}:${publicKey}`
    const verified = bitcoinMessage.verify(message, address, signature)

    done(null, { verified })
  }

  // restrict to register only one account per payment
  function checkAccount(args, done) {
    const { publicKey, accountName } = args

    const expectedAccountName = generateAccountName(publicKey)

    const verified = accountName === expectedAccountName

    done(null, { verified })
  }

  // restrict to register only after valid payment
  function checkPayment(args, done) {
    const { txid, sender, recipient, value } = args

    const checkSenderValue = (transaction, sender, value) => {
      const { vin: inputs } = transaction

      const senderInputs = inputs.filter(input => input.addr == sender)
      const senderValue = senderInputs.reduce((total, current) => {
        return total + Number.parseFloat(current.value)
      }, 0)

      if (Number.parseFloat(senderValue) >= Number.parseFloat(value)) {
        return true
      } else {
        return false
      }
    }

    const checkRecipientValue = (transaction, recipient, value) => {
      const { vout: outputs } = transaction

      for (const output of outputs) {
        if (Number.parseFloat(output.value) == Number.parseFloat(value)) {
          if (output.scriptPubKey && output.scriptPubKey.addresses) {
            const outputRecipient = output.scriptPubKey.addresses[0]

            if (outputRecipient == recipient) {
              return true
            }
          }
        }
      }

      return false
    }

    seneca.act({ role: 'insight', cmd: 'getTransaction' }, { txid }, (err, transaction) => {
      if (err) return done(err)

      const outputs = transaction.vout

      const verifiedSender = checkSenderValue(transaction, sender, value)
      const verifiedRecipientValue = checkRecipientValue(transaction, recipient, value)

      if (verifiedSender && verifiedRecipientValue) {
        done(null, { verified: true })
      } else {
        done(null, { verified: false })
      }
    })
  }
}
