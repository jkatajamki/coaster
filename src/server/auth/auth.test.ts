import * as A from 'fp-ts/lib/Array'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { getIsEmailTaken, createNewUserAccount } from './auth'
import { getRight } from '../lib/test/test-utils'
import authTestUsers from '../user/test-users'
import { insertNewUser, deleteUser, User } from '../user/user'
import { pipe } from 'fp-ts/lib/pipeable'

const nonExistentEmail = 'non@existent.email'

const setUpTestDataForAuth = (): TE.TaskEither<Error, User[]> => {
  const insertUsers = authTestUsers().map(u => insertNewUser(u))

  return A.array.sequence(TE.taskEither)(insertUsers)
}

const tearDownTestDataForAuth = (): TE.TaskEither<Error, number[]> => {
  const deleteUsers = authTestUsers().map(({ userId }) => deleteUser(userId))

  return A.array.sequence(TE.taskEither)(deleteUsers)
}

describe('Email validation for user sign-up determines whether email is already taken', () => {
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
    const resultEither = await getIsEmailTaken(nonExistentEmail)()
    const result = getRight(resultEither)

    expect(result).toBeDefined()
    expect(result).toBeFalsy()
  })

  it('Returns that email is already taken', async () => {

    const alreadyTakenEmail = authTestUsers()[0].email

    getIsEmailTaken(alreadyTakenEmail)()
      .then(e =>
        pipe(
          e,
          E.fold(
            (error) => {
              expect(error).toBeDefined()
              expect(error.message).toContain('Email is already taken')
            },
            () => {
              throw Error('getIsEmailTaken returned a non-error value')
            }
          )
        )
      )
  })
})

describe('Create a new user account in database', () => {
  it('Succeeds in creating a new user account into database', async () => {
    const email = 'new@email.com'
    const userSecret = 'thisIsASecret1234'

    const errorOrResult = await createNewUserAccount(email, userSecret)()
    const result = getRight(errorOrResult)

    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
    expect(result.userId).toBeDefined()
    expect(result.userId).toBeGreaterThan(0)

    await deleteUser(result.userId)()
  })
})
