<script lang="ts">
  import { currentList, lastLocalModification } from "../store.js";
  import { focusHelper } from "../helper.js";

  export let list: any;
  export let db: any;

  // bind input, element will be passed to the focusHelper function
  let input: HTMLInputElement;
  let totalItems = 0;
  let checkedItems = 0;

  // listen to total and checked items to set up complete and checked text
  $: complete = totalItems === checkedItems && totalItems !== 0 ? true : false;
  $: checkedText =
    totalItems === 0 ? "0 items" : `${checkedItems} of ${totalItems} checked`;
  // when list changes, count again;
  $: list && count();

  // count total and checked items
  // todo: should use the apache couchdb count function?
  async function count(): Promise<any> {
    const ct = await db.countItems(list._id);
    return ({ totalItems, checkedItems } = ct);
  }

  // this collapsible component is either in view or edit mode
  let isEdit: boolean = false;

  // toggle between view and edit mode
  function toggle(): void {
    isEdit = !isEdit;
    if (isEdit) {
      focusHelper(input);
    }
  }

  // set the current list object
  // App listens to store change
  // when $currentList is set triggering a change from master-vie to detail-view
  function openList(): void {
    $currentList = list;
  }

  // foward call db method removeList
  async function remove(): Promise<void> {
    try {
      await db.removeListOrItem(list);
      toggle();
    } catch (error) {
      console.log("could not remove", error);
    }
  }

  // foward call db method updateList
  async function update(): Promise<void> {
    if (!isEdit) return;
    try {
      await db.updateListOrItem(list);
      toggle();
    } catch (error) {
      console.error(error);
    }
  }

  // count again when modifications occur
  $: $lastLocalModification, count();
</script>

<div class="card collapsible">
  <div class:closed={isEdit} class="list-view collapsible">
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
      {#if complete}
        <label>
          <input type="checkbox" checked disabled />
          <span>{checkedText}</span>
        </label>
      {:else}
        <span>{checkedText}</span>
      {/if}
    </div>
  </div>
  <div class:closed={!isEdit} class="list-edit collapsible">
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
              required
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

<style>
  .card {
    margin: 30px;
  }
</style>
