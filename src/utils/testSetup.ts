import { faker } from "@faker-js/faker"
import { createCandidate } from "../service/auth.service"
import { deleteCandidateById, deleteEnvoyById, findEnvoyById } from "../service/user.service"
import { generateRandomNumber } from "./helper"
import log from "./logger"
import { createBox, Ibox } from "../service/box.service"
import { CandidateModel, EnvoyModel, UsersModel } from "../model/users.model"
import { BoxesModel } from "../model/box.model"

export async function createBoxForTest(){
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

export async function createCandidateForTest(){
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

export async function clearupTestData() {
  await EnvoyModel.deleteMany({})
  await CandidateModel.deleteMany({})
  await UsersModel.deleteMany({})
}

export async function clearupTestBox(){
  await BoxesModel.deleteMany({})
}