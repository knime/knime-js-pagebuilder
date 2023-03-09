import { expect, describe, beforeAll, beforeEach, afterAll, afterEach, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { IFrameKnimeServiceAdapter } from '@knime/ui-extension-service';

import UIExtIFrame from '@/components/views/UIExtIFrame.vue';
import { iFrameExtensionConfig } from '../../../assets/views/extensionConfig';

describe('UIExtIFrame.vue', () => {
    const extensionConfig = iFrameExtensionConfig;
    const { resourceInfo } = extensionConfig;

    let wrapper, knimeService;

    beforeAll(() => {
        knimeService = new IFrameKnimeServiceAdapter(extensionConfig, vi.fn());
        wrapper = shallowMount(UIExtIFrame, {
            props: { resourceLocation: resourceInfo.url },
            provide: { getKnimeService: () => knimeService }
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders html as iframes', () => {
        let iFrameWrapper = wrapper.find('iframe');
        expect(iFrameWrapper.exists()).toBeTruthy();
        expect(knimeService.iFrameWindow).toBe(iFrameWrapper.element.contentWindow);
        expect(iFrameWrapper.attributes('src')).toBe(resourceInfo.url);
    });

    it('destroys knime service before component destroy', () => {
        let destroySpy = vi.spyOn(knimeService, 'destroy');
        wrapper.destroy();
        expect(destroySpy).toHaveBeenCalled();
    });
});
