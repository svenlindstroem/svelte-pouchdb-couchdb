<script>
  import { onMount } from "svelte";

  import ModalListAdd from "./components/ModalListAdd.svelte";
  const localDbName = "shopping";
  const localDb = new PouchDB(localDbName);

  let remoteUrl,
    listName,
    lists = [];

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

  async function getSettings(id) {
    try {
      const result = await localDb.get("_local/user");
      return result;
    } catch (error) {
      return error;
    }
  }

  async function saveSettings() {
    const _id = "_local/user";

    const settings = {
      _id: _id,
      remoteDB: remoteUrl, // bound variable
    };

    // get the previous aved setting if any
    const doc = await getSettings();
    if (doc && doc._rev) {
      // for an update operation a _rev is required
      settings._rev = doc._rev;
    }

    localDb.put(settings, function (error, response) {
      console.log("save settings", error, response);
      if (error) {
        console.error("Error saving these settings:", settings);
      } else {
        document.querySelector("#modal-settings .modal-close").click();
      }
    });
  }

  function goto() {
    console.log("goto");
  }

  /*
  function addList() {
    const list = {
      _id: "list:" + new Date().toISOString(),
      type: "list",
      version: 1,
      title: listName,
      checked: false,
      place: {
        title: "",
        license: "",
        lat: null,
        lon: null,
        address: {},
      },
      createdAt: new Date().toISOString(),
      updatedAt: "",
    };

    localDb.put(list, function (error, result) {
      console.log(error, result);
      if (!error) {
        listName = "";
        document.querySelector("#modal-list-add .modal-close").click();
      }
    });
  }*/
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
<div id="modal-settings" class="modal top-sheet settings-top-sheet">
  <form
    id="shopping-list-settings"
    class="col s12 white"
    on:submit|preventDefault={saveSettings}
  >
    <div class="modal-content">
      <h5>Shopping Lists Settings</h5>
      <div class="row">
        <div class="input-field col s12">
          <span class="primary-text darker"
            >Enter a fully qualified URL (including username and password) to a
            remote IBM Cloudant, Apache CouchDB, or PouchDB database to sync
            your shopping list.</span
          >
          <input
            name="remoteDB"
            type="url"
            class="validate"
            placeholder="http://username:password@localhost:5984/database"
            bind:value={remoteUrl}
          />
          <div class="chip" />
        </div>
      </div>
    </div>
    <div class="modal-footer secondary-color">
      <button class="btn-flat modal-close" type="button">Cancel</button>
      <button class="btn-flat" type="submit">Sync</button>
    </div>
  </form>
</div>
<!-- test modal -->

<!-- modal: add a shopping list form -->
<ModalListAdd {localDb} />

<style>
  main {
    display: flex;
  }
</style>
