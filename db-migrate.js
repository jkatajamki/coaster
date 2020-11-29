#!/usr/bin/env node

require('dotenv').config()

const DBMigrate = require('db-migrate')

const env = process.env.NODE_ENV

const dbConfig = {
  [env]: {
    driver: 'pg',
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: '0.0.0.0',
    database: `coaster${env}`
  },
}

const migrationConfig = {
  ...dbConfig,
  'sql-file': true,
}

DBMigrate.getInstance(false, {
  config: migrationConfig
}, (migrator, _, __, originalErr) => {
  migrator.driver.close(err => {
    if (originalErr || err) {
      console.error('Running migrations failed', originalErr || err)
      process.exit(1)
    }
    console.log('Run migrations successfully!')
  })
}).run()
