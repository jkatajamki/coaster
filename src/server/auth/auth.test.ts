import * as A from 'fp-ts/lib/Array'
import * as TE from 'fp-ts/lib/TaskEither'
import { isEmailTaken } from './auth'
import { getRight } from '../lib/test/test-utils'
import authTestUsers from '../user/test-users'
import { insertNewUser, deleteUser } from '../user/user'

const nonExistentEmail = 'non@existent.email'

const setUpTestDataForAuth = () => {
  const insertUsers = authTestUsers().map(u => insertNewUser(u))

  return A.array.sequence(TE.taskEither)(insertUsers)
}

const tearDownTestDataForAuth = () => {
  const deleteUsers = authTestUsers().map(({ userId }) => deleteUser(userId))

  return A.array.sequence(TE.taskEither)(deleteUsers)
}

describe('Find if email is already reserved in database', () => {
  beforeAll((): Promise<void> => new Promise((resolve) => {
    setUpTestDataForAuth()().then(() => {
      resolve()
    })
  }))

  afterAll((): Promise<void> => new Promise((resolve) => {
    tearDownTestDataForAuth()().then(() => {
      resolve()
    })
  }))

  it('Returns that email does not exist', async () => {
    const resultEither = await isEmailTaken(nonExistentEmail)()
    const result = getRight(resultEither)

    expect(result).toBeDefined()
    expect(result).toBeFalsy()
  })

  it('Returns that email is already taken', async () => {
    const resultEither = await isEmailTaken(authTestUsers()[0].email)()
    const result = getRight(resultEither)

    expect(result).toBeTruthy()
  })
})
