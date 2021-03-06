/**
 *
 * @param {*} element
 * set focus on input element and
 * move carret on input dom element to
 * end of input text (if any)
 */
function focusHelper(element) {
  // console.log(Object.prototype.toString.call(element));
  element.focus();
  if (typeof element.selectionStart == "number") {
    element.selectionStart = element.selectionEnd = element.value.length;
  } else if (typeof element.createTextRange != "undefined") {
    var range = element.createTextRange();
    range.collapse(false);
    range.select();
  }
}
/**
 * check if object is empty
 * @param {*} obj
 * @returns boolean
 */
function emptyObj(obj) {
  return Object.keys(obj).length ? false : true;
}

export { focusHelper, emptyObj };
