<script>
  export let localDb;

  let listName = "";
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
  }
</script>

<div id="modal-list-add" class="modal bottom-sheet list-bottom-sheet">
  <form
    id="shopping-list-add"
    class="col s12 white"
    on:submit|preventDefault={addList}
  >
    <div class="modal-content">
      <h5 id="create-shopping-list">Create a Shopping List</h5>
      <div class="row">
        <div class="input-field col s12">
          <input
            name="title"
            type="text"
            class="validate"
            placeholder="Enter a title for the shopping list"
            required
            bind:value={listName}
          />
        </div>
      </div>
    </div>
    <div class="modal-footer primary-color">
      <button class="btn-flat modal-close" type="button">Cancel</button>
      <button class="btn-flat" type="submit">Add</button>
    </div>
  </form>
</div>
