import { doGet } from './fetch'
import { ApiStatus } from '../../common/status/status'

const pingApi = () => doGet<ApiStatus>('ping', {})

export default pingApi
