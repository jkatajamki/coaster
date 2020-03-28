import { isEmailTaken } from './auth'
import { getRight } from '../lib/test/test-utils'

const nonExistentEmail = 'non@existent.email'

describe('Find if email is already reserved in database', () => {
  it('Returns that email does not exist', async () => {
    const resultEither = await isEmailTaken(nonExistentEmail)()
    const result = getRight(resultEither)

    expect(result).toBeDefined()
    expect(result).toBeFalsy()
  })
})
