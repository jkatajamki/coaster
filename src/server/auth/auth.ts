import * as TE from 'fp-ts/lib/TaskEither'
import { execute } from '../db/client'
import { isMoreThanZeroRows } from '../db/result-utils'
import { pipe } from 'fp-ts/lib/pipeable'

export const isEmailTaken = (email: string): TE.TaskEither<Error, boolean> => {
  const isEmailTakenQuery = `
    SELECT 1
    FROM coaster_user
    WHERE email = $1
  `

  const args = [email]

  return pipe(
    execute(isEmailTakenQuery, args),
    TE.map(value => isMoreThanZeroRows(value))
  )
}
