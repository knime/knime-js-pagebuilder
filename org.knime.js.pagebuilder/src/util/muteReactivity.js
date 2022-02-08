/**
 * A utility function to manually dis-allow Vue/VueX reactivity on properties of objects. This may be desired for
 * either performance improvement or error prevention. A set of non-reactive keys can be provided explicitly to
 * control modification behavior *or* the default behavior will mark all keys as non-reactive. Additionally, a set
 * of keys to ignore (i.e. allow to receive reactive getters/setters) can be provided to further control the behavior.
 *
 * This utility expects the target to be a mutable Object, but will fail silently to allow use during mount/destroy
 * cycles.
 *
 * *NOTE:*  The utility must be called before reactive getters/setters are set (i.e. right after instantiation and
 *          before being set as a data/computed property or passed to a store).
 *
 * @param {Object} param
 * @param {Object} param.target - the target object with properties to modify for reactivity.
 * @param {[String]} param.nonReactiveKeys - an optional set of property keys to exclude from reactivity. Default will
 *      include all properties.
 * @param {[String]} param.reactiveKeys - an optional set of property keys on which allow reactivity. Default will be
 *      empty (i.e. block all reactivity).
 * @returns {void}
 */
export default ({ target, nonReactiveKeys, reactiveKeys = [] }) => {
    try {
        (nonReactiveKeys || Object.keys(target)).filter(key => !reactiveKeys.includes(key)).forEach(key => {
            Object.defineProperty(target, key, { configurable: false, writable: true });
        });
    } catch (e) {
        // Do nothing.
    }
};
