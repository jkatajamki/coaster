import { Pool } from 'pg'
import { getDbPool } from './dbPool'

const dbPort = Number.parseInt(process.env.DB_PORT || '')

export const rawPool = new Pool({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: dbPort,
  user: process.env.DB_USERNAME,
})

export const pool = getDbPool(rawPool)
