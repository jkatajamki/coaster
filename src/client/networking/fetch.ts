import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import axios from 'axios'
import { ApiConfig, apiConfig } from '../../common/config/api'

export interface HttpRequestParams {
  userAuthToken?: string,
}

const getApiUrl = ({
  baseUrl,
  apiSuffix
}: Partial<ApiConfig>): string => `${baseUrl}${apiSuffix}/`

const apiClient = axios.create({
  baseURL: getApiUrl(apiConfig),
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getHttpRequestHeaders = (params: HttpRequestParams): Record<string, string> => {
  const { userAuthToken } = params

  return {
    'Authorization': userAuthToken ?? '',
  }
}

export const doGet = <T>(
  path: string,
  params: HttpRequestParams
): TE.TaskEither<Error, T> => pipe(
  TE.tryCatch(
    () => apiClient.get(path, {
      headers: getHttpRequestHeaders(params),
    }),
    reason => new Error(String(reason)),
  ),
  TE.map(x => x.data)
)
