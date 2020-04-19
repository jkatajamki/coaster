import bcrypt from 'bcrypt'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'

export interface UserSecrets {
  passwordHash: string
  salt: string
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
      TE.map(passwordHash => ({ passwordHash, salt}))
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
  secrets: UserSecrets
): TE.TaskEither<Error, UserSecrets> => pipe(
  compareSecrets(passwordAttempt, secrets.passwordHash),
  TE.chain(
    isValid => isValid
    ? TE.right(secrets)
    : TE.left(new Error(String('Password did not match')))
  )
)
