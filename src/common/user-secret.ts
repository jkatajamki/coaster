import * as E from 'fp-ts/lib/Either'

export const isSecretStrongEnough = (secret: string) => secret.length > 8

export const secretIsValidOrError = (secret: string): E.Either<Error, boolean> =>
  isSecretStrongEnough(secret) ? E.right(true) : E.left(Error(String('Password is not strong enough')))
