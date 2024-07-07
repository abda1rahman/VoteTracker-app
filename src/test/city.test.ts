import supertest from "supertest"
import createServer from "../utils/serverTest"
import connect from "../utils/connect"
import mongoose from "mongoose"
import { CreateUserInput } from "../schema/user.schema"

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

    expect(res.body.status).toBe(200)
    expect(res.body.result[0]).toEqual(expect.objectContaining({
      city_id: expect.any(Number),
      city: expect.any(String)
    }))
  })
})

describe