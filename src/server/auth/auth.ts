import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'
import { execute } from '../db/client'
import { isMoreThanZeroRows } from '../db/result-utils'
import { createUserPasswordHashAndSalt, UserSecrets } from './cryptography'
import { insertNewUser, User } from '../user/user'

export const getIsEmailTaken = (
  email: string
): TE.TaskEither<Error, boolean> => {
  const isEmailTakenQuery = `
    SELECT 1
    FROM coaster_user
    WHERE email = $1
  `

  const args = [email]

  return pipe(
    execute(isEmailTakenQuery, args),
    TE.chain((value) => isMoreThanZeroRows(value)
      ? TE.left(Error('Email is already taken'))
      : TE.right(false)
    ),
  )
}

export const createNewUserAccount = (
  email: string,
  userSecret: string
): TE.TaskEither<Error, User> => {
  const now = new Date()

  const newUserWithSecret = ({ passwordHash, salt }: UserSecrets): User => ({
    userId: 0,
    createdAt: now,
    updatedAt: now,
    email,
    userSecret: passwordHash,
    salt,
  })

  return pipe(
    createUserPasswordHashAndSalt(userSecret),
    TE.chain(secrets => insertNewUser(newUserWithSecret(secrets))),
  )
}
