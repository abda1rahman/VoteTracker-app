import supertest from "supertest"
import createServer from "../utils/serverTest"
import connect from "../utils/connect"
import mongoose from "mongoose";
import {faker} from '@faker-js/faker'
import { generateRandomNumber } from "../utils/helper";
import { CreateEnvoyInput } from "../schema/user.schema";
import { clearupTestData, createBoxForTest, createCandidateForTest } from "../utils/testSetup";

const request = supertest(createServer())

let box_id = '';
let developer;
let candidate;
let envoy;

beforeAll(async()=> {
  await connect()

  const box = await createBoxForTest()

  box_id = box.id.toString()
})
afterAll(async()=> {
  // Clean up test data after all tests
  await clearupTestData()
  await mongoose.disconnect()
})
// Create Candidate
describe('POST /api/auth/register/candidate', ()=> {
  test('should register candidate and return status 201', async()=> {
    // Example input data 
    const candidateData  = {
      firstName: "candtest",
      lastName: faker.internet.userName(),
      ssn: generateRandomNumber(),
      password:'123456',
      city_id: 1,
      phone: "0773284324",
    }

      const response =  await request
      .post('/api/auth/register/candidate')
      .send(candidateData )

        // Assertions
        expect(response.status).toBe(201)
        expect(response.body).toEqual(expect.objectContaining({
          status: 201,
          message: 'Candidate successfully registered',
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
        candidate = response.body.result;
  })
})
// Create Envoy
describe('POST /api/auth/register/envoy', ()=> {
  test('should register envoy and return 201', async()=> {
      //arrange
      const envoyData:CreateEnvoyInput  = {
        firstName: "envoytest",
        lastName: faker.internet.userName(),
        ssn: generateRandomNumber(),
        city_id: 1,
        phone: "0773284324",
        candidate_id: candidate!.id.toString(),
        box_id,
      }

      const response = await request
      .post('/api/auth/register/envoy')
      .send(envoyData)
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('envoy created successfully')
      expect(response.body.success).toBe(true)
      expect(response.body.result.id).toEqual(expect.any(String));
      expect(response.body.result.firstName).toEqual(expect.any(String));
      expect(response.body.result.lastName).toEqual(expect.any(String));
      expect(response.body.result.ssn).toEqual(expect.any(String));
      expect(response.body.result.phone).toEqual(expect.any(String));
      expect(response.body.result.city_id).toEqual(expect.any(Number));
      expect(response.body.result.role).toEqual('envoy'); // Assuming role is 'envoy' for envoy
      expect(response.body.result.token).toEqual(expect.any(String));

      envoy = response.body.result;
  })
})
// Create Developer
describe('POST /api/auth/developer/register', ()=> {
  test('should register developer and return 201', async()=> {
      //arrange
      const developerData = {
        firstName: "developertest",
        lastName: faker.internet.userName(),
        ssn: generateRandomNumber(),
        city_id: 1,
        phone: "0773284334",
      }
  
        const response = await request
        .post('/api/auth/developer/register')
        .send(developerData)
        
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Developer created successfully')
        expect(response.body.success).toBe(true)
        expect(response.body.result.firstName).toEqual(expect.any(String));
        expect(response.body.result.lastName).toEqual(expect.any(String));
        expect(response.body.result.ssn).toEqual(expect.any(String));
        expect(response.body.result.phone).toEqual(expect.any(String));
        expect(response.body.result.city_id).toEqual(expect.any(Number));
        expect(response.body.result.role).toEqual('developer'); 
        expect(response.body.result.id).toEqual(expect.any(String));
        expect(response.body.result.user_id).toEqual(expect.any(String));
        expect(response.body.result.token).toEqual(expect.any(String));
        developer = response.body.result;
    })
  })
// Login User
describe('POST /api/auth/login', ()=> {
test('should login candidate', async()=> {
  const candidateData = {
    ssn: candidate!.ssn,
    password: candidate!.ssn + '@12'
  }

  const response  = await request
  .post('/api/auth/login')
  .send(candidateData)

  expect(response.status).toBe(200)
  expect(response.body.success).toBe(true)
  expect(response.body.message).toBe('user login successfully')

})

test('should login envoy', async()=> {
  const candidateData = {
    ssn: envoy!.ssn,
    password: envoy!.ssn + '@12'
  }

  const response  = await request
  .post('/api/auth/login')
  .send(candidateData)

  expect(response.status).toBe(200)
  expect(response.body.success).toBe(true)
  expect(response.body.message).toBe('user login successfully')

})

test('should login developer', async()=> {
  const candidateData = {
    ssn: developer!.ssn,
    password: developer!.ssn + '@12'
  }

  const response  = await request
  .post('/api/auth/login')
  .send(candidateData)

  expect(response.status).toBe(200)
  expect(response.body.success).toBe(true)
  expect(response.body.message).toBe('user login successfully')

})
})