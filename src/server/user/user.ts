import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'
import { UserSecrets } from '../auth/cryptography'
import { DbClient } from '../db/dbClient'

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
      updated_at
    )
    VALUES ($1, $2, $3, $4)
    ON CONFLICT(email) DO UPDATE SET
      user_secret = $3,
      updated_at = $4
    RETURNING
      user_id
  `

  const args = [
    user.createdAt,
    user.email,
    secrets.passwordHash,
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
  email: string
): TE.TaskEither<Error, string> => {
  const deleteUser = `DELETE FROM coaster_user WHERE email = $1`

  const args = [email]

  return pipe(
    client.queryOne(deleteUser, args),
    TE.map(() => email)
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
      updated_at
    FROM coaster_user
    WHERE email = $1
  `

  const args = [loginWord]

  return pipe(
    client.queryOne<DbUser, string>(getUserDataQuery, args),
    TE.chain((result) => {
      if (result == null) {
        return TE.left(Error(String(`Cannot find user data by ${loginWord}`)))
      }

      return TE.right(mapResultToUserData(result))
    }),
  )
}

export const mapResultToUser = (result: DbUser): User => ({
  userId: Number.parseInt(result.user_id),
  createdAt: result.created_at,
  updatedAt: result.updated_at,
  email: result.email,
})

export const getUserById = (client: DbClient) =>
  (userId: number): TE.TaskEither<Error, User> => {
    const getUserQuery = `
      SELECT
        user_id,
        created_at,
        email,
        updated_at
      FROM coaster_user
      WHERE user_id = $1
    `

    const args = [userId]

    return pipe(
      client.queryOne<DbUser, number>(getUserQuery, args),
      TE.chain((result) => {
        if (result == null) {
          return TE.left(Error(String(`Cannot find user by id ${userId}`)))
        }

        return TE.right(mapResultToUser(result))
      })
    )
  }
