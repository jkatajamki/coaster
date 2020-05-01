import { Router } from 'express'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import { validateAuthentication } from '../auth/auth'
import { getUserById } from './user'
import { pool } from '../db/db'

const router = Router()

// TODO: write integration test that
// 1. signs up
// 2. signs in
// 3. GETs /me

router.get('/me', req => pool.withConnection(
  dbClient => pipe(
    TE.fromEither(validateAuthentication(req)),
    TE.chain(userId => getUserById(dbClient)(userId))
  )
))

export default router
