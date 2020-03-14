#!/usr/bin/env node

require('dotenv').config()

const DBMigrate = require('db-migrate')
const config = require('config')

const env = process.env.NODE_ENV

const dbConfig = {
  [env]: config.get('db')
};

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
  });
}).run()
