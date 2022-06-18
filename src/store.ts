import { writable, Writable } from "svelte/store";

export const currentList:Writable<CurrentListObject> = writable({});
export const lastLocalModification: Writable<string> = writable();
export const connectionError: Writable<boolean> = writable(false);
// syncError occures when the remoteDB is not reachable
export const syncError: Writable<boolean> = writable(false);
