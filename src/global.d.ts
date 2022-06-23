/// <reference types="svelte" />

export {};
declare global {
  /**
   * HTMLTextAreaElement.createTextRange function is microsoft specific 
   */
  interface Element {
    createTextRange: any;
  }

  interface CurrentListObject {
    _id?: string,
    title?: string
  }

  type DbConnection = {'remote': boolean, 'reachable': boolean, 'syncing': false};

  interface DbInfo extends PouchDB.Core.DatabaseInfo {
    error?: any
  }
  interface Doc extends PouchDB.Core.ExistingDocument {
    _id: string,
    type: "list" | "item",
    list?: string,
    title: string,
    checked: boolean,
    createdAt: string,
    updatedAt?: string,
    version?: string | number,
    place?: any,
    _deleted?: boolean,
    _rev: string,
  }
}