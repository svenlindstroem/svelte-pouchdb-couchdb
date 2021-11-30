<script>
  import { currentList, lastLocalModification } from "../store.js";
  export let localDb, currentView;

  let itemName = "";
  function addItem() {
    const item = {
      _id: "item:" + new Date().toISOString(),
      type: "item",
      version: 1,
      list: $currentList._id,
      title: itemName,
      checked: false,
      createdAt: new Date().toISOString(),
      updatedAt: "",
    };

    localDb.put(item, function (error, result) {
      if (!error) {
        itemName = "";
        $lastLocalModification = new Date().toString();
        document.querySelector("#modal-add .modal-close").click();
      }
    });
  }

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
        $lastLocalModification = new Date().toString();
        document.querySelector("#modal-add .modal-close").click();
      }
    });
  }

  // when modal receives focus, refocus on apropiate input field
  function reFocus() {
    const field = currentView === "master-view" ? "#addList" : "#addItem";
    document.querySelector(field).focus();
  }
</script>

<div
  id="modal-add"
  on:focus={reFocus}
  class="modal bottom-sheet list-bottom-sheet"
>
  {#if currentView === "detail-view"}
    <!-- add item -->
    <form
      id="item-add"
      class="col s12 white"
      on:submit|preventDefault={addItem}
    >
      <div class="modal-content">
        <h5 id="create-shopping-list">Add an Item</h5>
        <div class="row">
          <div class="input-field col s12">
            <input
              id="addItem"
              name="title"
              type="text"
              class="validate"
              placeholder="Enter an item to add to the shopping list"
              required
              bind:value={itemName}
            />
          </div>
        </div>
      </div>
      <div class="modal-footer primary-color">
        <button class="btn-flat modal-close" type="button">Cancel</button>
        <button class="btn-flat" type="submit">Add</button>
      </div>
    </form>
  {:else}
    <!-- add list -->
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
              id="addList"
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
  {/if}
</div>
