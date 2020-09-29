# Authentication service
environment variables:
*  **NODE_ENV** - if it set to `production` will be used the docker's secrets. Else local key files in the parent directory. They should be named as `id_rsa.pem` (private key) and `id_rsa.pem.pub` (public key)
## How to generate keys for signing tokens
### Generation keys for JWT (pem format, RSA256):
```shell script
ssh-keygen -t rsa -N "" -b 4096 -m PEM -f id_rsa.pem
# Don't add passphrase
openssl rsa -in id_rsa.pem -pubout -outform PEM -out id_rsa.pem.pub
cat id_rsa.pem 
cat id_rsa.pem.pub
```
first command generate 2 files:
  - id_rsa.pem - this is private key (without a password, option -N "" set empty passphrase)
  - id_rsa.pem.pub - this is public key, but isn't usable for JWT
second command extract an OpenSSH compatible public key from private key and overwrite incompatible public key

It's also can be done with ```ssh-keygen``` command only:
```shell script
ssh-keygen -t rsa -N "" -b 4096 -m PEM -f id_rsa.pem
ssh-keygen -e -m PEM -f id_rsa.pem > id_rsa.pem.pub
```
### useful link
[Converting keys between openssl and openssh](https://security.stackexchange.com/questions/32768/converting-keys-between-openssl-and-openssh)