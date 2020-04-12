import * as E from 'fp-ts/lib/Either'

export const isSecretStrongEnough = (secret: string): boolean => secret.length > 8

export const secretIsValidOrError = (secret: string | null | undefined): E.Either<Error, boolean> =>
  secret != null && isSecretStrongEnough(secret)
    ? E.right(true)
    : E.left(Error(String('Password is not strong enough')))
