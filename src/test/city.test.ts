import supertest from "supertest"
import createServer from "../utils/serverTest"
import {connectDB} from "../utils/connect"
import mongoose from "mongoose"
import client from "../redis"

const request = supertest(createServer())

beforeAll(async()=> {
  await connectDB()
})
afterAll(async()=> {
  await mongoose.disconnect()
  await client.quit(); 
})

describe('GET /api/cities ', ()=> {
  it('should return all cities with status 200 ', async()=> {
    const res = await request.get('/api/cities')

    expect(res.body.status).toBe(200)
    expect(res.body.result[0]).toEqual(expect.objectContaining({
      city_id: expect.any(Number),
      city: expect.any(String)
    }))
  })
})

describe