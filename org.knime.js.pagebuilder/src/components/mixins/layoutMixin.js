const layoutMixin = {
    computed: {
        resizeMethod() {
            return this.viewConfig.resizeMethod || '';
        },
        layoutClasses() {
            let classes = [];
            // add aspect ratio sizing classes;
            if (this.resizeMethod.startsWith('aspectRatio')) {
                classes.push(this.resizeMethod);
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
            if (this.resizeMethod.startsWith('viewLowestElement')) {
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
}

export default layoutMixin;