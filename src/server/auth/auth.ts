import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { execute } from '../db/client'
import { isMoreThanZeroRows } from '../db/result-utils'
import { createUserPasswordHashAndSalt } from './cryptography'
import { insertNewUser, User } from '../user/user'

export const emailIsNotEmptyOrError = (email: string | null | undefined): E.Either<Error, string> =>
  email != null && email.length > 0
    ? E.right(email)
    : E.left(Error(String('Email is empty')))

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

  const newUser = {
    userId: 0,
    createdAt: now,
    updatedAt: now,
    email,
  }

  return pipe(
    createUserPasswordHashAndSalt(userSecret),
    TE.chain(secrets => insertNewUser(newUser, secrets)),
  )
}
