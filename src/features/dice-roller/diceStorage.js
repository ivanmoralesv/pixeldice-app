import { createId, readStore, writeStore } from "../../shared/storage/database.js";

const POOLS_KEY = "dice-pools";

export function loadSavedPools() {
  return readStore(POOLS_KEY, []);
}

export function savePoolList(pools) {
  return writeStore(POOLS_KEY, pools);
}

export function createSavedPool(name, dice) {
  return {
    id: createId("pool"),
    name,
    dice,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
