import { get } from "svelte/store";
import {
  currentList,
  lastLocalModification,
  errorSyncStatus,
  errorRemoteDbSettings,
  // errorRemoteReachable,
} from "./store.js";
import { is_empty } from "svelte/internal";
import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";
PouchDB.plugin(PouchDBFind);

interface Settings {
  _id?: string,
  remoteDB?: string,
  rev?: string
}

type Selector = {type: 'item' | 'item', list?: any}

export default class Db {
  settings: Settings = {};
  localDbName: string;
  localDb: PouchDB.Database;
  sync: PouchDB.Replication.Sync<{}>;
  
  // https://stackoverflow.com/questions/26892438/how-to-know-when-weve-lost-sync-with-a-remote-couchdb
  pouchDbSyncActiveEvent: boolean = false;
  pouchDbSyncChangeEvent: boolean = false;

  constructor(localDbName: string) {
    this.localDbName = localDbName;
    this.localDb = new PouchDB(this.localDbName);
    this.getSettings();
  }

  /**
   * get settings from pouchdb _local/user
   */
  async getSettings() {
    try {
      this.settings = await this.localDb.get("_local/user");
      errorRemoteDbSettings.set(false);
    } catch (error) {
      errorRemoteDbSettings.set(true);
      console.log("can't get settings", error);
    }
  }

  cancelSync(): void {
    if(this.sync) {
      this.sync.cancel();
    }
  }

  async startSync(): Promise<void> {
    /*
    var stackTrace = new Error().stack;
    const trc = stackTrace.split("at ");
    console.log("caller: ", trc[2]);
    */

    // check if online
    if (!navigator.onLine) return;
    this.localDb.removeAllListeners();
    await this.getSettings();
    if (is_empty(this.settings)) {
      console.log("no settings found");
      errorRemoteDbSettings.set(true);
      return;
    }
    errorRemoteDbSettings.set(false);

    // in order for the on error event to fire, retry needs to be false
    // but true will work as well
    this.sync = this.localDb
      .sync(this.settings.remoteDB, { live: true, retry: true })
      .on("change", (info) => {
        this.pouchDbSyncChangeEvent = true;
        if (info.direction === "pull") {
          lastLocalModification.set(new Date().toString());

          // update $currentList (with setter) if upstream has changed
          if (!is_empty(get(currentList))) {
            // assert found as any
            const found = info.change.docs.find((doc: Doc) => {
              if (doc._id === get(currentList)._id) {
                currentList.set(doc);
                return true;
              }
            }) as Doc;

            // if currentList item has been deleted, unset $currentList (with setter)
            if (found && found._deleted) {
              currentList.set({});
            }
          } 
        }
      })
      // complete (info) - This event fires when replication is completed or cancelled.
      // In a live replication, only cancelling the replication should trigger this event.
      .on("complete", (info: PouchDB.Replication.SyncResultComplete<{}>) => {
        //console.log("complete", info);
      })
      .on("active", () => {
        this.pouchDbSyncActiveEvent = true;
        console.log("replication resumed.");
      })
      // paused (err) - This event fires when the replication is paused,
      // either because a live replication is waiting for changes, or
      // replication has temporarily failed, with err, and is attempting to resume.
      .on("paused", (error) => {
        if (error) {
          console.log("replication paused with error.", error);
          errorSyncStatus.set(true);
        }

        if (this.pouchDbSyncActiveEvent == true && this.pouchDbSyncChangeEvent == false) {
          // Gotcha! Syncing with remote DB not happening!
          console.error("stopped syncing", error);
          errorSyncStatus.set(true);
        } else {
          this.pouchDbSyncActiveEvent = false;
          this.pouchDbSyncChangeEvent = false;
          errorSyncStatus.set(false);
          // Everything's ok. Syncing with remote DB happening normally.
        }
      })
      .on("denied", (error) => {
        console.log("denied", error);
      })
      // on error fires only if retry is set to false
      // ontherwise pouchdb will simply retry
      .on("error", function (error) {
        errorSyncStatus.set(true);
        console.error("error, not syncing", error);
      });
  }

