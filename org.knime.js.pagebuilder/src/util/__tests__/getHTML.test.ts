import { describe, expect, it } from "vitest";

import getHTML from "../getHTML";

describe("getHTML", () => {
  it("should serialize dom with shadow root", () => {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "wrapper");
    const attachPoint = document.createElement("div");
    attachPoint.setAttribute("class", "attachPoint");

    const content = document.createElement("div");
    content.innerHTML = "some content<br><b class='p'>more...</b>";

    wrapper.appendChild(content);
    wrapper.appendChild(attachPoint);

    const contentAfter = document.createElement("div");
    contentAfter.innerHTML = "some after content";
    wrapper.appendChild(contentAfter);

    const shadowRoot = attachPoint.attachShadow({ mode: "open" });

    const insideShadow = document.createElement("p");
    insideShadow.innerHTML = "inside content<br><i>test</i>";

    shadowRoot.appendChild(insideShadow);

    const result = getHTML(wrapper, { includeShadowRoots: true });

    // does not include the shadow dom
    expect(wrapper.outerHTML).toBe(
      '<div class="wrapper"><div>some content<br><b class="p">more...</b></div>' +
        '<div class="attachPoint"></div><div>some after content</div></div>',
    );

    expect(result).toBe(
      '<div>some content<br><b class="p">more...</b></div><div class="attachPoint">' +
        '<template shadowrootmode="open"><p>inside content<br><i>test</i></p></template></div><div>some after content</div>',
    );
  });
});
