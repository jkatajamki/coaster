import * as TE from 'fp-ts/lib/TaskEither'
import { execute } from '../db/client'
import { pipe } from 'fp-ts/lib/pipeable'

export interface User {
  userId: number
  createdAt: Date
  updatedAt: Date
  email: string
  userSecret: string
  salt: string
}

export const insertNewUser = (user: User): TE.TaskEither<Error, User> => {
  const insertNewUser = `
    INSERT INTO coaster_user (
      created_at,
      email,
      user_secret,
      salt,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5)
  `

  const args = [
    user.createdAt,
    user.email,
    user.userSecret,
    user.salt,
    user.updatedAt,
  ]

  return pipe(
    execute(insertNewUser, args),
    TE.map(() => user)
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
