document.readyState !== 'loading' ? init() : document.addEventListener('DOMContentLoaded', init);

function $(selector, context = document) {
  return context.querySelector(selector);
}

function addDisplayProp() {
  const $props = $('.display-prop', $('template').content);
  const node = document.importNode($props, true);
  $('aside').append(...node.children);
}

function setInputValues(classAndValues, context = document) {
  classAndValues.map(([className, value]) => $(className, context).value = value);
}

function changeShown(inputShown) {
  let isSelected = false;
  if (inputShown.checked) {
    const nextDiv = inputShown.parentElement.nextElementSibling;
    const inputParams = [
      [':scope > .inches', nextDiv],
      [':scope > .ratio-h', nextDiv.nextElementSibling],
      [':scope > .ratio-v', nextDiv.nextElementSibling],
    ].map(([selector, ctx]) => $(selector, ctx));
    const params = inputParams.map((input) => input.value).map(Number);
    const notIntIndex = params.findIndex((n) => !Number.isFinite(n) || n <= 0);
    if (notIntIndex !== -1) {
      inputParams[notIntIndex].focus();
      inputShown.checked = false;
      return;
    }
    isSelected = true;
    const [inches, ratioH, ratioV] = params;
  }
  inputShown.parentElement.classList.toggle('selected', isSelected);
}

function removeProp(target) {
  [...Array(3)].map(() => target.parentElement.previousElementSibling.remove());
  target.parentElement.remove();
}

function onChangeInput(e) {
  switch (e.target.className) {
    case 'shown':
      changeShown(e.target);
      break;
    default:
  }
}

function onClickElement(e) {
  switch (e.target.className) {
    case 'del':
      removeProp(e.target);
      break;
    default:
  }
}

function init() {
  $('.add-display').addEventListener('click', addDisplayProp);
  document.addEventListener('change', onChangeInput);
  document.addEventListener('click', onClickElement);
  addDisplayProp();
  setInputValues([
    ['.ratio-h', 16],
    ['.ratio-v', 9],
    ['.inches', 15.6],
  ]);
  $('.shown').checked = true;
  changeShown($('.shown'));
}
