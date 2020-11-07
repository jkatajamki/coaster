export interface ApiConfig {
  baseUrl: string
  port: number
  apiSuffix: string
}

export const apiConfig = {
  port: 8088,
  baseUrl: 'localhost',
  apiSuffix: 'api',
}
