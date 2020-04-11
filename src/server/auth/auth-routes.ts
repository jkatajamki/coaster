import { Router, Request, Response } from 'express'
import { getIsEmailTaken, createNewUserAccount } from './auth'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { sendErrorResponseJson } from '../api/error-handling'
import { sendServerResponse } from '../api/server-response'
import { User } from '../user/user'
import { secretIsValidOrError } from '../../common/user-secret'

const router = Router()

const handleSignUpResponse = (req: Request, res: Response) =>
  (userOrErr: E.Either<Error, User>): Response =>
    pipe(
      userOrErr,

      E.fold(
        (error: Error) => sendErrorResponseJson({
          error,
          message: error.message,
          statusCode: 500,
        }, req, res),

        (x) => sendServerResponse({
          statusCode: 200,
          body: x,
        }, req, res)
      )
)

const signUpOrSendError = (req: Request, res: Response) =>
  (email: string, userSecret: string): Promise<Response> =>
    pipe(
      getIsEmailTaken(email),

      TE.map(() => secretIsValidOrError(userSecret)),

      TE.chain(() => createNewUserAccount(email, userSecret)),
    )()
      .then(handleSignUpResponse(req, res))

router.post('/signUp', (req, res) => {
  const { params: { email, userSecret } } = req

  return signUpOrSendError(req, res)(email, userSecret)
})

export default router
