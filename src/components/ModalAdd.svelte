<script lang="ts">
  import { currentList, lastLocalModification } from "../store.js";
  import { focusHelper } from "../helper.js";
  export let db: any;

  let title: string = "";
  let doc: Doc;

  // bind input, element will be passed to the focusHelper function
  let input: HTMLInputElement;

  async function add() {
    if ($currentList && $currentList._id) {
      // adding an item
      doc = {
        _id: "item:" + new Date().toISOString(),
        type: "item",
        version: 1,
        list: $currentList._id,
        title: title,
        checked: false,
        createdAt: new Date().toISOString(),
        updatedAt: "",
        _rev: "",
      };
    } else {
      // adding a list
      doc = {
        _id: "list:" + new Date().toISOString(),
        type: "list",
        version: 1,
        title: title,
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
        _rev: "",
      };
    }

    try {
      await db.addListOrItem(doc);
      title = "";
      // assert el as HTMLInputElement
      const el = document.querySelector(
        "#modal-add .modal-close"
      ) as HTMLInputElement;
      el.click();
    } catch (error) {
      console.error("could not save list or item", error);
    }
  }

  // todo: async
  /* function save(doc) {
    db.localDb.put(doc, function (error, result) {
      if (!error) {
        title = "";
        $lastLocalModification = new Date().toString();
        console.log(result);
        // assert el as HTMLInputElement
        const el = document.querySelector(
          "#modal-add .modal-close"
        ) as HTMLInputElement;
        el.click();
      } else {
        console.log(error);
      }
    });
  }*/
</script>

<div
  id="modal-add"
  class="modal bottom-sheet list-bottom-sheet"
  on:focus={() => focusHelper(input)}
>
  <!-- add item or list -->
  <form id="item-add" class="col s12 white" on:submit|preventDefault={add}>
    <div class="modal-content">
      <h5 id="create-shopping-list">
        {$currentList && $currentList._id
          ? "Add an Item"
          : "Create a Shopping List"}
      </h5>
      <div class="row">
        <div class="input-field col s12">
          <input
            name="title"
            type="text"
            class="validate"
            placeholder={$currentList && $currentList._id
              ? "Enter an item to add to the shopping list"
              : "Enter a title for the shopping list"}
            required
            bind:this={input}
            bind:value={title}
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
