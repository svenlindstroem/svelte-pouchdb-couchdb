import { writable } from "svelte/store";
export const currentList = writable({});
export const lastLocalModification = writable(0);
