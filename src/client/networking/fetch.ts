import fetch from 'isomorphic-fetch'
import * as TE from 'fp-ts/lib/TaskEither'

export const doGet = (path: string): TE.TaskEither<Error, Response> =>
  TE.tryCatch(
    () => fetch(path),
    reason => new Error(String(reason))
  )
