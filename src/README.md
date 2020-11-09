# Authentication service
environment variables:
* **NODE_ENV** - if it set to `production` will be used the docker's secrets and env variables of `app` container. In other case keys will be read from local key files in the parent directory and env variables from `.env` file. They should be named as `id_rsa.pem` (private key) and `id_rsa.pem.pub` (public key).  
You can use `.env_example` file as a template to create `.env` file.
* **DC_URL** - domain controller URL like `ldap://domain.com`
* **BASE_DN** - like `dc=domain,dc=com`
* **AD_READER_USERNAME** - like `username@domain.ru`. Username for AD look up operations. As usual any valid user from `domain.com`. 
* **AD_READER_PASSWORD** Password of user above.
* **MONGO_DB_HOST** ['mongo']
* **REFRESH_TOKEN_COOKIE_HTTPONLY** ['true']
* **REFRESH_TOKEN_IN_BODY** - send or not refresh token in the response body 
* **ACCESS_TOKEN_SET_COOKIE** ['true'] - set cookie for access token
* **ACCESS_TOKEN_LIVE_TIME_MINUTES** [15]
* **ACCESS_TOKEN_COOKIE_NAME** ['_atk']
* **REFRESH_TOKEN_LIVE_TIME_DAYS** [7]
* **REFRESH_TOKEN_COOKIE_NAME** ['_rtk']
* **DISABLE_AD_AUTH** - can be used for debug only! Disables AD authentication!

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