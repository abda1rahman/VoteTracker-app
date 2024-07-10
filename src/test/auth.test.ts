import supertest from "supertest"
import createServer from "../utils/serverTest"
import connect from "../utils/connect"
import mongoose from "mongoose";
import {faker} from '@faker-js/faker'
import { generateRandomNumber } from "../utils/helper";
import { createBox, Ibox } from "../service/box.service";
import log from "../utils/logger";
import { createCandidate } from "../service/auth.service";
import { deleteCandidateById, deleteEnvoyById, findCandidateById, findEnvoyById, findUserBySsn } from "../service/user.service";
import { EnvoyModelType } from "../model/users.model";
import { CreateEnvoyInput } from "../schema/user.schema";
import { IEnvoyUser } from "./types";

const request = supertest(createServer())

let box_id = '';
let candidate_id = '';
let userCandidate = '';
let envoy_id = '';
let userEnvoyId = '';


beforeAll(async()=> {
  await connect()

  const box = await createBoxForTest()
  const candidate = await createCandidateForTest()

  box_id = box.id.toString()
  candidate_id = candidate.id.toString();
  userCandidate = candidate.user_id.toString()
})
afterAll(async()=> {
  // Clean up test data after all tests
  await clearupTestData()
  await mongoose.disconnect()
})

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



  })
})

describe('POST /api/auth/register/envoy', ()=> {
  test('should register envoy and return 201', async()=> {

  const envoyData:CreateEnvoyInput  = {
    firstName: "envoytest",
    lastName: faker.internet.userName(),
    ssn: generateRandomNumber(),
    city_id: 1,
    phone: "0773284324",
    candidate_id,
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
      envoy_id = response.body.result.id.toString();
      userEnvoyId = response.body.result.user_id.toString()
  })
})

async function createBoxForTest(){
  const boxData = {
    "log": 238473824,
    "lat": 2384723847,
    "city_id": 1,
    "boxName": "box" + generateRandomNumber(100, 1000000)
}

try {
  const box = await createBox(boxData) 
  return box as Ibox
} catch (error) {
  log.info('error_register_box: ', error)
  fail(error)
}
}

async function createCandidateForTest(){
  try {
    const candidateData  = {
      firstName: "cand",
      lastName: faker.internet.userName(),
      password:'123456',
      ssn: generateRandomNumber(),
      city_id: 1,
      phone: "0773284324",
    }
    const candidate = await createCandidate(candidateData)

    return candidate 
  } catch (error:any) {
    log.error(error);
    fail(error)
  }
}

async function clearupTestData() {

  const envoy = await findEnvoyById(envoy_id)
  // await deleteEnvoyById(userEnvoyId, envoy_id)
  await deleteCandidateById(userCandidate, candidate_id)
}