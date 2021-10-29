<script>
  import { onMount } from "svelte";

  export let localDb;

  let remoteUrl;
  let rev;

  onMount(async () => {
    try {
      const current = await localDb.get("_local/user");
      remoteUrl = current.remoteDB;
      rev = current._rev;
    } catch (error) {
      console.log(error);
    }
  });

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
</script>

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
