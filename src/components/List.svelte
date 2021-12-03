<script>
  import { currentList, lastLocalModification } from "../store.js";
  import focusHelper from "../helper.js";

  export let list;
  export let localDb;

  // bind input, element will be passed to the focusHelper function
  let input;
  let checkedText = "0 items";

  // this collapsible component is either in view or edit mode
  let isEdit = false;

  // toggle between view and edit mode
  function toggle() {
    isEdit = !isEdit;
    if (isEdit) {
      focusHelper(input);
    }
  }

  // set the current list object
  // App listens to store change
  // when $currentList is set triggering a change from master-vie to detail-view
  function openList() {
    $currentList = list;
  }

  async function remove() {
    try {
      const result = await localDb.remove(list._id, list._rev);
      if (result) {
        $lastLocalModification = new Date().toString();
        toggle();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function update() {
    if (!isEdit) return;
    try {
      const result = await localDb.put(list);
      $lastLocalModification = new Date().toString();
      toggle();
    } catch (error) {
      console.error(error);
    }
  }
  function niceId() {}
</script>

<div class="card collapsible">
  <div class="list-view collapsible {isEdit ? 'closed' : 'open'}">
    <div class="card-content" on:click={openList}>
      <span class="card-title activator"
        >{list.title}
        <button
          class="btn-flat more-btn right"
          on:click|stopPropagation={toggle}
          ><i class="material-icons">more_vert</i></button
        >
      </span>
    </div>
    <div class="card-action">
      <input type="checkbox" name="checked" disabled="" />
      <label for="checked-list-list-2021-10-25T11-53-50-689Z"
        >{checkedText}</label
      >
    </div>
  </div>
  <div class="list-edit collapsible {isEdit ? 'open' : 'closed'}">
    <form class="col s12 white" on:submit|preventDefault={update}>
      <div class="card-content">
        <span class="card-title">
          <button
            type="button"
            class="btn-flat more-btn right"
            on:click|preventDefault={toggle}
            ><i class="material-icons">close</i></button
          >
        </span>
        <h5>Edit Shopping List</h5>
        <div class="row">
          <div class="input-field col s12">
            <input
              id={"input" + Math.floor(Math.random() * 100000)}
              name="title"
              type="text"
              class="validate"
              bind:value={list.title}
              bind:this={input}
              placeholder="Your shopping list name"
              required="true"
            />
          </div>
        </div>
      </div>
      <div class="card-action">
        <button class="btn-flat" type="button" on:click|preventDefault={remove}
          >Remove</button
        >
        <button class="btn-flat" type="submit">Update</button>
      </div>
    </form>
  </div>
</div>
