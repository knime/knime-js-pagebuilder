import { expect, describe, beforeAll, afterEach, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { IFrameKnimeServiceAdapter } from '@knime/ui-extension-service';

import UIExtIFrame from '@/components/views/UIExtIFrame.vue';
import { iFrameExtensionConfig } from '../../../../test/unit/assets/views/extensionConfig';

describe('UIExtIFrame.vue', () => {
    const extensionConfig = iFrameExtensionConfig;
    const { resourceInfo } = extensionConfig;

    let wrapper, knimeService;

    beforeAll(() => {
        knimeService = new IFrameKnimeServiceAdapter(extensionConfig, vi.fn());
        wrapper = shallowMount(UIExtIFrame, {
            props: { resourceLocation: resourceInfo.url },
            global: {
                provide: { getKnimeService: () => knimeService }
            }
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

    it('unmounts knime service before component unmount', () => {
        let destroySpy = vi.spyOn(knimeService, 'destroy');
        wrapper.unmount();
        expect(destroySpy).toHaveBeenCalled();
    });
});
