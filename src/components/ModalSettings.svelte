<script>
  import { onMount } from "svelte";
  import { focusHelper } from "../helper.js";

  export let localDb;
  export let settings;
  export let online;

  let remoteUrl;
  let syncError = false;

  // bind input, element will be passed to the focusHelper function
  let input;

  onMount(async () => {
    try {
      const currentSettings = await localDb.get("_local/user");
      remoteUrl = currentSettings.remoteDB;
      // rev = current._rev;
    } catch (error) {
      console.log(error);
    }
  });

  async function getSettings() {
    try {
      const result = await localDb.get("_local/user");
      return result;
    } catch (error) {
      return error;
    }
  }

  // http://admin:admin@localhost1:5984/shopping1

  async function settingsUrlOk() {
    const db = await new PouchDB(remoteUrl, {
      skip_setup: true,
    });

    try {
      const info = await db.info();
      // info.status returns 404:
      // connection succeded, but database not created (see skip_setup)
      // info.db_name returns a string:
      // database already exists
      if ((info.status && info.status === 404) || info.db_name) {
        return true;
      }
    } catch (error) {
      syncError = true;
      return false;
    }
  }

  async function saveSettings() {
    if (!remoteUrl) return;

    const ok = await settingsUrlOk();
    console.log(ok);

    if (!ok) return;

    const _id = "_local/user";

    const settings = {
      _id: _id,
      remoteDB: remoteUrl, // bound variable
    };

    // get the previous saved setting if any
    const doc = await getSettings();
    if (doc && doc._rev) {
      // for an update operation a _rev is required
      settings._rev = doc._rev;
    }

    try {
      const result = localDb.put(settings);
      if (result) {
        document.querySelector("#modal-settings .modal-close").click();
      }
    } catch (error) {
      console.log(error);
    }
  }

  function focus() {
    getSettings();
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
