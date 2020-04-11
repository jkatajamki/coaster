import { Request, Response } from 'express'

export interface CoasterServerResponse<A> {
  statusCode: number
  body?: A
}

export const sendServerResponse = <A>(
  serverResponse: CoasterServerResponse<A>,
  _: Request,
  res: Response
): Response => res.status(serverResponse.statusCode).send(serverResponse.body)
