import { Pool } from 'pg'
import { getDbPool } from './dbPool'
import getDbNameForEnv from './db-get-name'

const dbPort = Number.parseInt(process.env.DB_PORT || '')

const database = getDbNameForEnv(process.env.NODE_ENV)

export const rawPool = new Pool({
  database,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: dbPort,
  user: process.env.DB_USERNAME,
})

export const pool = getDbPool(rawPool)
