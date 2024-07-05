import supertest from "supertest"
import createServer from "../utils/serverTest"
import connect from "../utils/connect"
import mongoose from "mongoose"

const request = supertest(createServer())

beforeAll(async()=> {
  await connect()
})
afterAll(async()=> {
  await mongoose.disconnect()
})

describe('GET /api/cities ', ()=> {
  it('should return all cities with status 200 ', async()=> {
    const res = await request.get('/api/allCity')
    
    expect(res.body.result[0]).toMatchObject({city: expect(string)})
  })
})