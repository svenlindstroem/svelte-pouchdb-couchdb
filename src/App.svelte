<script>
  import { onMount } from "svelte";

  import ModalSettings from "./components/ModalSettings.svelte";
  import ModalListAdd from "./components/ModalListAdd.svelte";
  import List from "./components/List.svelte";
  const localDbName = "shopping";
  const localDb = new PouchDB(localDbName);

  let view = "lists";

  let lists = [];

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

  function goto() {
    console.log("goto");
  }
</script>

<!-- banner -->
<header class="navbar-fixed">
  <nav id="nav" class="primary-color">
    <div class="nav-wrapper">
      <span class="brand-logo left">
        <a href="#!" on:click|preventDefault={goto} class="goback"
          ><i class="material-icons">arrow_back</i></a
        >
        <span id="header-title">Shopping Lists</span>
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
  <div id="shopping-lists">
    <!-- shopping lists get inserted here -->
    {#await lists}
      ... loading
    {:then lists}
      {#each lists as list}
        <List {list} {localDb} />
      {/each}
    {/await}
  </div>

  {#if view === "items"}
    <ul id="shopping-list-items" class="collection">
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
