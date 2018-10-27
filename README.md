## eos-buy-account
Service accepts BTC payments and registers chosen EOS account for user

### Features:

 - No storage
 - No sockets
 - No HD wallet
 - No monolith
 - Simple

### Install
```
git clone git@github.com:7flash/buy-eos-account.git
npm install
npm run test
npm run start
```

### Test
```
  btc microservice
    check signature
      ✓ should accept valid signature (111ms)
      ✓ should reject invalid signature
    check payment
      ✓ should accept correct payment
      ✓ should reject transaction from different sender
      ✓ should reject transaction with different value
      ✓ should reject transaction with different recipient
      ✓ should reject user who made payment and already registered account
    check account
      ✓ should accept account that corresponds to public key
      ✓ should reject account that does not correspond to public key

  eos microservice
    ✓ should create an account

  default API microservice
    register EOS account for user after BTC payment
      ✓ should process correct request

  free API microservice
    register account for user
      ✓ should process correct request

  insight microservice
    ✓ should return transaction details (992ms)
```
