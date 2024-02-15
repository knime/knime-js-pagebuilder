import getHTML from "./getHTML";

const generateReportLayout = (reportingContent) => {
  // we can't clone this as we would loose the shadow roots
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
      style += rule.cssText;
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
