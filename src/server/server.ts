import dotenv from 'dotenv-safe'

dotenv.config();

import express from 'express'
import bodyParser from 'body-parser'
import compression from 'compression'
import { loggerMiddleware } from './lib/logging/logger'
import router from './routes/routes'
import 'source-map-support/register'

const server = express()

server.use(bodyParser.json())
server.use(compression())
server.use(loggerMiddleware)

server.use('/api', router)

export default server
