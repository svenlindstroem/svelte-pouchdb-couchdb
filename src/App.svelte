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
  let syncError = true;

  let pouchDbSyncActiveEvent = false;
  let pouchDbSyncChangeEvent = false;

  // listeners
  $: $lastLocalModification, getLists(), getItems();
  $: $currentList, listChange();
  $: online, onlineChange();

  function onlineChange() {
    console.log("online change", online, syncing, sync);
    if (!syncing) restartSync();
  }

  function restartSync() {
    sync.on("complete", () => {
      console.log("resume");
      startSync();
      //sync = localDb.sync(settings.remoteDB, { live: true, retry: true });
    });
    //sync.cancel();
  }

  onMount(async () => {
    try {
      settings = await localDb.get("_local/user");
      if (settings.remoteDB) {
        syncing = true;
        startSync();
      }
    } catch (error) {
      console.log(error);
    }
  });

  function startSync() {
    if (!settings.remoteDB) return;
    sync = localDb
      .sync(settings.remoteDB, { live: true, retry: true })
      .on("change", (change) => {
        pouchDbSyncChangeEvent = true;
        if (change.direction === "pull") {
          getLists();
          getItems();
        }
        // console.log("something changed!", change);
      })

      .on("active", (info) => {
        pouchDbSyncActiveEvent = true;
        console.log("replication resumed.", info);
      })
      .on("paused", (info) => {
        console.log("replication paused.");
        if (pouchDbSyncActiveEvent == true && pouchDbSyncChangeEvent == false) {
          // Gotcha! Syncing with remote DB not happening!
          console.error("stoped syncing");
        } else {
          pouchDbSyncActiveEvent = false;
          pouchDbSyncChangeEvent = false;
          console.log("sync ok");
          syncing = true;
          // Everything's ok. Syncing with remote DB happening normally.
        }
      })
      .on("error", (error) => {
        console.error("not syncing", error);
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
          {#if !syncing}
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
  <ModalSettings {localDb} {settings} />

  <!-- modal: open shopping list about -->
  <ModalAbout />

  <!-- modal: add a shopping list or an item form -->
  <ModalAdd {localDb} />
</section>

<style>
</style>
