import { shallowMount } from '@vue/test-utils';

import Layout from '@/components/layout/Layout';
import Row from '@/components/layout/Row';

describe('Layout.vue', () => {
    it('renders', () => {
        let wrapper = shallowMount(Layout);

        expect(wrapper.is('div')).toBe(true);
        expect(wrapper.attributes('class')).toEqual('container-fluid');
    });

    it('renders rows', () => {
        let wrapper = shallowMount(Layout, {
            propsData: {
                layout: {
                    rows: [{ dummy: 'dummy' }, { foo: 'foo' }]
                }
            }
        });

        let rows = wrapper.findAll(Row);
        expect(rows.length).toBe(2);
        expect(rows.at(0).props().rowConfig).toEqual({ dummy: 'dummy' });
        expect(rows.at(1).props().rowConfig).toEqual({ foo: 'foo' });
    });
});
