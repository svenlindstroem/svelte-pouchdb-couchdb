<script>
  import { createEventDispatcher } from "svelte";
  import { focusHelper } from "../helper.js";

  const dispatch = createEventDispatcher();

  export let db;
  export let online;

  let connectionError = false;
  let input; // bind input, element will be passed to the focusHelper function

  function dispatchNewSettings() {
    dispatch("newSettings", {
      text: "new settings!",
    });
  }

  async function saveSettings() {
    if (input.value === "") return;
    console.log("saving ", input.value);
    const ok = await db.checkNewSettings(input.value);
    console.log("check new settings ok?", ok);
    if (!ok) {
      connectionError = true;
      return;
    }

    const _id = "_local/user";
    // console.log("cur set", db.settings);

    const newSettings = {
      _id: _id,
      remoteDB: input.value, // bound variable
    };

    // for an update operation a _rev is required
    // get the previous saved setting if any
    if (db.settings && db.settings._rev) {
      newSettings._rev = db.settings._rev;
    }

    try {
      // console.log("new settings", newSettings);
      const result = await db.localDb.put(newSettings);
      console.log("newSettings, result", newSettings, result);

      if (result) {
        console.log("new settings applied", result);
        document.querySelector("#modal-settings .modal-close").click();
        // now dispach event to the parent app component to restart sync
        dispatchNewSettings();
      }
    } catch (error) {
      console.log(error);
    }
  }

  // capture when element gets focus
  // since we don't use routes, ModalSetting onMount event fires when the app is mounted
  // so we need to use the focus event to reset field values when this element is opened again
  let remoteUrl;
  function focus() {
    if (db.settings && db.settings.remoteDB) {
      remoteUrl = db.settings.remoteDB;
    }
    focusHelper(input);
  }
</script>

<div
  id="modal-settings"
  class="modal top-sheet settings-top-sheet"
  on:focus={focus}
>
  <form
    id="shopping-list-settings"
    class="col s12 white"
    on:submit|preventDefault={saveSettings}
  >
    <div class="modal-content">
      <h5>Shopping Lists Settings</h5>
      <div
        class="row"
        id="newdb"
        on:click={(event) => {
          document.querySelector('input[name="remoteDB"]').value =
            event.target.textContent;
        }}
      >
        http://admin:admin@localhost:5984/shopping1
      </div>
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
            bind:this={input}
            bind:value={remoteUrl}
          />
          {#if !online}
            <div class="chip">You are currently offline!</div>
          {/if}
          {#if connectionError}
            <div class="chip error">Connection Error</div>
          {/if}
        </div>
      </div>
    </div>
    <div class="modal-footer secondary-color">
      <button class="btn-flat modal-close" type="button">Cancel</button>
      <button class="btn-flat" type="submit" disabled={!online}>Sync</button>
    </div>
  </form>
</div>

<style>
  .chip {
    font-weight: 300;
  }
  .chip.error {
    background-color: #c83873;
    color: #ffffff;
  }

  .input-field {
    margin-top: 2.2rem;
  }
</style>
