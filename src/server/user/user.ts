import * as TE from 'fp-ts/lib/TaskEither'
import { execute } from '../db/client'
import { pipe } from 'fp-ts/lib/pipeable'
import logger from '../lib/logging/logger'

export interface User {
  userId: bigint
  createdAt: Date
  updatedAt: Date
  email: string
  userSecret: string
  salt: string
}

export const insertNewUser = (user: User): TE.TaskEither<Error, any> => {
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
    TE.map(res => {
      // Parse response here
      logger.info('Got response from db client')
      console.table(res)
      return res
    })
  )
}
