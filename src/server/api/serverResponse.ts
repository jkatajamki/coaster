import { Request, Response } from 'express'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { sendErrorResponseJson } from './errorHandling'

export interface CoasterServerResponse<A> {
  statusCode: number
  body?: A
}

export const sendServerResponse = <A>(
  serverResponse: CoasterServerResponse<A>,
  _: Request,
  res: Response
): Response => res.status(serverResponse.statusCode).send(serverResponse.body)

export const handleResponse = <A>(req: Request, res: Response) =>
  (result: E.Either<Error, A>): Response =>
    pipe(
      result,

      // TODO fixme: Allow specifying status code by arguments
      // Currently all errors are 500 and successes 200, which is not ideal
      E.fold(
        error => sendErrorResponseJson({
          error,
          message: error.message,
          statusCode: 500,
        }, req, res),

        x => sendServerResponse({
          statusCode: 200,
          body: x,
        }, req, res)
      )
    )
