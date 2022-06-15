/**
 * set focus on input element and
 * move carret on input dom element to
 * end of input text (if any)
 *  @param {*} element
 */
function focusHelper(element: HTMLInputElement | HTMLTextAreaElement): void {
  // console.log(Object.prototype.toString.call(element));
  if(!element) return;
  element.focus();
  if (element.selectionStart && typeof element.selectionStart == "number") {
    element.selectionStart = element.selectionEnd = element.value.length;
  } else if (element.createTextRange && typeof element.createTextRange != "undefined") {
    var range = element.createTextRange();
    range.collapse(false);
    range.select();
  }
}

export { focusHelper };
