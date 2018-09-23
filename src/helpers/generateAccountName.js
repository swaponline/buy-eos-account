module.exports = (publicKey) => {
  const account = Array.prototype.map.call(
    publicKey.substr(0, 12).toLowerCase(),
    (char) => (Number.isNaN(Number.parseInt(char, 10)) || char < 5) ? char : char - 4
  ).join('')

  return account
}
