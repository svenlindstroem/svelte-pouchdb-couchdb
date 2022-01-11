<script>
  import { lastLocalModification } from "../store.js";
  import { focusHelper } from "../helper";

  export let item;
  export let localDb;

  // this collapsible component is either in view or edit mode
  let isEdit = false;

  // bind input, element will be passed to the focusHelper function
  let input;

  // toggle between view and edit mode
  function toggle() {
    isEdit = !isEdit;
    if (isEdit) {
      focusHelper(input);
    }
  }

  async function remove() {
    try {
      const result = await localDb.remove(item._id, item._rev);
      if (result) {
        $lastLocalModification = new Date().toString();
      }
    } catch (error) {
      console.error(error);
    }
  }

  // update only checked and updatedAt, do not toggle
  async function check() {
    try {
      const doc = item;
      doc.checked = this.checked;
      doc.updatedAt = new Date().toISOString();
      const result = await localDb.put(doc);
      item = await localDb.get(doc._id);
      $lastLocalModification = new Date().toString();
    } catch (error) {
      console.log(error);
    }
  }

  async function update() {
    try {
      item.updatedAt = new Date().toISOString();
      const result = await localDb.put(item);
      $lastLocalModification = new Date().toString();
      toggle();
    } catch (error) {
      console.error(error);
    }
  }
</script>

<li id="item" class="card collection-item">
  <div class:closed={isEdit} class="item-view collapsible">
    <label>
      <input type="checkbox" on:click={check} bind:checked={item.checked} />
      <span>{item.title}</span>
    </label>
    {#if !item.checked}
      <button class="btn-flat more-btn right" on:click={toggle}
        ><i class="material-icons">more_vert</i></button
      >
    {/if}
  </div>
  <div class:closed={!isEdit} class="item-edit collapsible">
    <form
      id="form-item"
      class="col s12 tertiary lighter"
      on:submit|preventDefault={update}
    >
      <div>
        <span class="card-title">
          <button
            id="close-item"
            type="button"
            class="btn-flat more-btn right"
            on:click={toggle}
            aria-hidden="true"><i class="material-icons">close</i></button
          >
        </span>
        <h5>Edit Item</h5>
        <div class="row">
          <div class="input-field col s12">
            <input
              name="title"
              type="text"
              class="validate"
              placeholder="item name"
              aria-hidden="true"
              required=""
              bind:this={input}
              bind:value={item.title}
            />
          </div>
        </div>
      </div>
      <div class="card-action">
        <button
          class="btn-flat"
          type="button"
          on:click={remove}
          aria-hidden="true">Remove</button
        >
        <button class="btn-flat" type="submit" aria-hidden="true">Update</button
        >
      </div>
    </form>
  </div>
</li>

<style>
  .item-view span {
    font-size: 25px !important;
    font-weight: 300;
    color: #212121;
  }
  input:checked ~ span {
    text-decoration: line-through;
  }
</style>
