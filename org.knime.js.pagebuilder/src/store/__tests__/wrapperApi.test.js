import { expect, describe, afterAll, it, vi } from 'vitest';
import { createStore } from 'vuex';
import * as wrapperApiConfig from '@/store/wrapperApi';
import * as pagebuilderConfig from '@/store/pagebuilder';
import * as alertConfig from '@/store/alert';
import { iFrameExtensionConfig } from '@@/test/assets/views/extensionConfig';
import muteConsole from 'webapps-common/util/test-utils/muteConsole';

describe('wrapper API store', () => {
    const EMPTY = expect.undefined;
    const extensionConfig = iFrameExtensionConfig;

    afterAll(() => {
        vi.clearAllMocks();
        delete window.jsonrpc;
    });

    let getMockStore = ({
        wrapperApiMocks = {},
        pagebuilderMocks = {},
        alertMocks = {}
    } = {}) => {
        let store = createStore();
        store.registerModule('api', {
            actions: { ...wrapperApiConfig.actions, ...wrapperApiMocks },
            getters: wrapperApiConfig.getters
        });
        store.registerModule('pagebuilder', {
            ...pagebuilderConfig,
            actions: { ...pagebuilderConfig.actions, ...pagebuilderMocks }
        });
        store.registerModule('pagebuilder/alert', {
            ...alertConfig,
            actions: { ...alertConfig.actions, ...alertMocks }
        });
        return store;
    };

    describe('call service', () => {
        it('creates an RPC callService request', async () => {
            let singleRPC = vi.fn();
            let store = getMockStore({ wrapperApiMocks: { singleRPC } });
            let nodeService = 'NodeService.callNodeDataService';
            let serviceRequest = 'data';
            let requestParams = { value: 'newValue' };
            let serviceParams = { extensionConfig, nodeService, serviceRequest, requestParams };
            await store.dispatch('callService', serviceParams);
            expect(singleRPC).toHaveBeenCalledWith(expect.anything(), {
                rpcConfig: {
                    id: expect.any(Number),
                    jsonrpc: '2.0',
                    method: nodeService,
                    params: [
                        extensionConfig.projectId,
                        extensionConfig.workflowId,
                        extensionConfig.nodeId,
                        extensionConfig.extensionType,
                        serviceRequest,
                        requestParams
                    ]
                }
            });
        });

        it('updates RPC parameters based on service method called', async () => {
            let singleRPC = vi.fn();
            let store = getMockStore({ wrapperApiMocks: { singleRPC } });
            let nodeService = 'NodeService.updateDataPointSelection';
            let serviceRequest = 'ADD';
            let requestParams = ['1', '2', '3'];
            let serviceParams = { extensionConfig, nodeService, serviceRequest, requestParams };
            await store.dispatch('callService', serviceParams);
            expect(singleRPC).toHaveBeenCalledWith(expect.anything(), {
                rpcConfig: {
                    id: expect.any(Number),
                    jsonrpc: '2.0',
                    method: nodeService,
                    params: [
                        extensionConfig.projectId,
                        extensionConfig.workflowId,
                        extensionConfig.nodeId,
                        serviceRequest,
                        requestParams
                    ]
                }
            });
        });
    });

    describe('re-execution', () => {
        it('successfully dispatches nodeStateChange action', async () => {
            let singleRPC = vi.fn();
            let store = getMockStore({ wrapperApiMocks: { singleRPC } });
            let nodeService = 'NodeService.changeNodeStates';
            let action = 'execute';
            let rpcParams = { extensionConfig, action };
            await store.dispatch('changeNodeStates', rpcParams);
            expect(singleRPC).toHaveBeenCalledWith(expect.anything(), {
                rpcConfig: {
                    id: expect.any(Number),
                    jsonrpc: '2.0',
                    method: nodeService,
                    params: [
                        extensionConfig.projectId,
                        extensionConfig.workflowId,
                        [extensionConfig.nodeId],
                        action
                    ]
                }
            });
        });

        it('successfully dispatches re-execute action', async () => {
            let validResponse = { foo: true };
            let valueResponse = { foo: 1 };
            let getValidity = vi.fn().mockResolvedValue(validResponse);
            let getViewValues = vi.fn().mockResolvedValue(valueResponse);
            let showAlert = vi.fn().mockResolvedValue({});
            let pollRPC = vi.fn();
            let store = getMockStore({
                wrapperApiMocks: { pollRPC },
                pagebuilderMocks: { getViewValues, getValidity },
                alertMocks: { showAlert }
            });

            await store.dispatch('triggerReExecution', { nodeId: 'foo' });
            expect(getValidity).toHaveBeenCalled();
            expect(getViewValues).toHaveBeenCalled();
            expect(pollRPC).toHaveBeenCalledWith(expect.anything(), {
                callback: 'setPage',
                config: {
                    nodeId: 'foo',
                    rpcConfig: {
                        id: expect.any(Number),
                        jsonrpc: '2.0',
                        method: 'ReexecutionService.reexecutePage',
                        params: [
                            'foo',
                            { foo: '1' }
                        ]
                    }
                },
                pollAction: 'updatePage'
            });
            expect(showAlert).not.toHaveBeenCalled();
        });

        it('does not trigger re-execution if validation fails', async () => {
            let validResponse = new Error();
            let valueResponse = { foo: 1 };
            let getValidity = vi.fn().mockRejectedValue(validResponse);
            let getViewValues = vi.fn().mockResolvedValue(valueResponse);
            let showAlert = vi.fn().mockResolvedValue({});
            let pollRPC = vi.fn();
            let store = getMockStore({
                wrapperApiMocks: { pollRPC },
                pagebuilderMocks: { getViewValues, getValidity },
                alertMocks: { showAlert }
            });

            await store.dispatch('triggerReExecution', { nodeId: 'foo' });
            expect(getValidity).toHaveBeenCalled();
            expect(getViewValues).not.toHaveBeenCalled();
            expect(pollRPC).not.toHaveBeenCalled();
            expect(showAlert).toHaveBeenCalledWith(expect.anything(), {
                message: 'Client-side validation failed. Please check the page for errors.',
                nodeInfo: {
                    nodeName: 'triggerReExecution'
                }
            });
        });

        it('does not trigger re-execution if value retrieval fails', async () => {
            let validResponse = { foo: true };
            let valueResponse = new Error();
            let getValidity = vi.fn().mockResolvedValue(validResponse);
            let getViewValues = vi.fn().mockRejectedValue(valueResponse);
            let showAlert = vi.fn().mockResolvedValue({});
            let pollRPC = vi.fn();
            let store = getMockStore({
                wrapperApiMocks: { pollRPC },
                pagebuilderMocks: { getViewValues, getValidity },
                alertMocks: { showAlert }
            });

            await store.dispatch('triggerReExecution', { nodeId: 'foo' });
            expect(getValidity).toHaveBeenCalled();
            expect(getViewValues).toHaveBeenCalled();
            expect(pollRPC).not.toHaveBeenCalled();
            expect(showAlert).toHaveBeenCalledWith(expect.anything(), {
                message: 'Retrieving page values failed. Please check the page for errors.',
                nodeInfo: {
                    nodeName: 'triggerReExecution'
                }
            });
        });
    });

    describe('wizard actions', () => {
        it('updates page', async () => {
            let pollRPC = vi.fn();
            let store = getMockStore({
                wrapperApiMocks: { pollRPC }
            });

            await store.dispatch('updatePage', { nodeId: 'foo' });
            expect(pollRPC).toHaveBeenCalledWith(expect.anything(), {
                callback: 'setPage',
                config: {
                    nodeId: 'foo',
                    rpcConfig: {
                        id: expect.any(Number),
                        jsonrpc: '2.0',
                        method: 'ReexecutionService.getPage',
                        params: []
                    }
                },
                pollAction: 'updatePage'
            });
        });

        it('sets page', async () => {
            let setNodesReExecuting = vi.fn();
            let updatePage = vi.fn();
            let showAlert = vi.fn();
            let store = getMockStore({
                pagebuilderMocks: { setNodesReExecuting, updatePage },
                alertMocks: { showAlert }
            });

            let shouldPoll = await store.dispatch('setPage', {
                page: {
                    webNodes: {
                        foo: {}
                    },
                    resetNodes: ['foo'],
                    reexecutedNodes: []
                }
            });
            expect(shouldPoll).toStrictEqual({ shouldPoll: false });
            expect(updatePage).toHaveBeenCalledWith(expect.anything(), {
                nodeIds: ['foo'],
                page: {
                    resetNodes: ['foo'],
                    reexecutedNodes: [],
                    webNodes: { foo: {} }
                }
            });
            expect(setNodesReExecuting).toHaveBeenCalledWith(expect.anything(), []);
            expect(showAlert).not.toHaveBeenCalled();
        });

        it('updates reset nodes if no page', async () => {
            let setNodesReExecuting = vi.fn();
            let updatePage = vi.fn();
            let showAlert = vi.fn();
            let store = getMockStore({
                pagebuilderMocks: { setNodesReExecuting, updatePage },
                alertMocks: { showAlert }
            });

            let shouldPoll = await store.dispatch('setPage', {
                resetNodes: ['foo'],
                reexecutedNodes: []
            });
            expect(shouldPoll).toStrictEqual({ shouldPoll: true });
            expect(updatePage).not.toHaveBeenCalled();
            expect(setNodesReExecuting).toHaveBeenCalledWith(expect.anything(), ['foo']);
            expect(showAlert).not.toHaveBeenCalled();
        });

        it('updates reset nodes excluding finished nodes if no page', async () => {
            let setNodesReExecuting = vi.fn();
            let updatePage = vi.fn();
            let showAlert = vi.fn();
            let store = getMockStore({
                pagebuilderMocks: { setNodesReExecuting, updatePage },
                alertMocks: { showAlert }
            });

            let shouldPoll = await store.dispatch('setPage', {
                resetNodes: ['foo', 'bar'],
                reexecutedNodes: ['bar']
            });
            expect(shouldPoll).toStrictEqual({ shouldPoll: true });
            expect(updatePage).not.toHaveBeenCalled();
            expect(setNodesReExecuting).toHaveBeenCalledWith(expect.anything(), ['foo']);
            expect(showAlert).not.toHaveBeenCalled();
        });

        it('handles missing page and reset nodes', async () => {
            let setNodesReExecuting = vi.fn();
            let updatePage = vi.fn();
            let showAlert = vi.fn();
            let store = getMockStore({
                pagebuilderMocks: { setNodesReExecuting, updatePage },
                alertMocks: { showAlert }
            });

            let shouldPoll = await muteConsole(() => store.dispatch('setPage'));
            expect(shouldPoll).toStrictEqual({ shouldPoll: false });
            expect(updatePage).not.toHaveBeenCalled();
            expect(setNodesReExecuting).not.toHaveBeenCalled();
            expect(showAlert).toHaveBeenCalledWith(expect.anything(), {
                message: expect.any(Error), nodeInfo: { nodeName: 'setPage' }
            });
        });
    });

    describe('rpc', () => {
        it('returns error if no global RPC exists', async () => {
            let rpcConfig = {
                id: 0,
                jsonrpc: '2.0',
                method: 'ReexecutionService.getPage',
                params: []
            };
            let store = getMockStore();

            let res = await store.dispatch('singleRPC', { nodeId: 'foo', rpcConfig });
            expect(res).toStrictEqual({
                error: 'This functionality is not supported with the current browser. Please ensure the correct ' +
                    'browser is selected by going to ‘Preferences → KNIME → JavaScript Views’ and selecting the ' +
                    'option ‘Chromium Embedded Framework (CEF) Browser’.',
                result: EMPTY
            });
        });

        it('invokes a single RPC via action', async () => {
            let rpcConfig = {
                id: 0,
                jsonrpc: '2.0',
                method: 'ReexecutionService.getPage',
                params: []
            };
            let expected = { result: { foo: 2 } };
            let store = getMockStore();

            let jsonrpcMock = vi.fn().mockReturnValue(JSON.stringify(expected));
            window.jsonrpc = jsonrpcMock;
            let res = await store.dispatch('singleRPC', { nodeId: 'foo', rpcConfig });
            expect(jsonrpcMock).toHaveBeenCalledWith(JSON.stringify(rpcConfig));
            expect(res).toStrictEqual({ ...expected, error: EMPTY });

            delete window.jsonrpc;
            const sendMock = vi.fn().mockReturnValue(expected);
            window.EquoCommService = {
                send: sendMock
            };
            window.cefBrowserInstanceId = 1234;
            const res2 = await store.dispatch('singleRPC', { nodeId: 'foo', rpcConfig });
            expect(sendMock).toHaveBeenCalledWith('org.knime.js.cef.jsonrpc#1234', JSON.stringify(rpcConfig));
            expect(res2).toStrictEqual({ ...expected, error: EMPTY });
        });

        it('handles errors during RPC invocation', async () => {
            let rpcConfig = {
                id: 0,
                jsonrpc: '2.0',
                method: 'ReexecutionService.getPage',
                params: []
            };
            let expectedError = 'Test error';
            let rpcMock = vi.fn().mockImplementation(() => {
                throw new Error(expectedError);
            });
            let store = getMockStore();

            window.jsonrpc = rpcMock;
            let res = await store.dispatch('singleRPC', { nodeId: 'foo', rpcConfig });
            expect(rpcMock).toHaveBeenCalledWith(JSON.stringify(rpcConfig));
            expect(res).toStrictEqual({ error: expect.any(Error), result: EMPTY });
            expect(res.error.toString()).toContain(expectedError);

            delete window.jsonrpc;
            window.EquoCommService = {
                send: rpcMock
            };
            window.cefBrowserInstanceId = 1234;
            const res2 = await store.dispatch('singleRPC', { nodeId: 'foo', rpcConfig });
            expect(rpcMock).toHaveBeenCalledWith('org.knime.js.cef.jsonrpc#1234', JSON.stringify(rpcConfig));
            expect(res2).toStrictEqual({ error: expect.any(Error), result: EMPTY });
            expect(res2.error.toString()).toContain(expectedError);
        });

        it('handles RPC polling with resolution after single call', async () => {
            let config = {
                pollAction: 'updatePage',
                callback: 'setPage',
                config: {
                    nodeId: 'foo',
                    rpcConfig: {
                        id: 0,
                        jsonrpc: '2.0',
                        method: 'ReexecutionService.getPage',
                        params: []
                    }
                }
            };
            let expectedRes = { result: { page: { webNodes: { foo: 3 } } } };
            let rpcResponse = Promise.resolve(expectedRes);
            let singleRPC = vi.fn().mockReturnValue(rpcResponse);
            let setPage = vi.fn().mockReturnValue(false);
            let showAlert = vi.fn().mockReturnValue(Promise.resolve({}));
            let updatePage = vi.fn();
            let store = getMockStore({
                wrapperApiMocks: { singleRPC, setPage },
                alertMocks: { showAlert }
            });

            await store.dispatch('pollRPC', config);
            expect(singleRPC).toHaveBeenCalledWith(expect.anything(), config.config);
            expect(showAlert).not.toHaveBeenCalled();
            expect(setPage).toHaveBeenCalledWith(expect.anything(), expectedRes.result);
            expect(updatePage).not.toHaveBeenCalled();
        });

        it('handles RPC polling with resolution after multiple call', async () => {
            vi.useFakeTimers();
            let rpcConfig = {
                nodeId: 'foo',
                rpcConfig: {
                    id: 0,
                    jsonrpc: '2.0',
                    method: 'ReexecutionService.getPage',
                    params: []
                }
            };
            let config = {
                pollAction: 'updatePage',
                callback: 'setPage',
                config: rpcConfig
            };
            let expectedRes = { result: { page: { webNodes: { foo: 3 } } } };
            let rpcResponse = Promise.resolve(expectedRes);
            let singleRPC = vi.fn().mockReturnValue(rpcResponse);
            let setPage = vi.fn().mockReturnValueOnce({ shouldPoll: true })
                .mockReturnValueOnce({ shouldPoll: false });
            let showAlert = vi.fn().mockReturnValue(Promise.resolve({}));
            let store = getMockStore({
                wrapperApiMocks: { singleRPC, setPage },
                alertMocks: { showAlert }
            });
            let updatePageMock = vi.spyOn(store._actions.updatePage, '0');
            let pollRPCMock = vi.spyOn(store._actions.pollRPC, '0');

            await store.dispatch('pollRPC', config);

            expect(pollRPCMock).toHaveBeenCalledTimes(1);
            expect(singleRPC).toHaveBeenCalledTimes(1);
            expect(singleRPC).toHaveBeenCalledWith(expect.anything(), rpcConfig);
            expect(showAlert).not.toHaveBeenCalled();
            expect(setPage).toHaveBeenCalledWith(expect.anything(), expectedRes.result);
            expect(updatePageMock).not.toHaveBeenCalled();

            vi.runAllTimers();

            expect(pollRPCMock).toHaveBeenCalledTimes(2);
            expect(singleRPC).toHaveBeenCalledTimes(2);
            expect(singleRPC).toHaveBeenLastCalledWith(expect.anything(), {
                ...rpcConfig, rpcConfig: { ...rpcConfig.rpcConfig, id: expect.any(Number) }
            });
            expect(showAlert).not.toHaveBeenCalled();
            expect(setPage).toHaveBeenLastCalledWith(expect.anything(), expectedRes.result);
            expect(updatePageMock).toHaveBeenCalledWith(rpcConfig);

            vi.clearAllTimers();
        });

        it('handles errors during RPC polling', async () => {
            let config = {
                pollAction: 'updatePage',
                callback: 'setPage',
                config: {
                    nodeId: 'foo',
                    rpcConfig: {
                        id: 0,
                        jsonrpc: '2.0',
                        method: 'ReexecutionService.getPage',
                        params: []
                    }
                }
            };
            let expectedRes = { error: 'Something went wrong' };
            let rpcResponse = Promise.resolve(expectedRes);
            let singleRPC = vi.fn().mockReturnValue(rpcResponse);
            let setPage = vi.fn();
            let showAlert = vi.fn().mockReturnValue(Promise.resolve({}));
            let updatePage = vi.fn();
            let store = getMockStore({
                wrapperApiMocks: { singleRPC, setPage, updatePage },
                alertMocks: { showAlert }
            });

            await store.dispatch('pollRPC', config);
            expect(singleRPC).toHaveBeenCalledWith(expect.anything(), config.config);
            expect(setPage).not.toHaveBeenCalled();
            expect(updatePage).not.toHaveBeenCalled();
            expect(showAlert).toHaveBeenCalledWith(expect.anything(), {
                message: 'Something went wrong',
                nodeInfo: {
                    nodeName: 'ReexecutionService.getPage'
                }
            });
        });
    });

    describe('error handling', () => {
        it('shows pagebuilder alert messages', () => {
            let caller = 'testFn';
            let error = 'testError';
            let showAlert = vi.fn();
            let store = getMockStore({
                alertMocks: { showAlert }
            });

            muteConsole(() => store.dispatch('handleError', { caller, error }));
            expect(showAlert).toHaveBeenCalledWith(expect.anything(), {
                nodeInfo: {
                    nodeName: caller
                },
                message: error
            });
        });
    });

    describe('getters', () => {
        it('returns the correct resource location for UI Extensions', () => {
            const store = getMockStore();
            const baseUrl = 'baseUrl/';
            const path = 'path';
            expect(store.getters.uiExtResourceLocation({ resourceInfo: { baseUrl, path } })).toBe(baseUrl + path);

            const debugUrl = 'test-debug-url';
            expect(store.getters.uiExtResourceLocation({ resourceInfo: { debugUrl, baseUrl, path } })).toBe(debugUrl);
        });
    });
});
