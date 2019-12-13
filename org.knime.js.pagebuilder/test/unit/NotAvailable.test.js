import NotAvailable from '~/src/components/layout/NotAvailable';
import { shallowMount } from '@vue/test-utils';
import Label from '~/src/components/widgets/baseElements/text/Label';

describe('NotAvailable.vue', () => {
    let wrapper;
    beforeAll(() => {
        wrapper = shallowMount(NotAvailable);
    });

    it('renders default', () => {
        expect(wrapper.find(Label).props('text')).toEqual('Missing Node()');
        expect(wrapper.find('p').text()).toContain('No further information on the node available');
    });

    it('renders error message', () => {
        wrapper = shallowMount(NotAvailable, {
            propsData: { nodeInfo: {
                nodeName: 'testName',
                nodeErrorMessage: 'test_error'
            } }
        });
        expect(wrapper.find('p').text()).toContain('test_error');
    });

    it('renders warn message', () => {
        wrapper = shallowMount(NotAvailable, {
            propsData: { nodeInfo: {
                nodeName: 'testName',
                nodeWarnMessage: 'test_warning'
            } }
        });
        expect(wrapper.find('p').text()).toContain('test_warning');
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
        expect(wrapper.find(Label).props('text')).toEqual('testName(10.0.2) - test_annotation');
    });
});

