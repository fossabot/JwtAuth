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
### 1.0.3
* if you have an empty users DB, you can create first user using `POST /signup` route
* appended env file using for `NODE_MODE !== 'production'`. See `README.md`  
### 1.0.4
* fixed error of infinity requests with invalid user's credentials. This error led to block this user after first GET request with invalid credentials.  
  See AD_READER_USERNAME and AD_READER_PASSWORD env variables in the [src/README.md](src/README.md).