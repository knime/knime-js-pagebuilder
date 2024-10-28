const layoutMixin = {
  computed: {
    resizeMethod() {
      return this.viewConfig.resizeMethod || "";
    },
    isReportTableView() {
      return (
        this.isReporting && this.resourceLocation?.endsWith("TableView.js")
      );
    },
    layoutClasses() {
      let classes = [];
      // TODO make a data attribute instead of class
      if (this.isReporting) {
        classes.push("reporting-replaceable");
      }
      // add aspect ratio sizing classes;
      // Because of faulty print behavior in case of large table views wrapped in aspect
      // ratio containers we exclude this case from the aspect ratio classes
      // (related to https://issues.chromium.org/issues/365922171)
      if (
        this.resizeMethod.startsWith("aspectRatio") &&
        !this.isReportTableView
      ) {
        classes.push(this.resizeMethod);
      } else if (this.resizeMethod.startsWith("view")) {
        classes.push("fill-container");
      }
      if (Array.isArray(this.viewConfig.additionalClasses)) {
        classes = classes.concat(this.viewConfig.additionalClasses);
      }
      return classes;
    },
    layoutStyle() {
      let style = [];
      if (this.viewConfig.additionalStyles) {
        style = style.concat(this.viewConfig.additionalStyles);
      }
      // Apply layout styles only for widgets and ui-extensions, current JS Views get the styles in the
      // WebNodeIframe.vue and set it on the iframe itself
      if (
        this.resizeMethod.startsWith("viewLowestElement") &&
        (this.isWidget || this.extensionConfig)
      ) {
        let {
          maxHeight = null,
          maxWidth = null,
          minHeight = null,
          minWidth = null,
        } = this.viewConfig;
        if (maxHeight !== null && !this.isReportTableView) {
          style.push(`max-height:${maxHeight}px;`);
          /**
           * We set height 100% on fill-container only on @media screen to prevent overflow issues
           * on print for large elements including page breaks (https://issues.chromium.org/issues/365922171).
           * But without these 100% height, e.g. the shrink
           * behavior of other elements does not work anymore (e.g. ImageView).
           */
          style.push("height:100%;");
        }
        if (maxWidth !== null) {
          style.push(`max-width:${maxWidth}px`);
        }
        if (minHeight !== null) {
          style.push(`min-height:${minHeight}px`);
        }
        if (minWidth !== null) {
          style.push(`min-width:${minWidth}px`);
        }
      }
      return style.join(";").replace(/;;/g, ";");
    },
  },
};

export default layoutMixin;
