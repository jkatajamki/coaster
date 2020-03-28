import { Pool, PoolClient } from 'pg'
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither'
import config from 'config'

interface DbConfig {
  driver: string
  host: string
  port: number
  database: string
  user: string
  password: string
  env: string
  max?: number
  idleTimeoutMillis: number
}

export default (): TaskEither<Error, PoolClient> => {
  const dbConfig: DbConfig = config.get('db')

  const pool = new Pool({
    database: dbConfig.database,
    host: dbConfig.host,
    password: dbConfig.password,
    port: dbConfig.port,
    user: dbConfig.user,
  })

  return tryCatch<Error, PoolClient>(
    () => Promise.resolve(pool.connect()),
    reason => new Error(String(reason))
  )
}
