import bcrypt from 'bcrypt'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'

export interface UserSecrets {
  passwordHash: string
  salt: string
}

// TODO:
// Validate user password (needs to be long enough)
// Write unit tests

export const createUserPasswordHashAndSalt = (
  userSecret: string
): TE.TaskEither<Error, UserSecrets> =>
  pipe(
    TE.tryCatch(
      () => bcrypt.genSalt(12),
      reason => new Error(String(reason))
    ),
    TE.chain(salt => pipe(
      TE.tryCatch(
        () => bcrypt.hash(userSecret, salt),
        reason => new Error(String(reason))
      ),
      TE.map(passwordHash => ({ passwordHash, salt}))
    ))
  )
