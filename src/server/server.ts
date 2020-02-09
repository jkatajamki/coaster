import express from 'express'
import bodyParser from 'body-parser'
import config from 'config'
import compression from 'compression'
import logger, { loggerMiddleware } from './lib/logging/logger'

const port: string = config.get('port')

const app = express()

app.use(bodyParser.json())
app.use(compression())
app.use(loggerMiddleware)

app.listen(port, () => {
  logger.info(`Server listening on port ${port} 💿 🎜 🎝`)
})
