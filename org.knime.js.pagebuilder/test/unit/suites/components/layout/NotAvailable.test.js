import NotAvailable from '~/src/components/layout/NotAvailable';
import { shallowMount } from '@vue/test-utils';
import Label from '~/webapps-common/ui/components/forms/Label';

describe('NotAvailable.vue', () => {
    let wrapper;
    beforeAll(() => {
        wrapper = shallowMount(NotAvailable);
    });

    it('renders default', () => {
        expect(wrapper.find(Label).props('text')).toEqual('Missing node () can’t be displayed');
        expect(wrapper.find('span').text()).toContain('No further information available');
    });

    it('renders error message', () => {
        wrapper = shallowMount(NotAvailable, {
            propsData: { nodeInfo: {
                nodeName: 'testName',
                nodeErrorMessage: 'test_error'
            } }
        });
        expect(wrapper.find('span').text()).toContain('test_error');
    });

    it('renders warn message', () => {
        wrapper = shallowMount(NotAvailable, {
            propsData: { nodeInfo: {
                nodeName: 'testName',
                nodeWarnMessage: 'test_warning'
            } }
        });
        expect(wrapper.find('span').text()).toContain('test_warning');
    });

    it('renders annotation', () => {
        wrapper = shallowMount(NotAvailable, {
            propsData: {
                nodeInfo: {
                    nodeName: 'testName',
                    nodeAnnotation: 'test_annotation',
                    nodeErrorMessage: 'test_error'
                },
                nodeId: '10.0.2'
            }
        });
        expect(wrapper.find(Label).props('text')).toEqual('testName - test_annotation (10.0.2) can’t be displayed');
    });

    it('hides content via prop from parent', () => {
        wrapper.setProps({ showError: false });
        expect(wrapper.find(Label).exists()).toBe(false);
        expect(wrapper.find('span').exists()).toBe(false);
    });
});

