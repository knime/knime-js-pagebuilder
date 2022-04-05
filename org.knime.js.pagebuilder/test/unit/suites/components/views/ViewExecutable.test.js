import { shallowMount } from '@vue/test-utils';

import ViewExecutable from '@/components/views/ViewExecutable';
import Button from '~/webapps-common/ui/components/Button';

describe('ViewExecutable.vue', () => {
    it('renders', () => {
        const wrapper = shallowMount(ViewExecutable);
        expect(wrapper.exists()).toBeTruthy();
        const executeButton = wrapper.find(Button);
        expect(executeButton.exists()).toBeTruthy();
        expect(executeButton.vm.$el.attributes.disabled).toBeTruthy();
    });
});
