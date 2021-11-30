<script>
  import { currentList, lastLocalModification } from "./store.js";
  import ModalAbout from "./components/ModalAbout.svelte";
  import ModalSettings from "./components/ModalSettings.svelte";
  import ModalAdd from "./components/ModalAdd.svelte";
  import List from "./components/List.svelte";
  import Item from "./components/Item.svelte";

  const localDbName = "shopping2";
  const localDb = new PouchDB(localDbName);

  let lists = [];
  let items = [];
  let currentView = "master-view";

  $: $lastLocalModification, getLists(), getItems();
  $: $currentList, listChange();

  function listChange() {
    if (Object.keys($currentList).length) {
      currentView = "detail-view";
      getItems();
    } else {
      $currentList = {};
    }
  }

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

<!-- banner -->
<header class="navbar-fixed">
  <nav id="nav" class="primary-color">
    <div class="nav-wrapper">
      <span class="brand-logo left">
        {#if currentView === "detail-view"}
          <a href="#!" on:click={() => (currentView = "master-view")}
            ><i class="material-icons">arrow_back</i></a
          >
        {/if}
        <span id="header-title">
          {#if currentView === "detail-view"}
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
        ><i class="material-icons">settings</i></a
      >
    </div>
  </nav>
</header>
<!-- content area -->
<main class={currentView}>
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
<ModalSettings {localDb} />

<!-- modal: open shopping list about -->
<ModalAbout />

<!-- modal: add a shopping list or an item form -->
<ModalAdd {localDb} {currentView} />

<style>
</style>
