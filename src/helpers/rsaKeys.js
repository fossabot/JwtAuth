const fs = require('fs')
const path = require('path')
const rootPath = require('./path')

const keys = function getKeys() {
  try{
    const NODE_ENV = process.env.NODE_ENV
    const private_key_path = NODE_ENV === 'production' ? '/run/secrets/id_rsa' : path.resolve(rootPath, '..', 'id_rsa.pem')
    const public_key_path = NODE_ENV === 'production' ? '/run/secrets/id_rsa_pub' : path.resolve(rootPath, '..','id_rsa.pem.pub')
    const id_rsa = fs.readFileSync(private_key_path, 'utf8')
    const id_rsa_pub = fs.readFileSync(public_key_path, 'utf8')
    return {id_rsa, id_rsa_pub}
  } catch (e) {
    console.log(e.message)
    return false
  }
}()

module.exports = keys