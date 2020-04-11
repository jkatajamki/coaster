import supertest from 'supertest'
import server from '../server'

describe('Ping API endpoint', () => {
  it('Returns response with status and uptime', async () => {
    const response = await supertest(server).get('/api/ping').expect(200)

    const { body: { status, uptime, ...body} } = response;

    expect(body).toBeDefined()
    expect(status).toBe('Ok')
    expect(uptime).toEqual(expect.any(Number));
  })
})
