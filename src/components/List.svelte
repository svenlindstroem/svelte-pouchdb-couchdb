<script>
  export let list;
  export let localDb;

  let checkedText = "0 items";
  // this collapsible component is either in viewState or editState
  let viewState = "open";

  $: editState = viewState === "open" ? "closed" : "open"; // here we listen to viewState

  // toggle between viewState and editState
  function toggle() {
    viewState = viewState === "closed" ? "open" : "closed";
  }

  function openList() {}

  async function remove() {
    if (viewState === "open") return;
    try {
      const result = await localDb.remove(list._id, list._rev);
      if (result) {
        viewState = "open";
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function update() {
    if (viewState === "open") return;
    try {
      const result = await localDb.put(list);
      toggle();
    } catch (error) {
      console.error(error);
    }
  }
</script>

<div class="card collapsible">
  <div class="list-view collapsible {viewState}">
    <div class="card-content" on:click={openList}>
      <span class="card-title activator"
        >{list.title}
        <button class="btn-flat more-btn right" on:click={toggle}
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
  <div class="list-edit collapsible {editState}">
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
              name="title"
              type="text"
              class="validate"
              bind:value={list.title}
              placeholder="Supermarket"
              required=""
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
