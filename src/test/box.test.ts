import mongoose from "mongoose";
import connect from "../utils/connect";
import supertest from "supertest";
import createServer from "../utils/serverTest";
import { faker } from "@faker-js/faker";
import { clearupTestBox, createEnvoyTest } from "../utils/testSetup";
import { generateRandomNumber } from "../utils/helper";

const request = supertest(createServer());

let box;
let member: any;
let envoy: any;

beforeAll(async () => {
  // connect to database
  await connect();
  envoy = await createEnvoyTest();
});

afterAll(async () => {
  // cleanup test
  await clearupTestBox()
  await mongoose.disconnect();
});

// Register Box
describe("POST Register Box", () => {
  test("should register box and return 201", async () => {
    const boxData = {
      log: 32847238,
      lat: 238947324,
      city_id: 1,
      boxName: "box" + faker.number.int(1000),
    };

    const response = await request
      .post("/api/developer/registerBox")
      .send(boxData);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toEqual("Box created successfully");
    expect(response.body.result.log).toEqual(expect.any(Number));
    expect(response.body.result.lat).toEqual(expect.any(Number));
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
      lastName: faker.internet.userName(),
      ssn: generateRandomNumber(),
      city_id: 1,
      boxName: envoy.boxName,
    };

    const response = await request
    .post("/api/developer/createBoxMember")
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

    const response = await request.get(`/api/getAllBoxesInCity/${city_id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toEqual("All Boxes");
    expect(response.body.result[0].city_id).toEqual(expect.any(Number));
    expect(response.body.result[0].log).toEqual(expect.any(Number));
    expect(response.body.result[0].lat).toEqual(expect.any(Number));
    expect(response.body.result[0].boxName).toEqual(expect.any(String));
    expect(response.body.result[0].city).toEqual(expect.any(String));
    expect(response.body.result[0].id).toEqual(expect.any(String));
  });
});

// Get Box By BoxName & City_id
describe("GET Box and List Members", () => {
  test("should box details and list member with 200", async () => {
    const response = await request.get(
      `/api/getBox?boxName=${box!.boxName}&city_id=${box!.city_id}`
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
    expect(response.body.result.boxInfo.log).toEqual(expect.any(Number));
    expect(response.body.result.boxInfo.lat).toEqual(expect.any(Number));
    expect(response.body.result.boxInfo.boxName).toEqual(expect.any(String));
  });
});

// Get All Boxes
describe("GET All Boxes", () => {
  test("should return list of all boxes with 200", async () => {
    let city_id = 1;

    const response = await request.get(`/api/getAllBoxesInCity/${city_id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toEqual("All Boxes");
    expect(response.body.result[0].city_id).toEqual(expect.any(Number));
    expect(response.body.result[0].log).toEqual(expect.any(Number));
    expect(response.body.result[0].lat).toEqual(expect.any(Number));
    expect(response.body.result[0].boxName).toEqual(expect.any(String));
    expect(response.body.result[0].city).toEqual(expect.any(String));
    expect(response.body.result[0].id).toEqual(expect.any(String));
  });
});

// Create Vote Record
describe('POST Create Vote Records', ()=> {
  test('should create vote records and return 200', async()=> {
    // actual
    const recordData = {
      envoy_id: envoy.id.toString(),
      member_id: member!.id.toString(),
      state: true
    }

    const response = await request
    .post(`/api/user/createRecord`)
    .send(recordData)

    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toEqual('Vote created successfully')
    expect(response.body.result.envoy_id).toEqual(expect.any(String))
    expect(response.body.result.member_id).toEqual(expect.any(String))
    expect(response.body.result.state).toEqual(expect.any(Boolean))
    expect(response.body.result.id).toEqual(expect.any(String))
    
  })
  })