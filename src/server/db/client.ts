import { QueryResult, PoolClient } from 'pg'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'
import db from './db'

export const execute = <A, B>(
  query: string,
  args?: B[]
): TE.TaskEither<Error, QueryResult<A>> => {
  const doExecute = <A>(dbClient: PoolClient): TE.TaskEither<Error, QueryResult<A>> =>
    TE.tryCatch<Error, QueryResult<A>>(
      () => dbClient.query(query, args),
      reason => new Error(String(reason))
    )

  return pipe(
    db(),
    TE.chain(poolClient => doExecute(poolClient))
  )
}

const beginTx = <A>(): TE.TaskEither<Error, QueryResult<A>> => execute('BEGIN')

const commitTx = <A>(): TE.TaskEither<Error, QueryResult<A>> => execute('COMMIT')

const rollbackTx = <A>(): TE.TaskEither<Error, QueryResult<A>> => execute('ROLLBACK')

export const tx = <A>(
  action: TE.TaskEither<Error, QueryResult<A>>
): TE.TaskEither<Error, QueryResult<A>> =>
  pipe(
    beginTx(),
    TE.chain(() => action),

    TE.mapLeft(err => pipe(
      rollbackTx(),
      () => err
    )),

    TE.map(res => pipe(
      commitTx(),
      () => res
    ))
  )
