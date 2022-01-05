<script>
  import { focusHelper } from "../helper.js";

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  function dispatchNewSettings() {
    dispatch("newSettings", {
      text: "new settings!",
    });
  }
  export let localDb;
  export let settings;
  export let online;

  let remoteUrl;
  let syncError = false;

  // bind input, element will be passed to the focusHelper function
  let input;

  /**
   * check if the new url will work
   * return boolean
   */
  async function newSettingsOk() {
    try {
      const db = await new PouchDB(remoteUrl, {
        skip_setup: true,
      });
      const info = await db.info();
      // info.status returns 404:
      // connection succeded, but database not created (see skip_setup)
      // info.db_name returns a string:
      // database already exists
      // console.log(info);
      if ((info && info.status === 404) || info.db_name) {
        return true;
      }
    } catch (error) {
      console.log("error", error);
      syncError = true;
      return false;
    }
  }

  async function saveSettings() {
    if (!remoteUrl) return;

    const ok = await newSettingsOk();

    if (!ok) return;

    const _id = "_local/user";

    const newSettings = {
      _id: _id,
      remoteDB: remoteUrl, // bound variable
    };

    // for an update operation a _rev is required
    // get the previous saved setting if any
    if (settings) {
      newSettings._rev = settings._rev;
    }

    try {
      const result = localDb.put(newSettings);
      if (result) {
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
  function focus() {
    if (settings) {
      remoteUrl = settings.remoteDB;
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
          {#if syncError}
            <div class="chip error">Sync Error</div>
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
</style>
