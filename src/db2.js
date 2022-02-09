import { get } from "svelte/store";
import { currentList, lastLocalModification } from "./store.js";
import { is_empty } from "svelte/internal";

export default class Db {
  #localDb;
  constructor(localDbName) {
    this.localDbName = localDbName;
    this.localDb = new PouchDB(this.localDbName);
    this.methods;
  }

  async getSetttings() {
    try {
      this.settings = await this.localDb.get("_local/user");
      return this;
    } catch (error) {
      console.log("can't get settings", error);
    }
  }

  startSync() {
    // check settings
    if (!this.settings) return;
    // check if online
    //if (!online) return;
    console.log("starting sync");
    // in order for the on error event to fire, retry needs to be false
    // but true will work as well
    sync = this.localDb
      .sync(settings.remoteDB, { live: true, retry: true })
      .on("change", (info) => {
        //console.log("something changed!");
        //pouchDbSyncChangeEvent = true;

        if (info.direction === "pull") {
          // update $currentList if upstream has changed
          if (!is_empty(get(currentList))) {
            const found = info.change.docs.find((doc) => {
              if (doc._id === get(currentList)._id) {
                alert(1);
                currentList.set(doc);
                return true;
              }
            });

            // if currentList item has been deleted, unset currentList
            if (found && found._deleted) {
              currentList.set({});
            }
          }

          // update lists and items
          //this.getLists();
          //this.getItems();
        }
      })
      // complete (info) - This event fires when replication is completed or cancelled.
      // In a live replication, only cancelling the replication should trigger this event.
      /*.on("complete", (info) => {
        console.log("complete", info);
      })*/
      .on("active", (info) => {
        pouchDbSyncActiveEvent = true;
        console.log("replication resumed.", info);
      })
      // paused (err) - This event fires when the replication is paused,
      // either because a live replication is waiting for changes, or
      // replication has temporarily failed, with err, and is attempting to resume.
      .on("paused", (error) => {
        // console.log("replication paused.", error);
        if (pouchDbSyncActiveEvent == true && pouchDbSyncChangeEvent == false) {
          // Gotcha! Syncing with remote DB not happening!
          console.error("stoped syncing", error);
        } else {
          pouchDbSyncActiveEvent = false;
          pouchDbSyncChangeEvent = false;
          syncError = false;
          // Everything's ok. Syncing with remote DB happening normally.
        }
      })
      .on("denied", (error, result) => {
        console.log("denied", error, result);
      })
      // on error fires only if retry is set to false
      // ontherwise pouchdb will simply retry
      .on("error", function (error) {
        syncError = true;
        console.error("error, not syncing", error);
      });
  }

  resumeSync() {
    //if (online && sync && this.sync.canceled) {
    //  sync.cancel();
    this.localDb.removeAllListeners();
    this.startSync();
    console.log("restarting sync after offline event");
    //} else {
    //console.log("still syncing");
    //}
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
      console.log(get(currentList).title);
    }

    try {
      const result = await this.localDb.find({ selector });
      console.log(
        "getItems result",
        result,
        "currentList",
        get(currentList),
        "sel",
        selector,
        "res",
        result.docs
      );
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
    await getSetttings();
    startSync();
  }
}
