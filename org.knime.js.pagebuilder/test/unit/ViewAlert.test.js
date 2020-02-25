import ViewAlert from '~/src/components/layout/ViewAlert';
import { shallowMount } from '@vue/test-utils';
import Label from '~/webapps-common/ui/components/forms/Label';
import Button from '~/webapps-common/ui/components/Button';

describe('ViewAlert.vue', () => {
    let wrapper;
    beforeAll(() => {
        wrapper = shallowMount(ViewAlert, {
            propsData: {
                nodeInfo: {},
                nodeId: '0:0:0'
            }
        });
    });

    it('renders default', () => {
        expect(wrapper.find(Label).exists()).toBe(false);
        wrapper.setProps({ active: true });
        expect(wrapper.find(Label).exists()).toBe(true);
        expect(wrapper.find(Label).props('text')).toEqual('WARNING: Missing node');
        expect(wrapper.text()).toContain('No further information available');
    });

    it('renders message', () => {
        wrapper = shallowMount(ViewAlert, {
            propsData: {
                nodeInfo: {
                    nodeName: 'String Splitter'
                },
                nodeId: '0:0:0',
                active: true,
                type: 'error',
                message: 'No string to split'
            }
        });
        expect(wrapper.find(Label).exists()).toBe(true);
        expect(wrapper.find(Label).props('text')).toEqual('ERROR: String Splitter');
        expect(wrapper.text()).toContain('No string to split');
    });

    it('emits close event', () => {
        wrapper = shallowMount(ViewAlert, {
            propsData: {
                nodeInfo: {
                    nodeName: 'String Splitter'
                },
                nodeId: '0:0:0',
                active: true,
                type: 'error',
                message: 'No string to split'
            }
        });
        expect(wrapper.find(Label).exists()).toBe(true);
        wrapper.find(Button).trigger('click');
        expect(wrapper.emitted('closeAlert'));
    });
});

