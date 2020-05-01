import * as A from 'fp-ts/lib/Array'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { createNewUserAccount, emailIsNotEmptyOrError } from './auth'
import { getPayloadFromToken, getTokenExpiration, createJsonWebToken } from './token'
import { getRight } from '../lib/test/test-utils'
import authTestUsers from '../user/test-users'
import { deleteUser, User, getIsEmailTaken, getUserDataByLoginWord, upsertUser } from '../user/user'
import { pipe } from 'fp-ts/lib/pipeable'
import { pool } from '../db/db'
import { verifyUserSecrets } from './cryptography'

const nonExistentEmail = 'non@existent.email'

const testUserSecrets = { passwordHash: 'hash', salt: 'salt' }

const setUpTestDataForAuth = (): TE.TaskEither<Error, User[]> => {
  const insertUsers = authTestUsers().map(u =>
    pool.withConnection(dbClient => upsertUser(dbClient)(u, testUserSecrets)))

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
      const { passwordHash } = secrets
      expect(email).toBe(testUser.email)
      expect(userId).toBeDefined()
      expect(typeof userId).toBe('number')
      expect(typeof passwordHash).toBe('string')
      expect(passwordHash.length).toBeGreaterThan(0)
    })

    it('Validates that the correct user password is valid, and wrong passwords are not valid', async () => {
      const testUserEmail = 'new@email.com'
      const testUserSecret = 'thisIsASecret1234'

      const errorOrResult = await pool.withConnection(dbClient =>
        createNewUserAccount(dbClient)(testUserEmail, testUserSecret))()
      const testUserResult = getRight(errorOrResult)

      const userDataResultEither = await pool.withConnection(dbClient =>
        getUserDataByLoginWord(dbClient)(testUserResult.email))()
      const userData = getRight(userDataResultEither)

      // Attempt correct password
      const verify = await verifyUserSecrets(testUserSecret, userData)()
      const { secrets } = getRight(verify)
      expect(secrets).toBeDefined()
      expect(secrets.passwordHash).toBeDefined()
      expect(typeof secrets.passwordHash).toBe('string')
      expect(secrets.passwordHash.length).toBeGreaterThan(0)

      // Attempt incorrect passwords
      const incorrectPasswords = [
        testUserSecret.toLowerCase(),
        `${testUserSecret} `,
        ` ${testUserSecret}`,
        `${testUserSecret}v`,
        testUserSecret.substring(0, testUserSecret.length - 1),
        '',
      ]

      await Promise.all(incorrectPasswords.map(async (incorrectPassword) => {
        const verify = await verifyUserSecrets(incorrectPassword, userData)()

        pipe(
          verify,
          E.fold(
            (error) => {
              expect(error).toBeDefined()
              expect(error.message).toContain('Password did not match')
            },
            () => {
              throw Error('verifyUserSecrets returned a non-error value')
            }
          )
        )
      }))

      await pool.withConnection(dbClient => deleteUser(dbClient)(testUserResult.userId))()
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

  describe('Authentication', () => {
    it('Creates a JSON web token for user ID, and user ID can be retrieved from it', () => {
      const testUser = authTestUsers()[0]
      const { JWT_TTL } = process.env

      const expiration = getTokenExpiration(JWT_TTL)
      expect(expiration).toBeGreaterThan(0)

      const token = createJsonWebToken(testUser.userId, expiration)

      expect(token).toBeDefined()
      expect(token.length).toBeDefined()
      expect(token.length > 0).toBeTruthy()

      const eitherPayloadOrErr = getPayloadFromToken(token)
      const payload = getRight(eitherPayloadOrErr)

      expect(payload).toBeDefined()
      expect(payload.id).toBeDefined()
      expect(payload.id).toBe(testUser.userId)
      expect(payload.expiration).toBeDefined()
      expect(payload.expiration).toBe(expiration)
    })
  })
})
