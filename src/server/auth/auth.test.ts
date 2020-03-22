import { isEmailTaken } from './auth'
import logger from '../lib/logging/logger'

const nonExistentEmail = 'non@existent.email'

describe('Find if email is already reserved in database', () => {
  it('Returns that email does not exist', async () => {
    const response = await isEmailTaken(nonExistentEmail)

    response.match(
      (ok) => {
        expect(ok).toBeDefined()
        expect(ok).toBe(false)
      },
      (err) => {
        logger.error(err)
      }
    )
  })
})
