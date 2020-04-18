import * as pg from 'pg'
import * as TE from 'fp-ts/lib/TaskEither'
import { DbClient } from './db-client'
import { pipe } from 'fp-ts/lib/pipeable'
import initDbClient, { QueryParams } from './db-client'

export interface DbPool {
  query: <A, B>(params: QueryParams, values?: B[]) => TE.TaskEither<Error, A[]>
  queryOne: <A, B>(params: QueryParams, values?: B[]) => TE.TaskEither<Error, A>
  queryNone: <B>(params: QueryParams, values?: B[]) => TE.TaskEither<Error, number>
  tx: <A>(queryTask: TE.TaskEither<Error, A>) => TE.TaskEither<Error, A>
  withConnection: <A>(fn: (client: DbClient) => TE.TaskEither<Error, A>) => TE.TaskEither<Error, A>
}

export const getDbPool = (rawPool: pg.Pool): DbPool => {
  const connect = (): TE.TaskEither<Error, pg.PoolClient> => TE.tryCatch(
    () => Promise.resolve(rawPool.connect()),
    error => new Error(String(error)),
  )

  const withConnection = <A>(fn: (client: DbClient) => TE.TaskEither<Error, A>): TE.TaskEither<Error, A> =>
    pipe(
      connect(),
      TE.chain(rawClient => {
        const done = <A>(result: A): A => {
          rawClient.release()
          return result
        }

        return pipe(
          fn(initDbClient(rawClient)),
          TE.bimap(done, done)
        )
      })
    )

  const query = <A, B>(params: QueryParams, values?: B[]): TE.TaskEither<Error, A[]> =>
    withConnection(client => client.query<A, B>(params, values))

  const queryOne = <A, B>(params: QueryParams, values?: B[]): TE.TaskEither<Error, A> =>
    withConnection(client => client.queryOne<A, B>(params, values))

  const queryNone = <B>(params: QueryParams, values?: B[]): TE.TaskEither<Error, number> =>
    withConnection(client => client.queryNone(params, values))

  const tx = <A>(queryTask: TE.TaskEither<Error, A>): TE.TaskEither<Error, A> =>
    withConnection(client => client.tx(queryTask))

  return { withConnection, query, queryOne, queryNone, tx }
}
