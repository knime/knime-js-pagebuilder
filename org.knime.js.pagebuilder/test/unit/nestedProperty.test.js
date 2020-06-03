/* eslint-disable no-magic-numbers */
import { getProp, setProp } from '../../src/util/nestedProperty';

describe('nestedProperty.js', () => {
    describe('getting nested properties', () => {
        let testObject = {
            prop1: {
                someValue: 12345
            },
            prop2: {
                someArray: [{
                    someValue: 67890
                }]
            }
        };

        it('retrieves nested object values', () => {
            let value = getProp(testObject, 'prop1.someValue');
            expect(value).toBe(12345);
        });

        it('retrieves nested values from arrays', () => {
            let value = getProp(testObject, 'prop2.someArray.0.someValue');
            expect(value).toBe(67890);
        });

        it('returns null for missing keys', () => {
            let value = getProp(testObject, 'prop2.someMissingValue.0.someValue');
            expect(value).toBe(null);
        });
    });

    describe('setting nested properties', () => {
        let createTestObject = () => ({
            prop1: {
                someValue: 12345
            },
            prop2: {
                someArray: [{
                    someValue: 67890
                }]
            }
        });

        it('sets nested object values', () => {
            let localTestObject = createTestObject();
            let newValue = 'aNewValue';
            expect(localTestObject.prop1.someValue).toBe(12345);
            setProp(localTestObject, 'prop1.someValue', newValue);
            expect(localTestObject.prop1.someValue).toBe(newValue);
        });

        it('sets nested object values in arrays', () => {
            let localTestObject = createTestObject();
            let newValue = 'aNewValue';
            expect(localTestObject.prop2.someArray[0].someValue).toBe(67890);
            setProp(localTestObject, 'prop2.someArray.0.someValue', newValue);
            expect(localTestObject.prop2.someArray[0].someValue).toBe(newValue);
        });

        it('fails setting values when an invalid key is provided', () => {
            let localTestObject = createTestObject();
            let newValue = 'aNewValue';
            expect(localTestObject.prop2.someArray[0].someValue).toBe(67890);
            try {
                setProp(localTestObject, 'prop2.someMissingValue.0.someValue', newValue);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe('Provided key does not exist!');
                expect(localTestObject.prop2.someArray[0].someValue).toBe(67890);
            }
        });
    });
});
