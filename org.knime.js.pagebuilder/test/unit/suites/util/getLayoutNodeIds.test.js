import { expect, describe, beforeAll, beforeEach, afterAll, afterEach, it, vi } from 'vitest';
import getLayoutNodeIds from '@/util/getLayoutNodeIds';

describe('getLayoutNodeIds util', () => {
    let getPageFromRows = rows => ({ wizardPageContent: { webNodePageConfiguration: { layout: { rows } } } });

    it('returns no nodeIds if the page is missing a valid layout', () => {
        let testCases = [
            getLayoutNodeIds(),
            getLayoutNodeIds({}),
            getLayoutNodeIds({ wizardPageContent: null }),
            getLayoutNodeIds({ wizardPageContent: {} }),
            getLayoutNodeIds({ wizardPageContent: { webNodePageConfiguration: null } }),
            getLayoutNodeIds({ wizardPageContent: { webNodePageConfiguration: {} } }),
            getLayoutNodeIds({ wizardPageContent: { webNodePageConfiguration: { layout: null } } }),
            getLayoutNodeIds({ wizardPageContent: { webNodePageConfiguration: { layout: {} } } }),
            getLayoutNodeIds({ wizardPageContent: { webNodePageConfiguration: { layout: { rows: null } } } }),
            getLayoutNodeIds({ wizardPageContent: { webNodePageConfiguration: { layout: { rows: [] } } } })
        ];
        testCases.forEach(outcome => expect(outcome).toStrictEqual([]));
    });

    it('returns nodeIds from content in a page layout', () => {
        let layoutNodeIds = getLayoutNodeIds(getPageFromRows([
            {
                columns: [{
                    content: [
                        { nodeID: '1' },
                        { nodeID: '2' }
                    ]
                },
                {
                    content: [
                        { type: 'JSONLayoutHTMLContent' }
                    ]
                }]
            },
            {
                columns: [{
                    content: [
                        { nodeID: '3' },
                        { nodeID: '4' }
                    ]
                },
                {
                    content: [
                        { type: 'html' }
                    ]
                }]
            }
        ]));
        expect(layoutNodeIds).toStrictEqual(['1', '2', '3', '4']);
    });

    it('returns nodeIds from nested content in a page layout', () => {
        let layoutNodeIds = getLayoutNodeIds(getPageFromRows([
            {
                columns: [{
                    content: [
                        { nodeID: '1' },
                        { nodeID: '2' },
                        {
                            type: 'JSONLayoutRow',
                            columns: [{ content: [{ nodeID: '3' }] }]
                        }
                    ]
                }]
            },
            {
                columns: [{
                    content: [
                        {
                            type: 'row',
                            columns: [{
                                content: [{
                                    type: 'row',
                                    columns: [{ content: [{ nodeID: '4' }] }]
                                }]
                            }]
                        }
                    ]
                }]
            }
        ]));
        expect(layoutNodeIds).toStrictEqual(['1', '2', '3', '4']);
    });

    it('returns nodeIds from nested layouts in a page layout', () => {
        let layoutNodeIds = getLayoutNodeIds(getPageFromRows([
            {
                columns: [{
                    content: [
                        {
                            type: 'nestedLayout',
                            layout: {
                                rows: [{
                                    columns: [
                                        { content: [{ nodeID: '5' }] },
                                        {
                                            content: [
                                                {
                                                    type: 'JSONLayoutHTMLContent',
                                                    layout: {
                                                        rows: [{
                                                            columns: [{
                                                                content: [
                                                                    { nodeID: '6' }
                                                                ]
                                                            }]
                                                        }]
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }]
                            }
                        }
                    ]
                }]
            }
        ]));
        expect(layoutNodeIds).toStrictEqual(['5', '6']);
    });
});
