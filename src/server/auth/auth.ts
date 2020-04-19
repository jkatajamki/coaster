import { Request, Response } from 'express'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { createUserPasswordHashAndSalt, verifyUserSecrets } from './cryptography'
import { User, getIsEmailTaken, upsertUser, getUserDataByLoginWord } from '../user/user'
import { SignUpRequest, SignInRequest } from './auth-routes'
import { secretIsValidOrError } from '../../common/user-secret'
import { pool } from '../db/db'
import { DbClient } from '../db/db-client'
import { handleResponse } from '../api/server-response'

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

export const signUpOrSendError = (req: Request, res: Response) =>
  ({ email, userSecret}: SignUpRequest): Promise<Response> =>
    pool.withConnection(
      dbClient => pipe(
        TE.fromEither(emailIsNotEmptyOrError(email)),

        TE.chain(() => TE.fromEither(secretIsValidOrError(userSecret))),

        TE.chain(() => getIsEmailTaken(dbClient)(email)),

        TE.chain(() => createNewUserAccount(dbClient)(email, userSecret)),
      )
    )()
    .then(handleResponse(req, res))

export const signInOrSendError = (req: Request, res: Response) =>
  (signIn: SignInRequest): Promise<Response> =>
    // TODO
    // Create a new session for user
    // Return session and user data
    pool.withConnection(
      dbClient => pipe(
        getUserDataByLoginWord(dbClient)(signIn.loginWord),
        TE.chain(userData => verifyUserSecrets(signIn.userSecret, userData.secrets))
      )
    )()
    .then(handleResponse(req, res))
