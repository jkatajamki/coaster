
import * as TE from 'fp-ts/lib/TaskEither'
import { doGet } from './fetch'
import { ApiStatus } from '../../common/status/status'

const pingApi = (): TE.TaskEither<Error, ApiStatus> => doGet<ApiStatus>('ping', {})

export default pingApi
