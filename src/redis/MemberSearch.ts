import log from "../utils/logger/index";
import client from "./index";
import { IMemberSearch } from "../service/types";

export async function setCacheHashMember(
  key: string,
  value: IMemberSearch[],
  ttl?: number
) {
  try {
    // List of required keys for validation

    for (let i = 0; i < value.length; i++) {
      const member: IMemberSearch = value[i];
      if (hasRequiredKeys(member)) {
        const keyName = key + member.identity;
        await client.hSet(keyName, member);

        if (ttl !== undefined) {
          await client.expire(keyName, ttl); // data expire after 1 day
        }
      } else {
        log.error(`invaild member ${i} data`);
      }
    }
  } catch (error: any) {
    log.error("Error in store data redis/MemberSearch => memberRedis");
  }
}

export async function checkExistCacheMember(box_id: string): Promise<boolean> {
  try {
    const pattren = `boxMembers:${box_id}:member:*`
    const result = await client.KEYS(pattren)

    return result.length > 0
  } catch (error) {
    log.error("Error in store data redis/MemberSearch => checkExistCacheMember")
    return false;
  }
}

export async function searchHashMember(
  box_id: string,
  query: string,
  limit = 10,
  offset = 0
) {
  try {
    let searchQuery: string;
    // Remove white space
    query = query.trim();

    if (checkQueryType(query) === "number") {
      searchQuery = `@identity:[${query} ${query}]`;
    } else {
      searchQuery = `@firstName:${query}*`;
    }

    const searchResult = await client.sendCommand([
      "FT.SEARCH",
      `boxMembers:${box_id}`,
      `${searchQuery}`,
      `LIMIT`,
      `${offset}`,
      `${limit}`,
      "SORTBY",
      "identity",
      "ASC",
    ]);

    const jsonResults = convertSearchResultsToJSON(searchResult);

    return jsonResults;
  } catch (error) {
    log.error("Error in store data redis/MemberSearch => searchHashMember");
  }
}

export async function createIndexMember(box_id: string) {
  try {
    await client.sendCommand([
      "FT.CREATE",
      `boxMembers:${box_id}`,
      "ON",
      "HASH",
      "PREFIX",
      "1",
      `boxMembers:${box_id}`,
      "SCHEMA",
      "identity",
      "NUMERIC",
      "SORTABLE",
    ]);
    log.info(`Create index for box_id:${box_id} successfully`);
  } catch (error: any) {
    log.error("Error in redis/MemberSearch => createIndexMember");
  }
}

function convertSearchResultsToJSON(results: any) {
  const [totalResults, ...entries] = results;

  const jsonResults: { [key: string]: any }[] = [];

  for (let i = 0; i < entries.length; i += 2) {
    const key = entries[i];
    const values = entries[i + 1];

    const item: { [key: string]: any } = {};
    const nameFields = ["firstName", "secondName", "thirdName", "lastName"];
    const nameParts: string[] = [];

    for (let j = 0; j < values.length; j += 2) {
      const field = values[j];
      const value = values[j + 1];

      if (field === "state" || field === "identity") {
        item[field] = Number(value);
      } else if (nameFields.includes(field)) {
        nameParts.push(value || ""); // Use empty string if value is null or undefined
      } else {
        item[field] = value;
      }
    }

    // Combine name parts into fullName
    if (nameParts.length > 0) {
      item.fullName = nameParts.join(" ").trim(); // Trim to remove extra spaces
    }

    jsonResults.push(item);
  }

  return jsonResults;
}

function checkQueryType(query: string | number) {
  if (Number.isFinite(Number(query))) return "number";
  else return "string";
}

function hasRequiredKeys(member: IMemberSearch): boolean {
  const requiredKeys: (keyof IMemberSearch)[] = [
    "id",
    "state",
    "firstName",
    "lastName",
    "identity",
  ];
  return requiredKeys.every((key) => member.hasOwnProperty(key));
}