  /**
   * if online resume syncing
   * @param online boolean
   */
  resumeSync(online: boolean | undefined): void {
    if (!online) return;
    if (is_empty(this.settings)) return;
    this.cancelSync();
    this.localDb.removeAllListeners();
    this.startSync();
    console.log("restarting sync after event");
  }

  /**
   * getLists
   * @returns array
   */
  async getLists(): Promise<PouchDB.Core.ExistingDocument<{}>[]> {
    try {
      const selector: Selector = {
        type: "item", 
      };
      const result = await this.localDb.find({selector});
      return result && result.docs ? result.docs : [];
    } catch (error) {
      console.log("can't get lists", error);
    }
  }

  /**
   * get items based on $currenList._id
   * @returns array docs (items)
   */
  async getItems(): Promise<PouchDB.Core.ExistingDocument<{}>[]> {

    const selector: Selector = {
      type: "item", 
    };

    if (!is_empty(get(currentList))) {
      selector.list = get(currentList)._id;
    }

    try {
      const result = await this.localDb.find({ selector });
      return result && result.docs ? result.docs : [];
    } catch (error) {
      console.log("can't get items", error);
    }
  }

  /**
   *
   * @param {*} id item._id
   * @returns obj item
   */
  async getItem(id: string): Promise<Doc> {
    try {
      return await this.localDb.get(id);
    } catch (error) {
      console.log("can't get this item", error);
    }
  }

  async countItems(id: string): Promise<{ totalItems: number, checkedItems: number }> {
    const response = { totalItems: 0, checkedItems: 0 };
    try {
      const result = await this.localDb.find({
        selector: {
          type: "item",
          list: id,
        },
      });
      if (result && result.docs) {
        response.totalItems = result.docs.length;
        response.checkedItems = result.docs.reduce(
          (carry, doc: Doc) => (doc.checked ? carry + 1 : carry),
          0
        );
      }
      return response;
    } catch (error) {
      console.log("can't count items", error);
    }
  }

  /**
   *
   * @param {*} doc list or item doc
   */
  async addListOrItem(doc: Doc): Promise<void> {
    try {
      await this.localDb.put(doc);
      lastLocalModification.set(new Date().toString());
    } catch (error) {
      console.error("could not save list or item", error, doc);
    }
  }

  /**
   *
   * @param {*} doc list or item doc
   */
  async updateListOrItem(doc: Doc): Promise<void> {
    try {
      await this.localDb.put(doc);
      lastLocalModification.set(new Date().toString());
    } catch (error) {
      console.error(error);
    }
  }
  /**
   *
   * @param {*} doc list or item doc
   */
  async removeListOrItem(doc: Doc): Promise<void> {
    try {
      // if doc type is list, remove first items that are children of list
      if (doc.type === "list") {
        // create index to speed up itemsResult selector
        const index = await this.localDb.createIndex({
          index: { fields: ["list"] },
        });

        const itemsResult = await this.localDb.find({
          selector: {
            type: "item",
            list: doc._id,
          },
        });

        // mark docs for deletion
        if (itemsResult.docs.length) {
          itemsResult.docs.forEach((doc: Doc) => {
            doc._deleted = true;
          });
          // bulk remove docs
          await this.localDb.bulkDocs(itemsResult.docs);
        }
      }

      // remove list or item
      await this.localDb.remove(doc._id, doc._rev);
      lastLocalModification.set(new Date().toString());
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * check id a remote database exists
   * @param {*} remoteUrl string
   * @returns boolean
   */
  async checkNewSettings(remoteUrl: string): Promise<boolean> {
    try {
      const db: PouchDB.Database = await new PouchDB(remoteUrl, {
        skip_setup: true, // do not create a db, just check if exists
      });
      const info: DbInfo = await db.info();
      if (info.error) {
        errorRemoteDbSettings.set(true);
        return false;
      }
      // connection succeded, but database not created (see skip_setup)
      errorRemoteDbSettings.set(false);
      return true;
    } catch (error) {
      console.log("error checking settings", error);
      return false;
    }
  }
}
