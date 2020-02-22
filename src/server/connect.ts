import config from 'config'
import server from './server'
import logger from './lib/logging/logger'

const port: string = config.get('port')

server.listen(port, () => {
  logger.info(`Server listening on port ${port} 💿 🎜 🎝`)
})
