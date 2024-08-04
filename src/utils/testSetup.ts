import { faker } from "@faker-js/faker";
import { createCandidate, createEnvoy } from "../service/auth.service";
import { generateRandomNumber } from "./helper";
import log from "./logger";
import { createBox, Ibox } from "../service/box.service";
import { CandidateModel, EnvoyModel, UsersModel } from "../model/users.model";
import { BoxesModel, MemberModel, VoteRecordModel } from "../model/box.model";
import { IEnvoyWithBoxName } from "../test/types";

export async function createBoxForTest(): Promise<Ibox> {
  const boxData = {
    log: 238473824,
    lat: 2384723847,
    city_id: 1,
    boxName: "box" + generateRandomNumber(100, 1000000),
  };

  try {
    const box = await createBox(boxData);
    return box as Ibox;
  } catch (error: any) {
    log.error("error in setupTest => createBoxForTest", error.message);
    throw new Error(error);
  }
}

export async function createCandidateForTest() {
  try {
    const candidateData = {
      firstName: "cand",
      lastName: faker.internet.userName(),
      password: "123456",
      ssn: generateRandomNumber(),
      city_id: 1,
      phone: "0773284324",
    };
    const candidate = await createCandidate(candidateData);

    return candidate;
  } catch (error: any) {
    log.error('error in testSetup => createCandidateForTest', error.message);
    throw new Error(error);
  }
}

export async function createEnvoyTest():Promise<IEnvoyWithBoxName> {
  try {
    const candidate = await createCandidateForTest();
    const box = await createBoxForTest();

    const envoyData = {
      firstName: "envoytest",
      lastName: faker.internet.userName(),
      password: "123456",
      ssn: generateRandomNumber(),
      city_id: 1,
      phone: "0773284324",
      candidate_id: candidate!.id.toString(),
      box_id: box.id.toString(),
    };

    const envoy = await createEnvoy(envoyData);

    const envoyRes = { ...envoy, boxName: box.boxName };

    return envoyRes;
  } catch (error: any) {
    log.error(error);
    throw new Error(error);
  }
}

export async function clearupTestData() {
  try {
    await EnvoyModel.deleteMany({});
    await CandidateModel.deleteMany({});
    await UsersModel.deleteMany({});
    await BoxesModel.deleteMany({});
    await MemberModel.deleteMany({});
    await VoteRecordModel.deleteMany({});
  } catch (error: any) {
    log.error(error);
    throw new Error(error);
  }
}

export async function clearupTestBox() {
  await BoxesModel.deleteMany({});
}
