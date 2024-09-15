import mongoose from "mongoose";
import {connectDB} from "../utils/connect"
import supertest from "supertest";
import createServer from "../utils/serverTest";
import { faker } from "@faker-js/faker";
import { clearupTestBox, createEnvoyTest } from "../utils/testSetup";
import { generateRandomNumber } from "../utils/helper";
import { IEnvoyWithBoxName } from "./types";
import client from "../redis";

const request = supertest(createServer());

let box;
let member: any;
let envoy: IEnvoyWithBoxName

beforeAll(async () => {
  // connect to database
  await connectDB();
  envoy = await createEnvoyTest();
},10000);

afterAll(async () => {
  // cleanup test
  await clearupTestBox()
  await mongoose.disconnect();
  await client.quit(); 
});

// Register Box
describe("POST Register Box", () => {
  test("should register box and return 201", async () => {
    const boxData = {
      log: "32847238",
      lat: "238947324",
      city_id: 1,
      boxName: "box" + faker.number.int(1000),
    };

    const response = await request
      .post("/api/boxes")
      .send(boxData);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toEqual("Box created successfully");
    expect(response.body.result.log).toEqual(expect.any(String));
    expect(response.body.result.lat).toEqual(expect.any(String));
    expect(response.body.result.city_id).toEqual(expect.any(Number));
    expect(response.body.result.boxName).toEqual(expect.any(String));
    expect(response.body.result.city).toEqual(expect.any(String));
    expect(response.body.result.id).toEqual(expect.any(String));

    box = response.body.result;
  });
});

// Register Member
describe("POST Create Member", () => {
  test("should create member and return 201", async () => {

    const memberData = {
      firstName: faker.internet.userName(),
      secondName: faker.internet.userName(),
      thirdName: faker.internet.userName(),
      lastName: faker.internet.userName(),
      ssn: generateRandomNumber(),
      city_id: 1,
      boxName: envoy.boxName,
      identity: parseInt(generateRandomNumber(1, 100))
    };

    const response = await request
    .post("/api/members")
    .send(memberData);
    
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toEqual("Box member created successfully");
    expect(response.body.result.ssn).toEqual(expect.any(String));
    expect(response.body.result.firstName).toEqual(expect.any(String));
    expect(response.body.result.lastName).toEqual(expect.any(String));
    expect(response.body.result.id).toEqual(expect.any(String));

    member = response.body.result;
  });
});

// Get All Boxes
describe("GET All Boxes", () => {
  test("should return list of all boxes with 200", async () => {
    let city_id = 1;

    const response = await request.get(`/api/boxes/cities/${city_id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toEqual("All Boxes");
    expect(response.body.result[0].city_id).toEqual(expect.any(Number));
    expect(response.body.result[0].log).toEqual(expect.any(String));
    expect(response.body.result[0].lat).toEqual(expect.any(String));
    expect(response.body.result[0].boxName).toEqual(expect.any(String));
    expect(response.body.result[0].city).toEqual(expect.any(String));
    expect(response.body.result[0].id).toEqual(expect.any(String));
  });
});

// Get Box By BoxName & City_id
describe("GET Box and List Members", () => {
  test("should box details and list member with 200", async () => {
    const response = await request.get(
      `/api/boxes?boxName=${box!.boxName}&city_id=${box!.city_id}`
    );


    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toEqual("Box member");
    expect(response.body.result.boxInfo.id).toEqual(expect.any(String));
    expect(response.body.result.boxInfo.city.city_id).toEqual(
      expect.any(Number)
    );
    expect(response.body.result.boxInfo.city.cityName).toEqual(
      expect.any(String)
    );
    expect(response.body.result.boxInfo.log).toEqual(expect.any(String));
    expect(response.body.result.boxInfo.lat).toEqual(expect.any(String));
    expect(response.body.result.boxInfo.boxName).toEqual(expect.any(String));
  });
});

// Get All Boxes
describe("GET All Boxes", () => {
  test("should return list of all boxes with 200", async () => {
    let city_id = 1;

    const response = await request.get(`/api/boxes/cities/${city_id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toEqual("All Boxes");
    expect(response.body.result[0].city_id).toEqual(expect.any(Number));
    expect(response.body.result[0].log).toEqual(expect.any(String));
    expect(response.body.result[0].lat).toEqual(expect.any(String));
    expect(response.body.result[0].boxName).toEqual(expect.any(String));
    expect(response.body.result[0].city).toEqual(expect.any(String));
    expect(response.body.result[0].id).toEqual(expect.any(String));
  });
});

// Create Vote Record
// describe('POST Create Vote Records', ()=> {
//   test('should create vote records and return 200', async()=> {
//     // actual
//     const recordData = {
//       envoy_id: envoy.id.toString(),
//       member_id: member!.id.toString(),
//       state: parseInt(generateRandomNumber(0, 3))
//     }

//     const response = await request
//     .post(`/api/records`)
//     .send(recordData)

//     expect(response.statusCode).toBe(200)
//     expect(response.body.success).toBe(true)
//     expect(response.body.message).toEqual('Vote created successfully')
//     expect(response.body.result.envoy_id).toEqual(expect.any(String))
//     expect(response.body.result.member_id).toEqual(expect.any(String))
//     expect(response.body.result.state).toEqual(expect.any(Number))
//     expect(response.body.result.id).toEqual(expect.any(String))
    
    
//   })
//   test('should create store cache in Redis', async()=> {
//     const result = await getCache(`candidateRecord:${envoy.candidate_id}`)
//     expect(result).toHaveProperty('totalVote')
//     expect(result).toHaveProperty('totalNotVote')
//     expect(result).toHaveProperty('totalSecret')
//     expect(result).toHaveProperty('totalOther')
//   })

//   })