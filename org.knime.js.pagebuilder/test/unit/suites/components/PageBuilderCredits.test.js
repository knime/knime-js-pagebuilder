import { expect, describe, beforeAll, beforeEach, afterAll, it, vi } from 'vitest';
import PageBuilderCredits from '~/src/components/PageBuilderCredits';
import packages from 'webapps-common/buildtools/opensourcecredits/used-packages.json';

describe('PageBuilderCredits.vue', () => {
    it('has packages', () => {
        expect(PageBuilderCredits.packages).toStrictEqual(packages);
    });
});

