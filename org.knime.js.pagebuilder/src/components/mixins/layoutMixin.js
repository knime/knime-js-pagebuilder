const layoutMixin = {
    computed: {
        resizeMethod() {
            return this.viewConfig.resizeMethod || '';
        },
        layoutClasses() {
            let classes = [];
            classes.push('reporting-replaceable');
            // add aspect ratio sizing classes;
            if (this.resizeMethod.startsWith('aspectRatio')) {
                classes.push(this.resizeMethod);
            } else if (this.resizeMethod.startsWith('view')) {
                classes.push('fill-container');
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
            if (this.resizeMethod.startsWith('viewLowestElement') && (this.isWidget || this.extensionConfig)) {
                let { maxHeight = null, maxWidth = null, minHeight = null, minWidth = null } = this.viewConfig;
                if (maxHeight !== null) {
                    style.push(`max-height:${maxHeight}px`);
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
            return style.join(';').replace(/;;/g, ';');
        }
    }
};

export default layoutMixin;
