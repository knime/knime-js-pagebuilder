import { expect, describe, it } from 'vitest';
import overrideRequired from '@/util/overrideRequired';

describe('overrideRequired util', () => {
    it('overrides the `required` property if present in the webNodeConfig', () => {
        let testConfig = { viewRepresentation: { required: true } };
        expect(overrideRequired(testConfig).viewRepresentation.required).toBe(false);
        expect(testConfig.viewRepresentation.required).toBe(false);
    });

    it('handles configurations which do not have a `required` property', () => {
        let testConfig = { viewRepresentation: { something: '007' } };
        let testString = JSON.stringify(testConfig);
        expect(overrideRequired(testConfig)).toStrictEqual(testConfig);
        expect(JSON.stringify(testConfig)).toBe(testString);

        // different config type
        testConfig = { extensionConfig: { nodeId: '007' } };
        testString = JSON.stringify(testConfig);

        expect(overrideRequired(testConfig)).toStrictEqual(testConfig);
        expect(JSON.stringify(testConfig)).toBe(testString);

        // empty config
        testConfig = {};

        expect(overrideRequired(testConfig)).toStrictEqual(testConfig);
        expect(JSON.stringify(testConfig)).toBe('{}');
    });

    it('handles missing or null configs', () => {
        expect(overrideRequired(null)).toBeNull();
        expect(overrideRequired(expect.undefined)).toBeUndefined();
    });
});
