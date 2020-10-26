### 1.0.0
first version

### 1.0.1
* removed signup strategy because it was not right
* a few changes in docker-compose file

### 1.0.2
* new env variables
  - DC_URL - url of Domain Controller
  - BASE_DN
  - REFRESH_TOKEN_COOKIE_HTTPONLY - set or not 'httponly' for refresh cookie
  - REFRESH_TOKEN_IN_BODY - send or not refresh token in response body
  - ACCESS_TOKEN_COOKIE - set or not cookie with access token
