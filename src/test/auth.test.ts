import supertest from "supertest"
import createServer from "../utils/serverTest"
import connect from "../utils/connect"
import mongoose from "mongoose";
import {faker} from '@faker-js/faker'
import { generateRandomNumber } from "../utils/helper";
import { deleteUserById } from "../controller/user.controller";
import { CandidteModelType } from "../model/users.model";
import { object } from "zod";

const request = supertest(createServer())

beforeAll(async()=> {
  await connect()
})
afterAll(async()=> {
  await mongoose.disconnect()
})

describe('POST /api/auth/register/candidate', ()=> {
  test('should register candidate and return status 201', async()=> {
    // Example input data 
    const candidateData  = {
      firstName: "cand",
      lastName: faker.internet.userName(),
      ssn: generateRandomNumber(),
      city_id: 1,
      phone: "0773284324",
    }
    try{

      const response =  await request
      .post('/api/auth/register/candidate')
      .send(candidateData )
      
      // Assertions
      expect(response.status).toBe(201)
      expect(response.body).toEqual(expect.objectContaining({
      status: 201,
      message: 'User successfully registered',
      result: expect.objectContaining({
        id: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        ssn: expect.any(String),
        phone: expect.any(String),
        city_id: expect.any(Number),
        role: expect.any(String),
        token: expect.any(String)
      })
    }))
  }catch(error){
    console.log(error)
    fail(error)
  }

  })
})

describe('POST /api/auth/register/envoy', ()=> {
  let boxId = "";
  test('should register box and return 201', async()=> {

      const boxData = {
          "log": 238473824,
          "lat": 2384723847,
          "city_id": 1,
          "boxName": "box" + generateRandomNumber(100, 1000000)
      }

      try {
        const response = await request.post('/api/developer/registerBox')
        .send(boxData)
        boxId = response.body.result.id
      } catch (error) {
        console.log('error_register_box: ', error)
        fail(error)
      }
  })

  test('should register envoy and return 201', async()=> {

  const envoyData  = {
    firstName: "envoy",
    lastName: faker.internet.userName(),
    ssn: generateRandomNumber(),
    city_id: 1,
    phone: "0773284324",
    candidate_id: "666ce063a9d344bb47074d5c",
    box_id: boxId
  }

    try {
      const response = await request
      .post('/api/auth/register/envoy')
      .send(envoyData)

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('envoy created successfully')
      expect(response.body.success).toBe(true)
      expect(Object.keys(response.body.result).length).toBe(10)
    } catch (error:any) {
      fail(error)
    }
  })
})