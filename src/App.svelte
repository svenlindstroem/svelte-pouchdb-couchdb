<script>
  import { onMount } from "svelte";
  import { listId } from "./store.js";
  import { fly } from "svelte/transition";

  import ModalSettings from "./components/ModalSettings.svelte";
  import ModalListAdd from "./components/ModalListAdd.svelte";
  import List from "./components/List.svelte";

  const localDbName = "shopping";
  const localDb = new PouchDB(localDbName);

  let lists = [];
  // if listId is false, show all lists
  // if a listId is set, display all the items in that list
  let activeListId = false;
  let list;
  let screenWidth = 0;
  let params = {
    x: 0,
    duration: 0,
  };

  listId.subscribe((value) => {
    console.log(value, lists);
    activeListId = value;
    if (activeListId) {
      list = lists.reduce((list) => list._id === activeListId);
    }
  });

  function closeList() {
    listId.update(() => false);
  }

  function start() {
    console.log("hello");
    params.x = screenWidth;
    params.duration = 2000;
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
        console.log(lists);
      }
    );
  }

  getLists();
</script>

<!-- banner -->
<header class="navbar-fixed" bind:clientWidth={screenWidth}>
  <nav id="nav" class="primary-color">
    <div class="nav-wrapper">
      <span class="brand-logo left">
        {#if activeListId}
          <a href="#!" on:click={closeList} class=""
            ><i class="material-icons">arrow_back</i></a
          >
        {/if}
        <span id="header-title">
          {#if activeListId}
            {list.title}
          {:else}
            Shopping Lists
          {/if}
        </span>
      </span>
      <!-- settings button -->
      <a
        class="waves-effect waves-light modal-trigger right settings"
        href="#modal-settings"><i class="material-icons">settings</i></a
      >
    </div>
  </nav>
</header>
<!-- content area -->
<main>
  {#if !activeListId}
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
  {:else}
    <ul id="shopping-list-items" class="collection">
      width = {screenWidth}
      collection
      <!-- shopping list items get inserted here -->
    </ul>
  {/if}

  <!-- add more stuff button -->
  <button
    id="add-button"
    class="btn-floating btn-large secondary-color right modal-trigger"
    data-target="modal-list-add"
  >
    <i class="material-icons">add</i>
  </button>
</main>

<!-- modal: add a shopping list settings form -->
<ModalSettings {localDb} />

<!-- modal: add a shopping list form -->
<ModalListAdd {localDb} />

<style>
</style>
