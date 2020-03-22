import { Result, ok, err } from 'neverthrow'
import { QueryResult } from 'pg'
import db from './db'
import logger from '../lib/logging/logger'

export const execute = async <T, A>(
  query: string,
  args?: A[]
): Promise<Result<QueryResult<T>, Error>> => {
  const dbClient = await db()

  try {
    const result = await dbClient.query(query, args)

    return ok(result)
  } catch (error) {
    logger.error(error)

    return err(error)
  }
}

export const tx = async <T>(
  action: Promise<Result<QueryResult<T>, Error>>
): Promise<Result<QueryResult<T>, Error>> => {
  await execute('BEGIN')

  try {
    const result = await action

    await execute('COMMIT')

    return result
  } catch (error) {
    await execute('ROLLBACK')

    return err(error)
  }
}
