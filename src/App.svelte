<script>
  import { currentList, lastLocalModification } from "./store.js";
  import { emptyObj } from "./helper";
  import ModalAbout from "./components/ModalAbout.svelte";
  import ModalSettings from "./components/ModalSettings.svelte";
  import ModalAdd from "./components/ModalAdd.svelte";
  import List from "./components/List.svelte";
  import Item from "./components/Item.svelte";
  import { onMount } from "svelte";

  const localDbName = "shopping2";
  const localDb = new PouchDB(localDbName);

  // todo:
  // let enableFoo
  // <p class:foo="{enableFoo}">foo</p>

  // pouchdb debugging
  // PouchDB.debug.enable("*");
  // PouchDB.debug.disable();
  // localDb.on("error", function (err) {debugger;});

  // https://stackoverflow.com/questions/26892438/how-to-know-when-weve-lost-sync-with-a-remote-couchdb

  let online; // listen to online / offline event on window
  let lists = [];
  let items = [];
  let settings;
  let syncing = true;
  let sync;
  let syncError = false;

  let pouchDbSyncActiveEvent = false;
  let pouchDbSyncChangeEvent = false;

  /*
  $: syncError, handleSyncError();
  
  function handleSyncError() {
    console.log("syncError is", syncError);
  }
  */

  // listeners
  $: $lastLocalModification, getLists(), getItems();
  $: $currentList, listChange();
  $: online, resumeSync();

  /**
   * resume syncing after online changed from false to true;
   */
  function resumeSync() {
    if (online && sync && sync.canceled) {
      syncError = true;
    }
    if (online && sync && sync.canceled) {
      console.log("resuming syncinf after offline event");
      startSync();
    }
    console.log("online change", online, syncing, sync);
  }

  onMount(async () => {
    await getSetttings();
    startSync();
  });

  async function getSetttings() {
    try {
      settings = await localDb.get("_local/user");
      if (settings.remoteDB) {
        syncing = true;
        startSync();
      }
    } catch (error) {
      console.log("can't get settings", error);
    }
  }

  function startSync() {
    if (settings.remoteDB) return;

    // in order for the on error event to fire, retry needs to be false
    sync = localDb
      .sync(settings.remoteDB, { live: true, retry: false })
      .on("change", (change) => {
        pouchDbSyncChangeEvent = true;
        if (change.direction === "pull") {
          getLists();
          getItems();
        }
        // console.log("something changed!", change);
      })
      // complete (info) - This event fires when replication is completed or cancelled.
      // In a live replication, only cancelling the replication should trigger this event.
      /*
      .on("complete", (info) => {
        console.log("complete", info);
      })
      */
      .on("active", (info) => {
        //pouchDbSyncActiveEvent = true;
        console.log("replication resumed.", info);
      })
      // paused (err) - This event fires when the replication is paused,
      // either because a live replication is waiting for changes, or
      // replication has temporarily failed, with err, and is attempting to resume.
      .on("paused", (error) => {
        // console.log("replication paused.", error);
        if (pouchDbSyncActiveEvent == true && pouchDbSyncChangeEvent == false) {
          // Gotcha! Syncing with remote DB not happening!
          console.error("stoped syncing");
        } else {
          pouchDbSyncActiveEvent = false;
          pouchDbSyncChangeEvent = false;
          console.log("sync ok");
          syncError = false;
          // Everything's ok. Syncing with remote DB happening normally.
        }
      })
      .on("denied", (error, result) => {
        console.log(error, result);
      })
      // on error fires only if retry is set to false
      // ontherwise pouchdb will simply retry
      .on("error", function (error) {
        syncError = true;
        console.log("not syncing", error);
      });
  }

  function listChange() {
    if (!emptyObj($currentList)) {
      getItems();
    }
  }

  /**
   * Get all lists
   */
  function getLists() {
    localDb.find(
      {
        selector: {
          type: "list",
        },
      },
      function (error, response) {
        lists = response ? response.docs || response : response;
      }
    );
  }

  /**
   * get items based on $currenList._id
   */
  function getItems() {
    localDb.find(
      {
        selector: {
          list: $currentList._id,
        },
      },
      function (error, response) {
        items = response ? response.docs || response : response;
      }
    );
  }

  getLists();
</script>

<svelte:window bind:online />
<!-- 
  /**
  * There is no elegent way to target body class online / offline. 
  * But we can use the section tag instead of the body tag to wrap the app
  */
-->
<section class={online ? "" : "offline"}>
  <!-- banner -->
  <header class="navbar-fixed">
    <nav id="nav" class="primary-color">
      <div class="nav-wrapper">
        <span
          class="brand-logo left {emptyObj($currentList) ? 'master-view' : ''}"
        >
          {#if !emptyObj($currentList)}
            <a href="#!" on:click|preventDefault={() => ($currentList = {})}
              ><i class="material-icons">arrow_back</i></a
            >
          {/if}

          <span id="header-title">
            {#if !emptyObj($currentList)}
              {$currentList.title}
            {:else}
              Shopping Lists
            {/if}
          </span>
        </span>
        <!-- settings button -->
        <a
          href="#modal-about"
          class="waves-effect waves-light modal-trigger right settings"
          ><i class="material-icons">info_outline</i></a
        >
        <a
          href="#modal-settings"
          class="waves-effect waves-light modal-trigger right settings"
        >
          {#if syncError === true}
            <i class="material-icons secondary-text lighter">error</i>
          {:else}
            <i class="material-icons">settings</i>
          {/if}
        </a>
      </div>
    </nav>
  </header>
  <!-- content area -->
  <main class={emptyObj($currentList) ? "" : "detail-view"}>
    <!-- shopping lists get inserted here -->
    <div id="shopping-lists">
      {#await lists}
        ... loading
      {:then lists}
        {#each lists as list}
          <List {list} {localDb} />
        {/each}
      {/await}
    </div>

    <ul id="shopping-list-items">
      <!-- shopping list items get inserted here -->
      {#each items as item}
        <Item {localDb} {item} />
      {/each}
    </ul>
  </main>
  <!-- add more stuff button -->
  <button
    class="fixed-action-btn btn-floating btn-large secondary-color modal-trigger"
    data-target="modal-add"
  >
    <i class="large material-icons">add</i>
  </button>

  <!-- modal: add a shopping list settings form -->
  <ModalSettings {localDb} {settings} {online} />

  <!-- modal: open shopping list about -->
  <ModalAbout />

  <!-- modal: add a shopping list or an item form -->
  <ModalAdd {localDb} />
</section>

<style>
</style>
