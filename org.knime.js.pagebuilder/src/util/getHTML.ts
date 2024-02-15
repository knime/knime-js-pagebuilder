// Serialize DOM to HTML string including shadow roots

// NOTE:
// loosely based on https://gist.github.com/developit/54f3e3d1ce9ed0e5a171044edcd0784f
// can replaced by this WHATWG standard once its finalized and included in all browsers: https://github.com/whatwg/html/issues/8867
// we currently do not use adoptedStylesheets but if we want to this is relevant: https://github.com/whatwg/html/issues/9962
// chrome impl: https://chromestatus.com/feature/5102952270528512

type Options = { includeShadowRoots?: boolean; shadowRoots?: ShadowRoot[] };

const getHTML = (element: Element, opts?: Options) => {
  const html = element.innerHTML;
  if (!opts || !opts.includeShadowRoots) {
    return html;
  }
  const closedShadowHostMap = new (self.WeakMap || Map)();
  for (const c of opts.shadowRoots || []) {
    closedShadowHostMap.set(c.host, c);
  }

  const shadowRootsHTML: Array<{
    attachNode: string;
    shadowTemplate: string;
  }> = [];

  const walk = (node: Element) => {
    let childElement;
    const shadow = node.shadowRoot || closedShadowHostMap.get(node);
    if (shadow) {
      shadowRootsHTML.push({
        attachNode: node.outerHTML,
        shadowTemplate: `<template shadowrootmode="${shadow.mode}">${shadow.innerHTML}</template>`,
      });
    }
    childElement = node.firstElementChild;
    while (childElement) {
      walk(childElement);
      childElement = childElement.nextElementSibling;
    }
  };

  // do the walk
  walk(element);

  // replace collected shadow roots
  let out = html;
  for (const { attachNode, shadowTemplate } of shadowRootsHTML) {
    const openingTag = attachNode.substring(0, attachNode.indexOf(">") + 1);
    out = out.replace(openingTag, openingTag + shadowTemplate);
  }
  return out;
};

export default getHTML;
