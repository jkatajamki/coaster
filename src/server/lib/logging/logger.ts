import { transports, createLogger, format } from 'winston'
import expressWinston from 'express-winston'
import { TransformableInfo } from 'logform'

const LOG_DIR = `${__dirname}/../../../logs/`

const printFormat = (info: TransformableInfo): string =>
  `${info.timestamp} - ${info.level}: ${info.message}`

// TODO: Trace logging for errors

const formatConfig = {
  default: format.combine(
    format.timestamp(),
    format.colorize(),
    format.printf(printFormat)
  ),
}

const transportsConfig = {
  default: [
    new transports.Console(),
    new transports.File({ filename: `${LOG_DIR}/debug.log` }),
  ],
}

const exceptionHandlersConfig = {
  default: [
    new transports.Console(),
    new transports.File({ filename: `${LOG_DIR}/error.log` }),
  ],
}

const logger = createLogger({
  level: 'info',
  format: formatConfig.default,
  transports: transportsConfig.default,
  exceptionHandlers: exceptionHandlersConfig.default,
  exitOnError: false,
})

export default logger

export const loggerMiddleware = expressWinston.logger({ winstonInstance: logger })
