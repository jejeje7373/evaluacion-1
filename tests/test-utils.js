import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

// Informar a React 18 que este es un entorno de testing compatible con act()
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let currentRoot = null;
let currentContainer = null;

export function setupTestContainer() {
  currentContainer = document.createElement('div');
  currentContainer.id = 'test-container';
  document.body.appendChild(currentContainer);
  currentRoot = createRoot(currentContainer);
  return currentContainer;
}

export function cleanupTestContainer() {
  if (currentRoot) {
    act(() => {
      currentRoot.unmount();
    });
    currentRoot = null;
  }
  if (currentContainer && currentContainer.parentNode) {
    currentContainer.parentNode.removeChild(currentContainer);
    currentContainer = null;
  }
}

export function render(element) {
  act(() => {
    currentRoot.render(element);
  });
  return currentContainer;
}

export function fireClick(element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

export function fireChange(element, value) {
  act(() => {
    if (element.type === 'checkbox') {
      const checkedSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked')?.set;
      if (checkedSetter) {
        checkedSetter.call(element, Boolean(value));
      } else {
        element.checked = Boolean(value);
      }
      element.dispatchEvent(new Event('click', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    let proto = window.HTMLInputElement.prototype;
    if (element instanceof window.HTMLSelectElement) {
      proto = window.HTMLSelectElement.prototype;
    } else if (element instanceof window.HTMLTextAreaElement) {
      proto = window.HTMLTextAreaElement.prototype;
    }

    const valueSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

export function fireSubmit(formElement) {
  act(() => {
    formElement.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}
