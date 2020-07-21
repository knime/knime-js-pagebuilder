import { shallowMount, mount } from '@vue/test-utils';

import PopoverMessage from '~/src/components/layout/PopoverMessage';
import Label from '~/webapps-common/ui/components/forms/Label';
import Button from '~/webapps-common/ui/components/Button';

jest.mock('~/webapps-common/util/copyText');

describe('PopoverMessage', () => {
    let wrapper;
    beforeAll(() => {
        wrapper = shallowMount(PopoverMessage, {
            propsData: {
                type: 'error',
                title: 'Test title',
                subtitle: 'Test subtitle',
                messageBody: 'Test message'
            }
        });
    });

    it('renders default', () => {
        expect(wrapper.find(Label).exists()).toBe(true);
        expect(wrapper.find(Label).props('text')).toEqual('Test title');
        expect(wrapper.text()).toContain('Test message');
    });

    it('emits close alert event', () => {
        wrapper = shallowMount(PopoverMessage, {
            propsData: {
                type: 'error',
                title: 'Test title',
                subtitle: 'Test subtitle',
                messageBody: 'Test message'
            }
        });
        wrapper.find(Button).trigger('click');
        expect(wrapper.emitted('closeAlert'));
    });

    it('expands message',  () => {
        wrapper = mount(PopoverMessage, {
            propsData: {
                type: 'error',
                title: 'Test title',
                subtitle: 'Test subtitle',
                messageBody: 'Test message'
            }
        });
        expect(wrapper.vm.messageExpanded).toBe(false);
        wrapper.find('.expand-button').trigger('click');
        expect(wrapper.vm.messageExpanded).toBe(true);
    });

    it('copies text', () => {
        const dispatchMock = jest.fn();
        wrapper = shallowMount(PopoverMessage, {
            propsData: {
                type: 'error',
                title: 'Test title',
                subtitle: 'Test subtitle',
                messageBody: 'Test message'
            },
            mocks: {
                $store: {
                    dispatch: dispatchMock
                }
            }
        });
        wrapper.vm.copyText();
        expect(dispatchMock).toHaveBeenCalledWith('notification/show', {
            notification: {
                message: 'Text copied!',
                type: 'success',
                autoRemove: true
            }
        });
    });
});
