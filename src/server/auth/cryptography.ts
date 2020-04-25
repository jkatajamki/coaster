import bcrypt from 'bcrypt'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'
import { add, getUnixTime } from 'date-fns'
import jwt from 'jsonwebtoken'
import { UserData } from '../user/user'

export interface UserSecrets {
  passwordHash: string
}

export interface UserSession {
  jsonWebToken: string
}

const delay = (t: number): Promise<void> => new Promise(resolve => setTimeout(resolve, t))

export const createPasswordHash = (
  secret: string,
  salt: string
): TE.TaskEither<Error, string> =>
  TE.tryCatch(
    () => bcrypt.hash(secret, salt),
    reason => new Error(String(reason))
  )

export const createUserPasswordHashAndSalt = (
  userSecret: string
): TE.TaskEither<Error, UserSecrets> =>
  pipe(
    TE.tryCatch(
      () => bcrypt.genSalt(12),
      reason => new Error(String(reason))
    ),
    TE.chain(salt => pipe(
      createPasswordHash(userSecret, salt),
      TE.map(passwordHash => ({ passwordHash }))
    ))
  )

export const compareSecrets = (
  expected: string,
  actual: string
): TE.TaskEither<Error, boolean> => {
  const timeout = Math.floor(Math.random() * 50) + 50;

  return TE.tryCatch(
    () => delay(timeout)
      .then(() => bcrypt.compare(expected, actual)),
    reason => new Error(String(reason))
  )
}

export const verifyUserSecrets = (
  passwordAttempt: string,
  userData: UserData
): TE.TaskEither<Error, UserData> => pipe(
  compareSecrets(passwordAttempt, userData.secrets.passwordHash),

  TE.chain(
    isValid => isValid
    ? TE.right(userData)
    : TE.left(new Error(String('Password did not match')))
  )
)

export const createJsonWebToken = (userId: number): string => {
  const { JWT_SECRET, JWT_TTL } = process.env

  const tokenTTLSeconds = Number.parseInt(JWT_TTL as string)
  const tokenSecret = JWT_SECRET as string

  const expiration = getUnixTime(add(new Date(), { seconds: tokenTTLSeconds }))

  return jwt.sign({
    id: userId,
    expiration: expiration,
  }, tokenSecret)
}

export const createNewUserSession = (userId: number): UserSession => {
  const jsonWebToken = createJsonWebToken(userId)
  // TODO: persist session in an in-memory data store (like Redis or such) here

  return {
    jsonWebToken
  }
}
