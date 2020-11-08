import server from './server'
import logger from './lib/logging/logger'

const port = 8088

server.listen(port, () => {
  logger.info(`Server listening on port ${port} 💿 🎜 🎝`)
})
