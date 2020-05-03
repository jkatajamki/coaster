import { Router } from 'express'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import { validateAuthentication } from '../auth/auth'
import { getUserById } from './user'
import { pool } from '../db/db'
import { handleResponse } from '../api/serverResponse'

const router = Router()

router.get('/me', (req, res) =>
  pool.withConnection(dbClient => pipe(
    TE.fromEither(validateAuthentication(req)),
    TE.chain(userId => getUserById(dbClient)(userId)),
  ))()
  .then(handleResponse(req, res))
)

export default router
