<script>
  import { onMount } from "svelte";

  import ModalSettings from "./components/ModalSettings.svelte";
  import ModalListAdd from "./components/ModalListAdd.svelte";
  const localDbName = "shopping";
  const localDb = new PouchDB(localDbName);

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

  function toggleList() {}
  function removeList() {}
  function updateList() {}

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
        <div class="card collapsible">
          <div class="list-view collapsible">
            <div class="card-content" on:click={goto}>
              <span class="card-title activator"
                >{list.title}
                <button class="btn-flat more-btn right" on:click={toggleList}
                  ><i class="material-icons">more_vert</i></button
                >
              </span>
            </div>
            <div class="card-action">
              <input
                type="checkbox"
                id="checked-list-list-2021-10-25T11-53-50-689Z"
                name="checked-list-list-2021-10-25T11-53-50-689Z"
                disabled=""
              />
              <label for="checked-list-list-2021-10-25T11-53-50-689Z"
                >0 of 2 items checked</label
              >
            </div>
          </div>
          <div class="list-edit collapsible closed">
            <form
              id="form-list-2021-10-25T11-53-50-689Z"
              class="col s12 white"
              on:submit|preventDefault={updateList}
            >
              <div class="card-content">
                <span class="card-title">
                  <button
                    id="close-list-2021-10-25T11-53-50-689Z"
                    type="button"
                    class="btn-flat more-btn right"
                    on:click|preventDefault={toggleList}
                    ><i class="material-icons">close</i></button
                  >
                </span>
                <h5>Edit Shopping List</h5>
                <div class="row">
                  <div class="input-field col s12">
                    <input
                      name="title"
                      type="text"
                      class="validate"
                      value={list.title}
                      placeholder="Supermarket"
                      required=""
                    />
                  </div>
                </div>
              </div>
              <div class="card-action">
                <button
                  class="btn-flat"
                  type="button"
                  on:click|preventDefault={removeList}>Remove</button
                >
                <button class="btn-flat" type="submit">Update</button>
              </div>
            </form>
          </div>
        </div>
      {/each}
    {/await}
  </div>

  <ul id="shopping-list-items" class="collection">
    <!-- shopping list items get inserted here -->
  </ul>

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
  main {
    display: flex;
  }
</style>
