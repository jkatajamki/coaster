import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
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

export const getUserFromToken = (token: string): E.Either<Error, JwtPayload> => {
  const { JWT_SECRET } = process.env

  return E.tryCatch(
    () => jwt.verify(token, JWT_SECRET as string) as JwtPayload,
    reason => new Error(String(reason)),
  )
}

/*
export const authorization = (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFromReq(req)


}
*/
