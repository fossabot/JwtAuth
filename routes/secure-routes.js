const express = require('express')
const router = express.Router()
// Display user information
router.get('/profile', (req, res, next) => {
  // send back the user details and token
  res.json({
    message: 'You are in the secure route',
    user: req.user,
    token: req.query.token
  })
})

module.exports = router