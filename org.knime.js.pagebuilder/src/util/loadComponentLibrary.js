/**
 * Utility to dynamically load remote resources and register them to a global namespace.
 * Compatible resource locations should serve an IIFE which returns the library which should
 * be registered. A valid example is a Vue component built with vue-cli as a stand-alone
 * library (@see https://cli.vuejs.org/guide/build-targets.html#library).
 *
 * @param {Window} window - the window context where the resource should be loaded.
 * @param {string} resourceLocation - the URI of the library resource.
 * @param {string} componentName - the namespace for registering the component.
 * @returns {Promise<null>}
 */
export const loadComponentLibrary = async (window, resourceLocation, componentName) => {
    if (window[componentName]) {
        return Promise.resolve();
    }
    
    // Load and mount component library
    await new Promise((resolve, reject) => {
        const script = window.document.createElement('script');
        script.async = true;
        script.addEventListener('load', () => {
            resolve(script);
        });
        script.addEventListener('error', () => {
            reject(new Error(`Script loading of "${resourceLocation}" failed`));
            window.document.head.removeChild(script);
        });
        script.src = resourceLocation;
        window.document.head.appendChild(script);
    });
    // Lib build defines component on `window` using the name defined during build.
    // This name should match the componentId (this.extensionConfig.resourceInfo.id).
    let Component = window[componentName];
    if (!Component) {
        throw new Error(`Component loading failed. Script invalid.`);
    }
    return Promise.resolve();
};
