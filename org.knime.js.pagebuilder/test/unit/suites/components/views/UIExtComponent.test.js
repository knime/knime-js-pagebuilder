import { expect, describe, beforeAll, beforeEach, afterAll, afterEach, it, vi } from 'vitest';
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import { KnimeService } from '@knime/ui-extension-service';
import * as loadingModule from '@/util/loadComponentLibrary';
import { componentExtensionConfig } from '../../../assets/views/extensionConfig';

import UIExtComponent from '@/components/views/UIExtComponent.vue';

describe('UIExtComponent.vue', () => {
    const extensionConfig = componentExtensionConfig;
    const { resourceInfo } = extensionConfig;
    const context = {
        props: { resourceLocation: resourceInfo.url },
        provide: { getKnimeService: () => new KnimeService(extensionConfig, vi.fn()) }
    };
    const mockComponentId = resourceInfo.id;
    const mockComponent = Vue.component(mockComponentId, {
        template: '<div/>'
    });

    afterEach(() => {
        vi.clearAllMocks();
        delete window[mockComponentId];
    });

    it('renders ui extensions as Vue components', async () => {
        window[mockComponentId] = mockComponent;
        let wrapper = await shallowMount(UIExtComponent, context);
        expect(wrapper.findComponent(UIExtComponent).exists()).toBeTruthy();
        expect(wrapper.find(mockComponent).exists()).toBeTruthy();
    });

    it('skips loading a component library which is already loaded', async () => {
        window[mockComponentId] = mockComponent;
        let loadComponentSpy = vi.spyOn(loadingModule, 'loadComponentLibrary');

        let wrapper = await shallowMount(UIExtComponent, {
            ...context,
            mocks: {
                loadComponentLibrary: loadComponentSpy
            }
        });
        expect(loadComponentSpy).not.toHaveBeenCalled();
        expect(wrapper.vm.$options.components[mockComponentId].name).toBe(mockComponentId);
        expect(wrapper.vm.componentLoaded).toBe(true);
    });

    it('loads a component library if not already loaded', async () => {
        let loadComponentSpy = vi.spyOn(loadingModule, 'loadComponentLibrary')
            .mockImplementation((win, resourceLocation, componentId) => {
                win[componentId] = mockComponent;
                return mockComponent;
            });
        let wrapper = await shallowMount(UIExtComponent, {
            ...context,
            mocks: {
                loadComponentLibrary: loadComponentSpy
            }
        });
        expect(loadComponentSpy).toHaveBeenCalledWith(window, extensionConfig.resourceInfo.url, mockComponentId);
        expect(wrapper.vm.$options.components[mockComponentId].name).toBe(mockComponentId);
        expect(wrapper.vm.componentLoaded).toBe(true);
    });
});
