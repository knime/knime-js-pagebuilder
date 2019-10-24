/**
 * Utility function to apply custom inline styles from to the elements within the
 * provided parent element.
 *
 * @param  {Element} parentEl - the top level parent from which to apply css styles.
 * @param  {String} customCss - the css string to apply to child elements.
 * @returns {Error[]} warnings - the warnings generated during the application of styles.
 */
export const applyCustomCss = (parentEl, customCss) => {
    let warnings = [];
    if (parentEl && customCss) {
        try {
            // separate css blocks by their closing tag
            let rules  = customCss.trim().split('}').map(str => {
                // separate a set of styles from the selector(s)
                let singleRule = str.split('{');
                if (singleRule.length === 2) {
                    let rule = {};
                    try {
                        // store the selectors as the key and the styles as the value
                        rule[singleRule[0].replace(';', '').trim()] = singleRule[1].trim();
                    } catch (e) {
                        consola.error(`Custom CSS application error: `, e);
                        warnings.push(e);
                    }
                    return rule;
                }
            });
            rules.forEach(rulePair => {
                if (rulePair) {
                    Object.entries(rulePair).forEach(rule => {
                        try {
                            // separate multiple selectors if they exist
                            rule[0].split(',').forEach(selector => {
                                // for each selector, access the elements and apply style
                                parentEl.querySelectorAll(`:scope ${selector.trim()}`).forEach(childEl => {
                                    childEl.style.cssText += rule[1];
                                });
                            });
                        } catch (e) {
                            consola.error(`Custom CSS application error: `, e);
                            warnings.push(e);
                        }
                    });
                }
            });
        } catch (e) {
            consola.error(`Custom CSS application error: `, e);
            warnings.push(Error('Something went wrong while parsing the custom CSS provided'));
        }
    }
    // return any generated errors
    return warnings;
};
