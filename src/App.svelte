<script lang="ts">
  import { onMount, is_empty } from "svelte/internal";
  import Db from "./db.js";
  import {
    currentList,
    lastLocalModification,
    errorSyncStatus,
    //errorRemoteDbSettings,
    //errorRemoteReachable,
  } from "./store.js";
  import ModalAbout from "./components/ModalAbout.svelte";
  import ModalSettings from "./components/ModalSettings.svelte";
  import ModalAdd from "./components/ModalAdd.svelte";
  import List from "./components/List.svelte";
  import Item from "./components/Item.svelte";

  let db = new Db("abc");

  // debug pouchdb with the following commands (uncomment as needed and reload):
  // PouchDB.debug.enable("*");
  // if debug was enabled,and now is commented, we need to call disable once to turn it off
  // PouchDB.debug.disable();
  // PouchDB.debug.enable('pouchdb:find');
  // localDb.on("error", function (err) {debugger;});

  let headerHeight: number; // used in style height: calc(100vh - var(--headerHeigth));
  let online: boolean | undefined; // listen to online / offline event through svelte:window
  let lists = []; // lists array
  let items = []; // items array
  // let sync; // sync obj

  // listeners
  $: $lastLocalModification, refreshData();
  $: online, db.resumeSync(online);

  async function refreshData(): Promise<void> {
    lists = await db.getLists();
    items = await db.getItems();
  }

  // currentList is either the active (current) list object or an empty object
  $: $currentList && !is_empty($currentList) && refreshData();

  onMount(async () => {
    db.startSync();
  });
  /**
   * receiveing a dispached message from ModalSettings
   * when new settings are set
   */
  async function handleNewSettings(): Promise<void> {
    console.log("received new settings");
    db.cancelSync();
    // create a new innstance of db
    db = new Db("abc");
    db.startSync();
  }
</script>

<svelte:window bind:online />
<!-- 
  /**
  * There is no elegent way to target body class online / offline. 
  * But we can use the section tag instead of the body tag to wrap the app
  */
-->
<section class:offline={!online}>
  <!-- banner -->
  <header class="navbar-fixed" bind:clientHeight={headerHeight}>
    <!-- 
    <div>Sync Error: {$errorSyncStatus}</div>
    <div>Db Settings: {$errorRemoteDbSettings}</div>
    <div>Remote Reachable: {$errorRemoteReachable}</div>
    -->
    <nav id="nav" class="primary-color">
      <div class="nav-wrapper">
        <span
          class:master-view={is_empty($currentList)}
          class="brand-logo left"
        >
          {#if !is_empty($currentList)}
            <a href="#!" on:click|preventDefault={() => ($currentList = {})}
              ><i class="material-icons">arrow_back</i></a
            >
          {/if}

          <span id="header-title">
            {#if !is_empty($currentList)}
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
          <i
            class="material-icons spinthis {$errorSyncStatus
              ? 'secondary-text lighter'
              : ''}">{$errorSyncStatus ? "error" : "settings"}</i
          >
        </a>
      </div>
    </nav>
  </header>
  <!-- content area -->
  <div class="main" style="--headerHeigth: {headerHeight}px">
    <div class:master-out={!is_empty($currentList)} class="master inner">
      <!-- lists view -->
      <div id="shopping-lists">
        {#await lists}
          ... loading
        {:then lists}
          {#each lists as list}
            <List {list} {db} />
          {/each}
        {/await}
      </div>
    </div>
    <!-- items view -->
    <div class:detail-in={!is_empty($currentList)} class="detail inner">
      <ul id="shopping-list-items">
        <!-- shopping list items get inserted here -->
        {#each items as item}
          <Item {db} {item} />
        {/each}
      </ul>
    </div>
  </div>

  <!-- add more stuff button -->
  <button
    class="fixed-action-btn btn-floating btn-large secondary-color modal-trigger"
    data-target="modal-add"
  >
    <i class="large material-icons">add</i>
  </button>

  <!-- modal: add a shopping list settings form -->

  <ModalSettings on:newSettings={handleNewSettings} {db} {online} />

  <!-- modal: open shopping list about -->
  <ModalAbout />

  <!-- modal: add a shopping list or an item -->
  <ModalAdd {db} />
</section>

<style>
  nav .brand-logo {
    font-size: 2.1rem;
  }
  /* keep shopping list title in place in master view */
  .brand-logo.master-view {
    left: 3.28rem !important;
    white-space: nowrap;
  }

  .settings {
    margin-right: 25px;
  }
  #shopping-lists,
  #shopping-list-items {
    margin: 0;
    padding: 0;
    width: 100vw;
    min-height: calc(100vh - var(--headerHeigth));
  }
  #shopping-list-items {
    background-color: #ffffff;
    border: 0 none;
  }
  .main {
    position: relative;
    width: 100vw;
    height: calc(100vh - var(--headerHeigth));
    margin-bottom: 0px;
    overflow-x: hidden;
  }
  .inner {
    width: 100vw;
    height: 100%;
  }
  .master {
    position: absolute;
    left: 0px;
    transition: left 0.5s linear;
  }

  .detail {
    position: absolute;
    left: calc(100vw + 30px);
    color: white;
    transition: left 0.5s linear;
  }

  /* fly in and out */
  .master-out {
    left: -100vw;
  }
  .detail-in {
    left: 0px;
  }

  section.offline .primary-color,
  section.offline .secondary-color {
    background-color: #273a4e !important;
  }

  section.offline .primary-color *,
  section.offline .secondary-color * {
    color: #e1e2e1 !important;
  }

  .spinthis {
    display: inline-block;
    animation-name: spinanimation;
    animation-duration: 0.5s;
    animation-timing-function: linear;
  }
  @-webkit-keyframes spinanimation {
    from {
      -webkit-transform: rotate(0deg);
    }
    to {
      -webkit-transform: rotate(360deg);
    }
  }
  @-moz-keyframes spinanimation {
    from {
      -moz-transform: rotate(0deg);
    }
    to {
      -moz-transform: rotate(360deg);
    }
  }
  @-ms-keyframes spinanimation {
    from {
      -ms-transform: rotate(0deg);
    }
    to {
      -ms-transform: rotate(360deg);
    }
  }
  @keyframes spinanimation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
