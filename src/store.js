import { writable } from "svelte/store";
export const currentList = writable({});
export const lastLocalModification = writable(0);
//export const settings = writable({});

// syncError is when the remoteDB is not reachable
// export const syncError = writable(0);
// export const settings = writable(0);
