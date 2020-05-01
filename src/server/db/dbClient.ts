import * as pg from 'pg'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'

export type QueryParams = pg.QueryConfig | string

export interface DbClient {
  query: <A, B>(params: QueryParams, values?: B[]) => TE.TaskEither<Error, A[]>
  queryOne: <A, B>(params: QueryParams, values?: B[]) => TE.TaskEither<Error, A>
  queryNone: <B>(params: QueryParams, values?: B[]) => TE.TaskEither<Error, number>
  tx: <A>(taskEither: TE.TaskEither<Error, A>) => TE.TaskEither<Error, A>
}

export default (rawClient: pg.PoolClient): DbClient => {
  const execute = <B>(params: QueryParams, values?: B[]): TE.TaskEither<Error, pg.QueryResult> =>
    TE.tryCatch(
      () => Promise.resolve(rawClient.query(params, values)),
      error => new Error(String(error)),
    )

  const query = <A, B>(params: QueryParams, values?: B[]): TE.TaskEither<Error, A[]> =>
    pipe(
      execute(params, values),
      TE.map(
        result => result.rows
      )
    )

  const queryOne = <A, B>(params: QueryParams, values?: B[]): TE.TaskEither<Error, A> =>
    pipe(
      execute(params, values),
      TE.map(
        result => result.rows[0]
      )
    )

  const queryNone = <B>(params: QueryParams, values?: B[]): TE.TaskEither<Error, number> =>
    pipe(
      execute(params, values),
      TE.map(
        result => result.rowCount
      )
    )

  const tx = <A>(taskEither: TE.TaskEither<Error, A>): TE.TaskEither<Error, A> =>
    pipe(
      execute('BEGIN'),
      TE.chain(() => taskEither),

      TE.mapLeft(err => pipe(
        execute('ROLLBACK'),
        () => err,
      )),

      TE.map(res => pipe(
        execute('COMMIT'),
        () => res,
      ))
    )

  return { query, queryOne, queryNone, tx }
}
