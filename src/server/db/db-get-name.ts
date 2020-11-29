export default (env: string | undefined): string | undefined => {
  if (env?.toLowerCase().includes('test')) {
    return process.env.DB_TEST_NAME
  }

  return process.env.DB_NAME
}
