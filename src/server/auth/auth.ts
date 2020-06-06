import { Request, Response } from 'express'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { createUserPasswordHashAndSalt, verifyUserSecrets, createNewUserSession } from './cryptography'
import { getIsEmailTaken, upsertUser, getUserDataByLoginWord, UserData } from '../user/user'
import { SignUpRequest, SignInRequest } from './authRoutes'
import { secretIsValidOrError } from '../../common/user-secret'
import { pool } from '../db/db'
import { DbClient } from '../db/dbClient'
import { handleResponse } from '../api/serverResponse'
import { getPayloadFromToken, getTokenFromReq, isTokenExpired } from './token'
import { User } from '../../common/user/User'

export const emailIsNotEmptyOrError = (email: string | null | undefined): E.Either<Error, string> =>
  email != null && email.length > 0
    ? E.right(email)
    : E.left(Error(String('Email is empty')))

export const createNewUserAccount = (client: DbClient) => (
  email: string,
  userSecret: string
): TE.TaskEither<Error, User> => {
  const now = new Date()

  const newUser = {
    userId: 0,
    createdAt: now,
    updatedAt: now,
    email,
  }

  return pipe(
    createUserPasswordHashAndSalt(userSecret),
    TE.chain(secrets => upsertUser(client)(newUser, secrets)),
  )
}

export const validateSignUp = (
  dbClient: DbClient,
  email: string,
  userSecret: string
): TE.TaskEither<Error, boolean> => pipe(
  TE.fromEither(emailIsNotEmptyOrError(email)),

  TE.chain(() => TE.fromEither(secretIsValidOrError(userSecret))),

  TE.chain(() => getIsEmailTaken(dbClient)(email)),
)

export const signUpOrSendError = (req: Request, res: Response) =>
  ({ email, userSecret}: SignUpRequest): Promise<Response> =>
    pool.withConnection(
      dbClient => pipe(
        validateSignUp(dbClient, email, userSecret),

        TE.chain(() => createNewUserAccount(dbClient)(email, userSecret)),

        TE.map((newUser) => ({
          user: newUser,
          session: createNewUserSession(newUser.userId)
        }))
      )
    )()
    .then(handleResponse(req, res))

export const signInOrSendError = (req: Request, res: Response) =>
  (signIn: SignInRequest): Promise<Response> =>
    pool.withConnection(dbClient => pipe(

      getUserDataByLoginWord(dbClient)(signIn.loginWord),

      TE.chain((userData: UserData) => verifyUserSecrets(signIn.userSecret, userData)),

      TE.map(({ user }) => ({
        user,
        session: createNewUserSession(user.userId),
      }))

    ))().then(handleResponse(req, res))

export const validateAuthentication = (req: Request): E.Either<Error, number> => pipe(
  getPayloadFromToken(getTokenFromReq(req) as string),
  E.chain(payload => isTokenExpired(payload)),
  E.map(({ id }) => id)
)
