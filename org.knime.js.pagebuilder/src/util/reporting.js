const isRuleApplied = (rule) => {
  // if (rule instanceof CSSFontFaceRule) {
  //   return true;
  // }
  if (
    rule?.selectorText?.includes("root") ||
    rule?.selectorText?.includes("body") ||
    rule?.selectorText?.includes("html")
  ) {
    return true;
  }
  const elements = document.querySelectorAll(rule.selectorText);
  if (elements?.length) {
    return true;
  }
  return false;
};

const generateReportLayout = (reportingContent) => {
  const layout = document.querySelector("#knime-layout").cloneNode(true);
  layout.querySelectorAll(".reporting-replaceable").forEach((entry) => {
    const nodeId = entry.getAttribute("node-id");
    if (reportingContent[nodeId]) {
      entry.replaceChildren(
        new DOMParser().parseFromString(reportingContent[nodeId], "text/html")
          .body.firstChild,
      );
    }
  });
  let report = "";
  for (const sheet of document.styleSheets) {
    report += "<style>";
    for (const rule of sheet.cssRules) {
      if (isRuleApplied(rule)) {
        report += rule.cssText;
      }
    }
    report += "</style>\n";
  }
  report += layout.outerHTML;
  return report;
};

export { generateReportLayout };
