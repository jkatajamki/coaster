import { QueryResult } from 'pg';

export const isMoreThanZeroRows = <T>(result: QueryResult<T>): boolean => {
  const { rowCount } = result

  return rowCount > 0
}
