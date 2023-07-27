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
      report += rule.cssText;
    }
    report += "</style>\n";
  }
  report += layout.outerHTML;
  return report;
};

export { generateReportLayout };
