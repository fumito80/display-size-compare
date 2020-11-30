// const MM = 25.4;

document.addEventListener('DOMContentLoaded', init);

function $(selector, context = document) {
  return context.querySelector(selector);
}

function $$(selector, context = document) {
  return [...context.querySelectorAll(selector)];
}

function addDisplayProp(e) {
  e && e.preventDefault();
  const $props = $('.display-prop', $('template').content);
  const node = document.importNode($props, true);
  const inches = $('.inches', node);
  $('form').append(...node.children);
  inches.focus();
}

function setInputValues(classAndValues, context = document) {
  classAndValues.map(([className, value]) => $(className, context).value = value);
}

function getParams(inputShown) {
  const nextDiv = inputShown.parentElement.nextElementSibling;
  const inputParams = [
    [':scope > .inches', nextDiv],
    [':scope > .ratio-h', nextDiv.nextElementSibling],
    [':scope > .ratio-v', nextDiv.nextElementSibling],
  ].map(([selector, ctx]) => $(selector, ctx));
  const params = inputParams.map((input) => input.value).map(Number);
  return [params, inputParams];
}

function changeShown(inputShown) {
  if (inputShown.checked) {
    const [params, inputParams] = getParams(inputShown);
    const notIntIndex = params.findIndex((n) => !Number.isFinite(n) || n <= 0);
    if (notIntIndex !== -1) {
      inputParams[notIntIndex].focus();
      inputShown.checked = false;
    }
  }
  inputShown.parentElement.classList.toggle('selected', inputShown.checked);
  drawScreen();
}

function removeProp(target) {
  [...Array(3)].map(() => target.parentElement.previousElementSibling.remove());
  target.parentElement.remove();
  drawScreen();
}

function onChangeInput(e) {
  switch (e.target.className) {
    case 'shown':
      changeShown(e.target);
      break;
    default:
      let inputShown = e.target.parentElement.previousElementSibling;
      while (inputShown && !inputShown.classList.contains('inputShown')) {
        inputShown = inputShown.previousElementSibling;
      }
      inputShown.firstElementChild.checked = true;
      changeShown(inputShown.firstElementChild);
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

function onClickRefPos(e) {
  if (e.target.classList.contains('box')) {
    return;
  }
  $('.ref-pos .selected').classList.remove('selected');
  e.target.classList.add('selected');
  drawScreen();
}

function init() {
  const $form = $('form');
  $form.addEventListener('submit', addDisplayProp);
  $form.addEventListener('change', onChangeInput);
  $form.addEventListener('click', onClickElement);
  $('.ref-pos .box').addEventListener('click', onClickRefPos)
  addDisplayProp();
  setInputValues([
    ['.ratio-h', 16],
    ['.ratio-v', 9],
    ['.inches', 15.6],
  ]);
  $('.shown').checked = true;
  changeShown($('.shown'));
}

function getScreenRects() {
  return $$('.shown:checked').map((inputShown) => {
    const [[inches, ratioH, ratioV]] = getParams(inputShown);
    const rad = Math.atan(ratioV / ratioH);
    const inW = inches * Math.cos(rad);
    const inH = inches * Math.sin(rad);
    return [inW, inH];
  });
}

function getPosFn(pos) {
  switch (pos) {
    case 1:
      return (scale, max, val) => (max - val) / 2 * scale;
    case 2:
      return (scale, max, val) => (max - val) * scale;
    default:
      return () => 0;
  }
}

function drawScreen() {
  const rects = getScreenRects();
  const refPos = $$('.ref-pos > .box > div').indexOf($('.ref-pos .selected'));
  const getleft = getPosFn(Math.trunc(refPos % 3));
  const getTop = getPosFn(Math.trunc(refPos / 3));
  const $main = $('main');
  $main.innerHTML = '';
  if (rects.length === 0) {
    return;
  }
  const maxW = Math.max(...rects.map(([w]) => w));
  const maxH = Math.max(...rects.map(([, h]) => h));
  const rectMain = $main.getBoundingClientRect();
  const isHeightRelative = (rectMain.height / maxH * maxW) < rectMain.width;
  const scale = isHeightRelative ? rectMain.height / maxH : rectMain.width / maxW;
  const screens = rects.map(([w, h]) => {
    const left = getleft(scale, maxW, w);
    const top = getTop(scale, maxH, h);
    const width = w * scale;
    const height = h * scale;
    return `<div class="screen" style="left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px;"></div>`;
  });
  $main.innerHTML = screens.join('');
}

let resizeTimer;

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawScreen, 250);
});
