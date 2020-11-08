import * as A from 'fp-ts/lib/Array'
import * as TE from 'fp-ts/lib/TaskEither'
import { pool } from '../../../db/db'
import { testUsers, testUserSecrets } from '../../../user/test-users'
import { upsertUser, deleteUser } from '../../../user/user'
import { User } from '../../../../common/user/User'

export const setUpTestDataForAuth = (): TE.TaskEither<Error, User[]> => {
  const insertUsers = testUsers.map(u =>
    pool.withConnection(dbClient => upsertUser(dbClient)(u, testUserSecrets)))

  return A.array.sequence(TE.taskEither)(insertUsers)
}

export const tearDownTestDataForAuth = (): TE.TaskEither<Error, string[]> => {
  const deleteUsers = testUsers.map(({ email }) =>
    pool.withConnection(dbClient => deleteUser(dbClient)(email)))

  return A.array.sequence(TE.taskEither)(deleteUsers)
}
