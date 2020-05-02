import supertest from 'supertest'
import { testUsers } from '../user/test-users'
import server from '../server'
import { UserSession } from '../auth/cryptography'

describe('Authentication', () => {

  it('Signs up with test user, receives session, and can access API endpoint that requires authentication', async () => {
    const testUser = testUsers[0]
    const testUserSecret = '%&/asdf123'

    const { body: { user, session } } = await supertest(server)
      .post('/api/auth/signUp')
      .send({
        email: testUser.email,
        userSecret: testUserSecret,
      })
      .set('Accept', 'application/json')

    expect(user).toBeDefined()
    expect(session).toBeDefined()

    const userSession: UserSession = session

    const { body: { userId, email } } = await supertest(server)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${userSession.jsonWebToken}`)

    expect(userId).toBeDefined()
    expect(email).toBeDefined()
    expect(typeof userId).toBe('number')
    expect(userId).toBeGreaterThan(0)
    expect(typeof email).toBe('string')
    expect(email).toBe(testUser.email)
  })

  it('Fails to access authenticated API because bad token is provided', async () => {
    const rubbishToken = '2342345235'

    const { status, error } = await supertest(server)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${rubbishToken}`)


    expect(status).toBe(500)
    expect(error).toBeTruthy()
  })
})
