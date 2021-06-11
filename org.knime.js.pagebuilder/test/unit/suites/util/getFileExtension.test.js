/* eslint-disable no-magic-numbers */
import getFileExtension from '@/util/getFileExtension';

describe('getFileExtension.js', () => {
    it('extracts file extensions', () => {
        const file = 'file.txt';
        const path = '/Path/to/file.txt';
        const windowsPath = '\\Special\\windows\\path\\to\\file.txt';
        const longFileExtension = 'hello.fooBarFoobarTestExt';
        const shortFileExtension = 'hello.a';

        expect(getFileExtension(file)).toEqual('txt');
        expect(getFileExtension(path)).toEqual('txt');
        expect(getFileExtension(windowsPath)).toEqual('txt');
        expect(getFileExtension(longFileExtension)).toEqual('fooBarFoobarTestExt');
        expect(getFileExtension(shortFileExtension)).toEqual('a');
    });

    it('handles invalid parameters', () => {
        const empty = '';
        const nullFile = null;
        const numberFile = 10;
        const booleanFile = false;

        expect(getFileExtension(empty)).toEqual('');
        expect(getFileExtension(nullFile)).toEqual('');
        expect(getFileExtension(numberFile)).toEqual('');
        expect(getFileExtension(booleanFile)).toEqual('');
        expect(getFileExtension(undefined)).toEqual('');
    });
});
