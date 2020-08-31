const UserModel = require('../models/user')

async function createTestUser(email) {
  const user = await UserModel.findOne({email})
  if (!user) {
    await UserModel.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testUser@mail.ru',
      password: '123'
    })
  }
}

module.exports = createTestUser