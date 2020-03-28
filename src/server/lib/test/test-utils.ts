import * as E from 'fp-ts/lib/Either'

export const getRight = <A>(either: E.Either<Error, A>): A =>
  E.fold<Error, A, A>(e => {
    throw e;
  }, x => x)(either)
