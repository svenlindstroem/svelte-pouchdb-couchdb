/// <reference types="svelte" />

export {};
declare global {
  /**
   * HTMLTextAreaElement.createTextRange function is microsoft specific 
   */
  interface Element {
    createTextRange: any;
  }
}