import muteReactivity from '~/src/util/muteReactivity';

describe('muteReactivity util', () => {
    it('sets all visible properties of an object as non-configurable', () => {
        let target = { key1: 'value1', key2: 'value2' };
        let targetDescriptors = Object.getOwnPropertyDescriptors(target);
        expect(targetDescriptors.key1.configurable).toBe(true);
        expect(targetDescriptors.key2.configurable).toBe(true);
        muteReactivity({ target });
        targetDescriptors = Object.getOwnPropertyDescriptors(target);
        expect(targetDescriptors.key1.configurable).toBe(false);
        expect(targetDescriptors.key2.configurable).toBe(false);
    });

    it('sets only included properties of an object as non-configurable', () => {
        let target = { key1: 'value1', key2: 'value2' };
        let targetDescriptors = Object.getOwnPropertyDescriptors(target);
        expect(targetDescriptors.key1.configurable).toBe(true);
        expect(targetDescriptors.key2.configurable).toBe(true);
        muteReactivity({ target, nonReactiveKeys: ['key1'] });
        targetDescriptors = Object.getOwnPropertyDescriptors(target);
        expect(targetDescriptors.key1.configurable).toBe(false);
        expect(targetDescriptors.key2.configurable).toBe(true);
    });

    it('skips explicitly defined reactive properties of an object', () => {
        let target = { key1: 'value1', key2: 'value2' };
        let targetDescriptors = Object.getOwnPropertyDescriptors(target);
        expect(targetDescriptors.key1.configurable).toBe(true);
        expect(targetDescriptors.key2.configurable).toBe(true);
        muteReactivity({ target, reactiveKeys: ['key1'] });
        targetDescriptors = Object.getOwnPropertyDescriptors(target);
        expect(targetDescriptors.key1.configurable).toBe(true);
        expect(targetDescriptors.key2.configurable).toBe(false);
    });

    it('handles null targets without failing', () => {
        let target = null;
        muteReactivity({ target });
        // code not reached if failure
        expect(true).toBe(true);
    });
});
