import { writable, Writable } from "svelte/store";

export const currentList:Writable<CurrentListObject> = writable({});
export const lastLocalModification: Writable<string> = writable();

// errorSyncStatus occures when the remoteDB is not reachable
export const errorSyncStatus: Writable<boolean> = writable(true);
// no remote db url provided or not database testing returns error
export const errorRemoteDbSettings: Writable<boolean> = writable(true);
// dead remote Dadtabase
export const errorRemoteReachable: Writable<boolean> = writable(true);