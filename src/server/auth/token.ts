import { Request } from 'express'
import jwt from 'jsonwebtoken'
import { add, getUnixTime } from 'date-fns'
import * as E from 'fp-ts/lib/Either'

export interface JwtPayload {
  id: number
  expiration: number
}

export const getTokenFromReq = (req: Request): string | null => {
  const { headers: { authorization } } = req;

  return authorization
    ? authorization.substring(authorization.indexOf(' ') + 1)
    : null;
}

export const getPayloadFromToken = (token: string): E.Either<Error, JwtPayload> => {
  const { JWT_SECRET } = process.env

  return E.tryCatch(
    () => jwt.verify(token, JWT_SECRET as string) as JwtPayload,
    () => new Error(String('Authentication required')),
  )
}

export const getTokenExpiration = (jwtTTL: string | undefined): number => {
  const tokenTTLSeconds = Number.parseInt(jwtTTL as string)

  return getUnixTime(add(new Date(), { seconds: tokenTTLSeconds }))
}

export const createJsonWebToken = (userId: number, expiration: number): string => {
  const { JWT_SECRET } = process.env

  const tokenSecret = JWT_SECRET as string

  return jwt.sign({
    id: userId,
    expiration: expiration,
  }, tokenSecret)
}

export const isTokenExpired = (payload: JwtPayload): E.Either<Error, JwtPayload> => {
  const { expiration } = payload
  const now = getUnixTime(new Date())

  // TODO: Implement refresh token
  if (expiration < now) {
    return E.left(new Error('Authentication token has expired'))
  }

  return E.right(payload)
}
