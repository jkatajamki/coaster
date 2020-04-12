import * as TE from 'fp-ts/lib/TaskEither'
import { execute } from '../db/client'
import { pipe } from 'fp-ts/lib/pipeable'
import { QueryResult } from 'pg'
import { UserSecrets } from '../auth/cryptography'
import { isMoreThanZeroRows } from '../db/result-utils'

export interface User {
  userId: number
  createdAt: Date
  updatedAt: Date
  email: string
}

export interface ReturningRow {
  user_id: string
}

export const pluckNewlyInsertedUserIdFromResult = (result: QueryResult<ReturningRow>): number => {
  const { rows } = result

  return Number(rows[0].user_id)
}

export const insertNewUser = (
  user: User,
  secrets: UserSecrets
): TE.TaskEither<Error, User> => {
  const insertNewUser = `
    INSERT INTO coaster_user (
      created_at,
      email,
      user_secret,
      salt,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      user_id
  `

  const args = [
    user.createdAt,
    user.email,
    secrets.passwordHash,
    secrets.salt,
    user.updatedAt,
  ]

  return pipe(
    execute(insertNewUser, args),
    TE.map((result) => {
      const lastInsertUserId = pluckNewlyInsertedUserIdFromResult(result as QueryResult<ReturningRow>)

      return {
        ...user,
        userId: lastInsertUserId,
      }
    })
  )
}

export const deleteUser = (userId: number): TE.TaskEither<Error, number> => {
  const deleteUser = `DELETE FROM coaster_user WHERE user_id = $1`

  const args = [userId]

  return pipe(
    execute(deleteUser, args),
    TE.map(() => userId)
  )
}

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
