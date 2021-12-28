<script>
  import { currentList, lastLocalModification } from "./store.js";
  import { emptyObj } from "./helper";
  import ModalAbout from "./components/ModalAbout.svelte";
  import ModalSettings from "./components/ModalSettings.svelte";
  import ModalAdd from "./components/ModalAdd.svelte";
  import List from "./components/List.svelte";
  import Item from "./components/Item.svelte";
  import { onMount } from "svelte";

  const localDbName = "shopping-test";
  const localDb = new PouchDB(localDbName);

  // pouchdb debugging
  // PouchDB.debug.enable("*");
  // PouchDB.debug.disable();
  // localDb.on("error", function (err) {debugger;});

  let w;
  let online; // listen to online / offline event through svelte:window
  let lists = []; // lists array
  let items = []; // items array
  let settings; // settings obj
  let sync; // sync obj
  let syncError = false;

  // https://stackoverflow.com/questions/26892438/how-to-know-when-weve-lost-sync-with-a-remote-couchdb
  let pouchDbSyncActiveEvent = false;
  let pouchDbSyncChangeEvent = false;

  // listeners
  $: $lastLocalModification, getLists(), getItems();
  $: online, resumeSync();

  // currentList is either the active (current) list object or an empty object
  $: $currentList && !emptyObj($currentList) && getItems();

  /**
   * resume syncing after online changed from false to true;
   */
  function resumeSync() {
    if (online && sync && sync.canceled) {
      sync.cancel();
      localDb.removeAllListeners();
      startSync();
      console.log("restarting sync after offline event");
    } else {
      console.log("still syncing");
    }
  }

  onMount(async () => {
    await getSetttings();
    startSync();
  });

  async function getSetttings() {
    try {
      settings = await localDb.get("_local/user");
    } catch (error) {
      console.log("can't get settings", error);
    }
  }

  function startSync() {
    // check settings
    if (!settings) return;
    // check if online
    if (!online) return;
    console.log("starting sync");
    // in order for the on error event to fire, retry needs to be false
    sync = localDb
      .sync(settings.remoteDB, { live: true, retry: false })
      .on("change", (change) => {
        console.log("something changed!", change);
        pouchDbSyncChangeEvent = true;
        if (change.direction === "pull") {
          getLists();
          getItems();
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

  /**
   * receiveing a dispached message from ModalSettings
   */

  async function handleNewSettings() {
    console.log("ne settings");
    if (sync) sync.cancel();
    await getSetttings();
    startSync();
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
<section class:offline={!online} bind:clientWidth={w}>
  <div>{w}</div>
  <!-- banner -->
  <header class="navbar-fixed">
    <nav id="nav" class="primary-color">
      <div class="nav-wrapper">
        <span
          class:master-view={emptyObj($currentList)}
          class="brand-logo left"
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
          <i class="material-icons {syncError ? 'secondary-text lighter' : ''}"
            >{syncError ? "error" : "settings"}</i
          >
        </a>
      </div>
    </nav>
  </header>
  <!-- content area -->
  <main class:detail-view={!emptyObj($currentList)}>
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

  <ModalSettings
    on:newSettings={handleNewSettings}
    {localDb}
    {settings}
    {online}
  />

  <!-- modal: open shopping list about -->
  <ModalAbout />

  <!-- modal: add a shopping list or an item form -->
  <ModalAdd {localDb} />
</section>

<style>
</style>
