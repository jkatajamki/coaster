import { Pool } from 'pg'
import config from 'config'
import { getDbPool } from './dbPool'

export interface DbConfig {
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

const dbConfig: DbConfig = config.get('db')

export const rawPool = new Pool({
  database: dbConfig.database,
  host: dbConfig.host,
  password: dbConfig.password,
  port: dbConfig.port,
  user: dbConfig.user,
})

export const pool = getDbPool(rawPool)
