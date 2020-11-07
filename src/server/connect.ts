import server from './server'
import logger from './lib/logging/logger'
import { apiConfig } from '../common/config/api';

const { port } = apiConfig

server.listen(port, () => {
  logger.info(`Server listening on port ${port} 💿 🎜 🎝`)
})
