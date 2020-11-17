## How to start with docker-compose
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FMaximus905%2FJwtAuth.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FMaximus905%2FJwtAuth?ref=badge_shield)

 * build image on the launch of docker-compose and start app: `docker-compose up -d --build`
 * build image and then start app
   - `docker build -t auth-service .`
   - `docker-compose up -d`
   
## Using image from docker hub
 * replace a name of image in docker-compose file with `maximus905/jwt-auth`   
 ---
__In any case of using don't forget generate keys with names `id_rsa.pem` and `id_rsa.pem.pub` and put them to the folder with docker-compose file!!!__

[More info about app and how to generate keys](src/README.md)

### Link to original article
[How to Implement API Authentication with JSON Web Tokens and Passport](https://www.digitalocean.com/community/tutorials/api-authentication-with-json-web-tokensjwt-and-passport)

## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FMaximus905%2FJwtAuth.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FMaximus905%2FJwtAuth?ref=badge_large)