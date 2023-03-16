import { expect, describe, afterEach, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { shallowMount, mount } from '@vue/test-utils';
import { KnimeService } from '@knime/ui-extension-service';
import * as loadingModule from 'webapps-common/ui/util/loadComponentLibrary';
import { componentExtensionConfig } from '../../../../test/unit/assets/views/extensionConfig';

import UIExtComponent from '@/components/views/UIExtComponent.vue';

describe('UIExtComponent.vue', () => {
    const extensionConfig = componentExtensionConfig;
    const { resourceInfo } = extensionConfig;
    const context = {
        props: { resourceLocation: resourceInfo.url },
        global: {
            provide: { getKnimeService: () => new KnimeService(extensionConfig, vi.fn()) }
        }
    };
    const mockComponentId = resourceInfo.id;
    const mockComponent = defineComponent({
        name: mockComponentId,
        template: '<div/>'
    });

    afterEach(() => {
        vi.clearAllMocks();
        delete window[mockComponentId];
    });

    // TODO: Check if this test is still necessary with vue3
    it.skip('renders ui extensions as Vue components', () => {
        window[mockComponentId] = mockComponent;
        let wrapper = shallowMount(UIExtComponent, context);
        expect(wrapper.findComponent(UIExtComponent).exists()).toBeTruthy();
        expect(wrapper.findComponent(mockComponent).exists()).toBeTruthy();
    });

    // TODO: Check if this test is still necessary with vue3
    it.skip('skips loading a component library which is already loaded', () => {
        window[mockComponentId] = mockComponent;
        let loadComponentSpy = vi.spyOn(loadingModule, 'loadComponentLibrary');

        let wrapper = shallowMount(UIExtComponent, context);
        expect(loadComponentSpy).not.toHaveBeenCalled();
        expect(wrapper.vm.$options.components[mockComponentId].name).toBe(mockComponentId);
        expect(wrapper.vm.componentLoaded).toBe(true);
    });

    it('loads a component library', () => {
        let loadComponentSpy = vi.spyOn(loadingModule, 'loadAsyncComponent').mockReturnValue(mockComponent);
        let wrapper = mount(UIExtComponent, context);
        expect(loadComponentSpy).toHaveBeenCalledWith({
            resourceLocation: extensionConfig.resourceInfo.url, componentName: mockComponentId
        });
        expect(wrapper.vm.$options.components[mockComponentId].name).toBe(mockComponentId);
        expect(wrapper.findComponent(mockComponent).exists()).toBeTruthy();
    });
});
