import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'
import { UserSecrets } from '../auth/cryptography'
import { DbClient } from '../db/db-client'

export interface User {
  userId: number
  createdAt: Date
  updatedAt: Date
  email: string
}

export interface UserData {
  user: User
  secrets: UserSecrets
}

export type DbUserId = string

export interface DbUser {
  readonly user_id: DbUserId
  readonly created_at: Date
  readonly email: string
  readonly user_secret: string
  readonly salt: string
  readonly updated_at: Date
}

export const upsertUser = (client: DbClient) => (
  user: User,
  secrets: UserSecrets
): TE.TaskEither<Error, User> => {
  const upsertUserSQL = `
    INSERT INTO coaster_user (
      created_at,
      email,
      user_secret,
      salt,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT(email) DO UPDATE SET
      user_secret = $3,
      salt = $4,
      updated_at = $5
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
    client.queryOne<DbUser, string | Date | number>(upsertUserSQL, args),
    TE.map((result) => ({
      ...user,
      userId: Number.parseInt(result.user_id),
    }))
  )
}

export const deleteUser = (client: DbClient) => (
  userId: number
): TE.TaskEither<Error, number> => {
  const deleteUser = `DELETE FROM coaster_user WHERE user_id = $1`

  const args = [userId]

  return pipe(
    client.queryOne(deleteUser, args),
    TE.map(() => userId)
  )
}

export const getIsEmailTaken = (client: DbClient) => (
  email: string
): TE.TaskEither<Error, boolean> => {
  const isEmailTakenQuery = `
    SELECT 1
    FROM coaster_user
    WHERE email = $1
  `

  const args = [email]

  return pipe(
    client.queryNone(isEmailTakenQuery, args),
    TE.chain(
      (value) => value > 0
        ? TE.left(Error('Email is already taken'))
        : TE.right(false)
      ),
  )
}

export const mapResultToUserData = (result: DbUser): UserData => {
  const user = {
    userId: Number.parseInt(result.user_id),
    createdAt: result.created_at,
    updatedAt: result.updated_at,
    email: result.email,
  }

  const secrets = {
    passwordHash: result.user_secret,
    salt: result.salt,
  }

  return { user, secrets }
}

export const getUserDataByLoginWord = (client: DbClient) => (
  loginWord: string
): TE.TaskEither<Error, UserData> => {
  const getUserDataQuery = `
    SELECT
      user_id,
      created_at,
      email,
      user_secret,
      salt,
      updated_at
    FROM coaster_user
    WHERE email = $1
  `

  const args = [loginWord]

  return pipe(
    client.queryOne<DbUser, string>(getUserDataQuery, args),
    TE.chain((result) => {
      if (result == null) {
        return TE.left(Error(String('Cannot find user data by login word')))
      }

      return TE.right(mapResultToUserData(result))
    }),
  )
}
