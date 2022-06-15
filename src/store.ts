import { writable, Writable } from "svelte/store";

interface CurrentListObject {
    _id?: string,
    title?: string
}

export const currentList:Writable<CurrentListObject> = writable({});
export const lastLocalModification: Writable<string> = writable();

// syncError occures when the remoteDB is not reachable
export const syncError: Writable<boolean> = writable(false);
