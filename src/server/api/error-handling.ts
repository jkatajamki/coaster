import { Request, Response } from 'express'
import logger from '../lib/logging/logger'

export interface CoasterServerError {
  error: Error,
  message: string
  statusCode: number
}

export const sendErrorResponseJson = (
  err: CoasterServerError,
  _: Request,
  res: Response
): Response => {
  logger.error(err.message)
  logger.error(err.error)

  return res.status(err.statusCode).send(err.message)
}
