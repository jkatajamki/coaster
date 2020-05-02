import supertest from 'supertest'
import { testUsers } from '../user/test-users'
import server from '../server'

describe('Authentication', () => {
  it('Signs up with test user, receives session, and can access API endpoint that requires authentication', async () => {
    const testUser = testUsers[0]
    const testUserSecret = '%&/asdf123'

    const response = await supertest(server)
      .post('/api/auth/signUp')
      .send({
        email: testUser.email,
        userSecret: testUserSecret,
      })
      .set('Accept', 'application/json')

    // console.log('response', response)
  })
})
