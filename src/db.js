import { get } from "svelte/store";
import { currentList, lastLocalModification, syncError } from "./store.js";
import { is_empty } from "svelte/internal";

// https://stackoverflow.com/questions/26892438/how-to-know-when-weve-lost-sync-with-a-remote-couchdb
let pouchDbSyncActiveEvent = false;
let pouchDbSyncChangeEvent = false;
//let syncError;
//let sync;
export default class Db {
  // #localDb;
  settings = {};
  constructor(localDbName) {
    console.log("db constructor called");

    this.localDbName = localDbName;
    this.localDb = new PouchDB(this.localDbName);
    this.sync;
    this.getSetttings();
    /*
    setTimeout(() => {
      console.log("settings after timeout", this.settings);
    }, 1000);
    console.log(this);
    */
  }

  /**
   * get settings from pouchdb _local/user
   */
  async getSetttings() {
    try {
      this.settings = await this.localDb.get("_local/user");
    } catch (error) {
      console.log("can't get settings", error);
    }
  }

  cancelSync() {
    this.sync.cancel();
  }

  async startSync() {
    /*
    var stackTrace = new Error().stack;
    const trc = stackTrace.split("at ");
    console.log("caller: ", trc[2]);
    */

    // check if online
    if (!navigator.onLine) return;

    this.localDb.removeAllListeners();
    await this.getSetttings();
    if (is_empty(this.settings)) {
      console.log("no settings found");
      return;
    }

    console.log("starting sync with ", this.settings.remoteDB);
    // in order for the on error event to fire, retry needs to be false
    // but true will work as well

    this.sync = this.localDb
      .sync(this.settings.remoteDB, { live: true, retry: false })
      .on("change", (info) => {
        console.log("change");
        pouchDbSyncChangeEvent = true;
        if (info.direction === "pull") {
          lastLocalModification.set(new Date().toString());

          // update $currentList (with setter) if upstream has changed
          if (!is_empty(get(currentList))) {
            const found = info.change.docs.find((doc) => {
              if (doc._id === get(currentList)._id) {
                currentList.set(doc);
                return true;
              }
            });

            // if currentList item has been deleted, unset $currentList (with setter)
            if (found && found._deleted) {
              currentList.set({});
            }
          }
        }
      })
      // complete (info) - This event fires when replication is completed or cancelled.
      // In a live replication, only cancelling the replication should trigger this event.
      /*.on("complete", (info) => {
        console.log("complete", info);
      })*/
      .on("active", (info) => {
        console.log("active");
        pouchDbSyncActiveEvent = true;
        console.log("replication resumed.", info);
      })
      // paused (err) - This event fires when the replication is paused,
      // either because a live replication is waiting for changes, or
      // replication has temporarily failed, with err, and is attempting to resume.
      .on("paused", (error) => {
        console.log("paused");
        if (error) {
          console.log("replication paused with error.", error);
          syncError.set(true);
        }

        if (pouchDbSyncActiveEvent == true && pouchDbSyncChangeEvent == false) {
          // Gotcha! Syncing with remote DB not happening!
          console.error("stopped syncing", error);
        } else {
          pouchDbSyncActiveEvent = false;
          pouchDbSyncChangeEvent = false;
          syncError.set(false);
          // Everything's ok. Syncing with remote DB happening normally.
        }
      })
      .on("denied", (error, result) => {
        console.log("denied", error, result);
      })
      // on error fires only if retry is set to false
      // ontherwise pouchdb will simply retry
      .on("error", function (error) {
        syncError.set(true);
        console.error("error, not syncing", error);
      });
  }

  /**
   * if online resume syncing
   * @param online boolean
   */
  resumeSync(online) {
    if (!online) return;
    if (is_empty(this.settings)) return;
    this.cancelSync();
    this.localDb.removeAllListeners();
    this.startSync();
    console.log("restarting sync after event");
  }

  //async refreshData() {}

  /**
   * getLists
   * @returns array
   */
  async getLists() {
    try {
      const result = await this.localDb.find({
        selector: {
          type: "list",
        },
      });
      return result && result.docs ? result.docs : [];
    } catch (error) {
      console.log("can't get lists", error);
    }
  }

  /**
   * get items based on $currenList._id
   * @returns array docs (items)
   */
  async getItems() {
    const selector = {
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
  async getItem(id) {
    try {
      return await this.localDb.get(id);
    } catch (error) {
      console.log("can't get this item", error);
    }
  }

  async countItems(id) {
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
          (carry, obj) => (obj.checked ? carry + 1 : carry),
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
  async addListOrItem(doc) {
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
  async updateListOrItem(doc) {
    console.log("doc", doc);
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
  async removeListOrItem(doc) {
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
          itemsResult.docs.forEach((doc) => {
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
   * receiveing a dispached message from ModalSettings
   */
  async handleNewSettings() {
    if (sync) sync.cancel();
    this.startSync();
  }
}
