import { isMoreThanZeroRows } from './result-utils'

const emptyResult = {
  rowCount: 0,
  rows: [],
  command: 'SELECT',
  oid: 1,
  fields: []
}

describe('Test util functions for datbase query results', () => {
  it('Returns false for results with no rows', () => {
    const hasRows = isMoreThanZeroRows(emptyResult)

    expect(hasRows).toBeFalsy()
  })
})
