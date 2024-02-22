// Serialize DOM to HTML string including shadow roots

// NOTE:
// loosely based on https://gist.github.com/developit/54f3e3d1ce9ed0e5a171044edcd0784f
// can replaced by this WHATWG standard once its finalized and included in all browsers: https://github.com/whatwg/html/issues/8867
// we currently do not use adoptedStylesheets but if we want to this is relevant: https://github.com/whatwg/html/issues/9962
// chrome impl: https://chromestatus.com/feature/5102952270528512

// NOTE: this API might change and it looks like we need to add `serializable` to the shadow roots
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
    openTag: string;
    shadowTemplate: string;
  }> = [];

  const walk = (node: Element) => {
    let childElement;
    const shadow = node.shadowRoot || closedShadowHostMap.get(node);
    if (shadow) {
      const { outerHTML } = node;
      shadowRootsHTML.push({
        openTag: outerHTML.substring(0, outerHTML.indexOf(">") + 1),
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

  let out = "";
  let index = 0;
  let openTagIndex;
  for (const { openTag, shadowTemplate } of shadowRootsHTML) {
    // find open tag
    openTagIndex = html.indexOf(openTag, index);
    if (openTagIndex < 0) {
      continue;
    }

    // move to the end of the found index
    openTagIndex += openTag.length;

    // insert shadow template
    out += html.substring(index, openTagIndex) + shadowTemplate;

    // move index
    index = openTagIndex;
  }
  // all replaced out and the remaining html string
  return out + html.substring(index);
};

export default getHTML;
