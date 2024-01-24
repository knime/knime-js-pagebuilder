import getHTML from "./getHTML";
const isRuleApplied = (rule) => {
  if (rule instanceof CSSFontFaceRule || rule instanceof CSSPageRule) {
    return true;
  }
  if (
    ["root", "body", "html"].some((selector) => {
      return Boolean(rule.selectorText?.includes(selector));
    })
  ) {
    return true;
  }
  const elements = document.querySelectorAll(rule.selectorText);
  return Boolean(elements?.length);
};

const generateReportLayout = (reportingContent) => {
  // we can't clone this as we would loose the shadow roots
  // this can be re-added as soon as `clonable` has good browser support:
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#clonable
  const layout = document.querySelector("#knime-layout");

  // replace provided content from the ui extension (e.g. an image)
  layout.querySelectorAll(".reporting-replaceable").forEach((entry) => {
    const nodeId = entry.getAttribute("node-id");
    if (reportingContent[nodeId]) {
      entry.replaceChildren(
        new DOMParser().parseFromString(reportingContent[nodeId], "text/html")
          .body.firstChild,
      );
    }
  });

  // global styles
  const styleSheets = [];
  for (const sheet of document.styleSheets) {
    let style = "<style>";
    for (const rule of sheet.cssRules) {
      if (isRuleApplied(rule)) {
        style += rule.cssText;
      }
    }
    style += "</style>";
    styleSheets.push(style);
  }

  const report =
    styleSheets.join("\n") +
    getHTML(layout.parentElement, {
      includeShadowRoots: true,
    });

  return report;
};

export { generateReportLayout };
