import { execute } from '../db/client'
import { isMoreThanZeroRows } from '../db/result-utils'
import { Result } from 'neverthrow'

export const isEmailTaken = async (email: string): Promise<Result<boolean, Error>> => {
  const isEmailTakenQuery = `
    SELECT 1
    FROM coaster_user
    WHERE email = $1
  `

  const args = [email]

  const result = await execute(isEmailTakenQuery, args)

  return result.map((value) => isMoreThanZeroRows(value))
}
