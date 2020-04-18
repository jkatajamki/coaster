import * as A from 'fp-ts/lib/Array'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { createNewUserAccount, emailIsNotEmptyOrError } from './auth'
import { getRight } from '../lib/test/test-utils'
import authTestUsers from '../user/test-users'
import { deleteUser, User, getIsEmailTaken, getUserDataByLoginWord, upsertUser } from '../user/user'
import { pipe } from 'fp-ts/lib/pipeable'
import { pool } from '../db/db'

const nonExistentEmail = 'non@existent.email'

const setUpTestDataForAuth = (): TE.TaskEither<Error, User[]> => {
  const secrets = { passwordHash: 'hash', salt: 'salt' }

  const insertUsers = authTestUsers().map(u =>
    pool.withConnection(dbClient => upsertUser(dbClient)(u, secrets)))

  return A.array.sequence(TE.taskEither)(insertUsers)
}

const tearDownTestDataForAuth = (): TE.TaskEither<Error, number[]> => {
  const deleteUsers = authTestUsers().map(({ userId }) => pool.withConnection(
    dbClient => deleteUser(dbClient)(userId)
  ))

  return A.array.sequence(TE.taskEither)(deleteUsers)
}

describe('Authentication methods', () => {
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

  describe('Email validation for user sign-up', () => {
    it('Asserts that empty email is invalid, and non-empty is valid', () => {
      const emptyEmails = [
        undefined,
        null,
        ''
      ]
      const nonEmpty = ['non@empty.email']

      emptyEmails.forEach((email) => {
        const either = emailIsNotEmptyOrError(email)

        expect(E.isLeft(either)).toBeTruthy()
      })

      nonEmpty.forEach((email) => {
        const either = emailIsNotEmptyOrError(email)

        expect(E.isRight(either)).toBeTruthy()
      })
    })

    it('Returns that email does not exist', async () => {
      const resultEither = await pool.withConnection(dbClient =>
        getIsEmailTaken(dbClient)(nonExistentEmail))()
      const result = getRight(resultEither)

      expect(result).toBeDefined()
      expect(result).toBeFalsy()
    })

    it('Returns that email is already taken', async () => {

      const alreadyTakenEmail = authTestUsers()[0].email

      pool.withConnection(dbClient => getIsEmailTaken(dbClient)(alreadyTakenEmail))()
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

  describe('Sign-in validation', () => {
    it('Returns user data and secrets', async () => {
      const testUser = authTestUsers()[0]
      const registeredEmail = testUser.email

      const resultEither = await pool.withConnection(dbClient =>
        getUserDataByLoginWord(dbClient)(registeredEmail))()
      const result = getRight(resultEither)

      expect(result).toBeDefined()

      const { user, secrets } = result
      expect(user).toBeDefined()
      expect(secrets).toBeDefined()

      const { userId, email } = user
      const { passwordHash, salt } = secrets
      expect(email).toBe(testUser.email)
      expect(userId).toBeDefined()
      expect(typeof userId).toBe('number')
      expect(typeof passwordHash).toBe('string')
      expect(typeof salt).toBe('string')
      expect(passwordHash.length).toBeGreaterThan(0)
      expect(salt.length).toBeGreaterThan(0)
    })

    it('Fails to return user data', async () => {
      const resultEither = await pool.withConnection(dbClient =>
        getUserDataByLoginWord(dbClient)(nonExistentEmail))()

      pipe(
        resultEither,
        E.fold(
          (error) => {
            expect(error).toBeDefined()
            expect(error.message).toContain('Cannot find user data by login word')
          },
          () => {
            throw Error('getUserDataByLoginWord returned a non-error value')
          }
        )
      )
    })
  })
})

describe('Create a new user account in database', () => {
  it('Succeeds in creating a new user account into database', async () => {
    const email = 'new@email.com'
    const userSecret = 'thisIsASecret1234'

    const errorOrResult = await pool.withConnection(dbClient => createNewUserAccount(dbClient)(email, userSecret))()
    const result = getRight(errorOrResult)

    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
    expect(result.userId).toBeDefined()
    expect(result.userId).toBeGreaterThan(0)

    await pool.withConnection(dbClient => deleteUser(dbClient)(result.userId))()
  })
})
