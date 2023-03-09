import { expect, describe, beforeAll, beforeEach, afterAll, afterEach, it, vi } from 'vitest';
import { shallowMount, mount } from '@vue/test-utils';

import PopoverMessage from '@/components/ui/PopoverMessage.vue';
import Label from 'webapps-common/ui/components/forms/Label.vue';
import Button from 'webapps-common/ui/components/Button.vue';

vi.mock('~/webapps-common/util/copyText');

describe('PopoverMessage', () => {
    let wrapper;

    beforeAll(() => {
        wrapper = shallowMount(PopoverMessage, {
            props: {
                type: 'error',
                title: 'Test title',
                subtitle: 'Test subtitle',
                messageBody: 'Test message'
            }
        });
    });

    it('renders default', () => {
        expect(wrapper.findComponent(Label).exists()).toBe(true);
        expect(wrapper.findComponent(Label).props('text')).toEqual('Test title');
        expect(wrapper.text()).toContain('Test message');
    });

    it('emits close alert event', () => {
        wrapper = shallowMount(PopoverMessage, {
            props: {
                type: 'error',
                title: 'Test title',
                subtitle: 'Test subtitle',
                messageBody: 'Test message'
            }
        });
        wrapper.findComponent(Button).trigger('click');
        expect(wrapper.emitted('closeAlert'));
    });

    it('copies text', () => {
        const dispatchMock = vi.fn();
        wrapper = shallowMount(PopoverMessage, {
            props: {
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
            message: 'Text copied!',
            type: 'success',
            autoRemove: true
        }, { root: true });
    });

    it('minimizes error messages', () => {
        wrapper = mount(PopoverMessage, {
            props: {
                type: 'warn',
                title: 'Test title',
                subtitle: 'Test subtitle',
                messageBody: 'Validation timeout exceeded.'
            }
        });
        expect(wrapper.find('.minimize-button').exists()).toBe(false);
        wrapper = mount(PopoverMessage, {
            props: {
                type: 'error',
                title: 'Test title',
                subtitle: 'Test subtitle',
                messageBody: 'Validation timeout exceeded.'
            }
        });
        let minimizeButton = wrapper.find('.minimize-button');
        expect(minimizeButton.exists()).toBe(true);
        minimizeButton.trigger('click');
        expect(wrapper.emitted('closeAlert'));
        wrapper.setProps({ type: 'info' });
        minimizeButton = wrapper.find('.minimize-button');
        expect(minimizeButton.exists()).toBe(true);
        minimizeButton.trigger('click');
        expect(wrapper.emitted('closeAlert'));
    });

    it('handles non-expandable messages', () => {
        wrapper = mount(PopoverMessage, {
            props: {
                type: 'error',
                title: 'Test title',
                subtitle: 'Test subtitle',
                messageBody: 'Validation timeout exceeded.'
            }
        });
        expect(wrapper.vm.expanded).toBe(true);
        expect(wrapper.classes()).toContain('expanded');
        expect(wrapper.vm.expandable).toBe(false);
        expect(wrapper.classes()).not.toContain('expandable');
        expect(wrapper.find('.expand-button').exists()).toBe(false);
        expect(wrapper.find('.scrollable-message').isVisible()).toBe(true);
        expect(wrapper.find('.copy-button').isVisible()).toBe(true);
    });

    it('handles expandable messages', () => {
        wrapper = mount(PopoverMessage, {
            props: {
                type: 'error',
                title: 'Test title',
                subtitle: 'Test subtitle',
                messageBody: `Error in script
                Error: Example error without content
                    at eval (eval at <anonymous> (http://localhost:3000/knime/rest/v4/jobs/3cfb485f-b17c-4635-bee1-c39175bff07c/workflow/wizard/web-resources/org/knime/js/base/node/viz/generic/knime-generic-view-v3.js:94:21), <anonymous>:1:7)
                    at http://localhost:3000/knime/rest/v4/jobs/3cfb485f-b17c-4635-bee1-c39175bff07c/workflow/wizard/web-resources/org/knime/js/base/node/viz/generic/knime-generic-view-v3.js:94:21
                    at Object.execCb (http://localhost:3000/knime/rest/v4/jobs/3cfb485f-b17c-4635-bee1-c39175bff07c/workflow/wizard/web-resources/org/knime/core/require.js:5:12897)
                    at b.check (http://localhost:3000/knime/rest/v4/jobs/3cfb485f-b17c-4635-bee1-c39175bff07c/workflow/wizard/web-resources/org/knime/core/require.js:5:6633)
                    at b.enable (http://localhost:3000/knime/rest/v4/jobs/3cfb485f-b17c-4635-bee1-c39175bff07c/workflow/wizard/web-resources/org/knime/core/require.js:5:9381)
                    at b.init (http://localhost:3000/knime/rest/v4/jobs/3cfb485f-b17c-4635-bee1-c39175bff07c/workflow/wizard/web-resources/org/knime/core/require.js:5:5738)
                    at http://localhost:3000/knime/rest/v4/jobs/3cfb485f-b17c-4635-bee1-c39175bff07c/workflow/wizard/web-resources/org/knime/core/require.js:5:11262`
            }
        });

        expect(wrapper.find('.expand-button').exists()).toBe(true);
        expect(wrapper.vm.expandable).toBe(true);
        expect(wrapper.classes()).toContain('expandable');
        expect(wrapper.vm.expanded).toBe(false);
        expect(wrapper.classes()).not.toContain('expanded');
        expect(wrapper.find('.scrollable-message').isVisible()).toBe(false);
        expect(wrapper.find('.copy-button').isVisible()).toBe(false);

        wrapper.find('.expand-button').trigger('click');

        expect(wrapper.vm.expanded).toBe(true);
        expect(wrapper.classes()).toContain('expanded');
        expect(wrapper.find('.scrollable-message').isVisible()).toBe(true);
        expect(wrapper.find('.copy-button').isVisible()).toBe(true);

        wrapper.find('.expand-button').trigger('click');

        expect(wrapper.vm.expanded).toBe(false);
        expect(wrapper.classes()).not.toContain('expanded');
        expect(wrapper.find('.scrollable-message').isVisible()).toBe(false);
        expect(wrapper.find('.copy-button').isVisible()).toBe(false);
    });
});
