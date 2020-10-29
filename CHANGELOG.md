### 1.0.0
first version

### 1.0.1
* removed signup strategy because it was not right
* a few changes in docker-compose file

### 1.0.2
* new env variables
  - DC_URL - url of Domain Controller
  - BASE_DN
  - MONGO_DB_HOST
  - REFRESH_TOKEN_COOKIE_HTTPONLY - set or not 'httponly' for refresh cookie
  - REFRESH_TOKEN_IN_BODY - send or not refresh token in response body
  - ACCESS_TOKEN_COOKIE - set or not cookie with access token
  - ACCESS_TOKEN_SET_COOKIE
  - ACCESS_TOKEN_LIVE_TIME_MINUTES
  - ACCESS_TOKEN_COOKIE_NAME
  - REFRESH_TOKEN_LIVE_TIME_DAYS
  - REFRESH_TOKEN_COOKIE_NAME
  - DISABLE_AD_AUTH
