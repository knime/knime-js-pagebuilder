import { toValue } from "vue";

import { sleep } from "@knime/utils";

import { setProp } from "../util/nestedProperty";
import overrideRequired from "../util/overrideRequired";
import { generateReportLayout } from "../util/reporting";

export const namespaced = true;

export const state = () => ({
  page: null,
  isDialogLayout: false,
  isViewLayout: false,
  isReporting: false,
  generatedReportActionId: null,
  resourceBaseUrl: "",
  webNodesLoading: [],
  pageValueGetters: {},
  pageValidators: {},
  pageValidationErrorSetters: {},
  nodesReExecuting: [],
  reExecutionUpdates: 0,

  reportingContent: {},
  imageGenerationWaiting: [],

  trackDirtyState: false,
  cleanViewValuesState: {},

  disableWidgets: false,
});

const isViewLayout = (pageContent) => {
  const { nodeViews = {} } = pageContent || {};
  const nodeTypes = Object.keys(nodeViews).map(
    (key) => nodeViews[key].extensionType,
  );
  return !nodeTypes.includes("dialog");
};

export const generateUniqueStringFromViewValue = (viewValue) => {
  const sortKeysRecursive = (obj) => {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sortKeysRecursive);
    }

    return Object.keys(obj)
      .sort(String.localeCompare)
      .reduce((sorted, key) => {
        sorted[key] = sortKeysRecursive(obj[key]);
        return sorted;
      }, {});
  };

  return JSON.stringify(sortKeysRecursive(viewValue));
};

export const mutations = {
  /**
   * Set page.
   *
   * @param {*} state automatically supplied by vuex
   * @param {*} page new page object
   * @return {undefined}
   */
  setPage(state, page) {
    state.page = page;
    state.reportingContent = {};
    state.imageGenerationWaiting = [];
    const webNodes = page?.wizardPageContent?.webNodes;
    if (typeof webNodes === "object") {
      state.pageValidators = {};
      state.pageValueGetters = {};
    }
    state.isDialogLayout = Boolean(page?.wizardPageContent?.nodeViews?.DIALOG);
    state.generatedReportActionId =
      page?.wizardPageContent?.webNodePageConfiguration?.generatedReportActionId;
    state.isReporting = Boolean(state.generatedReportActionId);
    state.isViewLayout =
      isViewLayout(page?.wizardPageContent) &&
      !state.isReporting &&
      !window.headless;
    if (page?.disableWidgets) {
      state.disableWidgets = page.disableWidgets;
    }
  },
  /**
   * Set base URL for any external libraries or resources served to the views.
   *
   * @param {*} storeState automatically supplied by vuex
   * @param {String} resourceBaseUrl the base URL from which resources are served
   * @return {undefined}
   */
  setResourceBaseUrl(storeState, resourceBaseUrl) {
    storeState.resourceBaseUrl = resourceBaseUrl;
  },

  /**
   * @typedef UpdateValuePath - the period-separated, stringified key path to the value in the page configuration
   *      for which an Update should be applied.
   * @type {String}
   *
   *      @example: 'path.to.value' refers to the 'value' property of the following object, 'page':
   *      let page = {
   *          path: {
   *              to: {
   *                  value: ...
   *              }
   *          }
   *      };
   */
  /**
   * An update event dispatched by an individual {@see NodeView }. The update event can either provide a new value
   * (i.e. the resulting updated state of a form component from user interaction) or indicated a request for a forced
   * update (i.e. from a reactive event).
   *
   * @param {*} state - Vuex state.
   * @param {Object} param - update event object.
   * @param {String} param.nodeId - the nodeID from the workflow which is used to serialize the node
   *      in the store.
   * @param {Object.<UpdateValuePath, Object>} [param.update] - the optional update to apply to the page state.
   *      The property referenced by the provided {@type UpdateValuePath} will be set to the provided value
   *      {@type Object}. If no update is provided, the event is considered reactive and the existing configuration
   *      will used to force a Vuex reactive update.
   * @param {String} param.viewType - 'webNodes' for wizardNodeViews (default) or 'nodeViews' for ui-extensions.
   * @return {undefined}
   */
  updateViewConfig(
    state,
    { nodeId, update, config, type, viewType = "webNodes" } = {},
  ) {
    if (type === "uiExtension") {
      return;
    }
    // Update viewValues and other nested properties.
    if (update) {
      let currentWebNode = state.page.wizardPageContent[viewType][nodeId];
      for (let [key, value] of Object.entries(update)) {
        try {
          setProp(currentWebNode, key, value);
        } catch (e) {
          // catch deep Object modification errors
          consola.error(
            `WebNode[type: ${type}, id: ${nodeId}]: Value not updated ` +
              "because the provided key was invalid. Key:",
            key,
          );
        }
      }
      return;
    }
    // Otherwise, replace webNodes entirely
    consola.debug("pagebuilder/updateWebNode replacing web node content.");
    // TODO WEBP-327 Remove `overrideRequired` if dialog option added.
    state.page.wizardPageContent[viewType][nodeId] = overrideRequired(config);
  },

  setWebNodeLoading(state, { nodeId, loading }) {
    let index = state.webNodesLoading.indexOf(nodeId);
    if (index === -1 && loading) {
      // add nodeId to list of loading views if not already present
      state.webNodesLoading.push(nodeId);
    } else if (index >= 0 && !loading) {
      // remove nodeId from list of loading views if present
      state.webNodesLoading.splice(index, 1);
    }
  },

  addValueGetter(state, { nodeId, valueGetter }) {
    state.pageValueGetters[nodeId] = valueGetter;
  },

  removeValueGetter(state, nodeId) {
    delete state.pageValueGetters[nodeId];
  },

  addValidator(state, { nodeId, validator }) {
    state.pageValidators[nodeId] = validator;
  },

  removeValidator(state, nodeId) {
    delete state.pageValidators[nodeId];
  },

  addValidationErrorSetter(state, { nodeId, errorSetter }) {
    state.pageValidationErrorSetters[nodeId] = errorSetter;
  },

  removeValidationErrorSetter(state, nodeId) {
    delete state.pageValidationErrorSetters[nodeId];
  },

  setNodesReExecuting(state, nodesReExecuting) {
    if (nodesReExecuting === true) {
      // explicitly handle true to set as all nodes
      nodesReExecuting = Object.keys(
        state.page?.wizardPageContent?.webNodes || {},
      );
    } else if (!nodesReExecuting?.length) {
      // check for null or missing parameters
      nodesReExecuting = [];
    }
    let lenInEq = nodesReExecuting.length !== state.nodesReExecuting.length;
    let contentInEq = nodesReExecuting.some(
      (nodeId) => state.nodesReExecuting.indexOf(nodeId) < 0,
    );
    // Prevent unnecessary updates
    if (lenInEq || contentInEq) {
      state.nodesReExecuting = nodesReExecuting;
    }
    state.reExecutionUpdates = nodesReExecuting?.length
      ? state.reExecutionUpdates + 1
      : 0;
  },

  setReportingContent(state, { nodeId, reportingContent }) {
    state.reportingContent[nodeId] = reportingContent;
  },
  // TODO rethink renaming
  addImageGenerationWaiting(state, { nodeId }) {
    state.imageGenerationWaiting.push(nodeId);
  },

  setTrackDirtyState(state, { trackDirtyState }) {
    state.trackDirtyState = trackDirtyState;
  },

  addToCleanViewValuesState(state, { nodeId, value }) {
    const newValue = generateUniqueStringFromViewValue(value);
    if (state.cleanViewValuesState[nodeId]) {
      consola.debug(
        `Clean view values for node ${nodeId} already set. Overwriting with new value.`,
        {
          oldValue: state.cleanViewValuesState[nodeId],
          newValue,
        },
      );
    }
    state.cleanViewValuesState[nodeId] = newValue;
  },

  removeFromCleanViewValuesState(state, { nodeId }) {
    // eslint-disable-next-line no-undefined
    if (state.cleanViewValuesState[nodeId] === undefined) {
      consola.debug(`No such clean state for node ${nodeId} found.`);
    } else {
      delete state.cleanViewValuesState[nodeId];
    }
  },
};

export const actions = {
  setPage({ state, commit, dispatch }, { page }) {
    consola.trace("PageBuilder: Set page via action: ", page);
    // register all possible reporting content
    commit("setPage", page);
    if (state.isReporting) {
      commit("addImageGenerationWaiting", { nodeId: "layout" });
      Object.keys(page?.wizardPageContent?.webNodes).forEach((nodeId) => {
        commit("addImageGenerationWaiting", { nodeId });
      });
      Object.keys(page?.wizardPageContent?.nodeViews).forEach((nodeId) => {
        commit("addImageGenerationWaiting", { nodeId });
      });
    }

    // clear any potential previous interactivity states
    dispatch("interactivity/clear");

    // register all defined selection translators from the page configuration
    if (page?.wizardPageContent) {
      let pageConfig = page.wizardPageContent.webNodePageConfiguration;
      pageConfig?.selectionTranslators?.forEach((translator) => {
        dispatch("interactivity/registerSelectionTranslator", { translator });
      });
    }
  },

  updatePage({ commit, dispatch, state }, { page = {}, nodeIds }) {
    consola.trace("PageBuilder: Update page via action: ", page);
    let { webNodes, nodeViews, webNodePageConfiguration } =
      page?.wizardPageContent || page;
    nodeIds.forEach((nodeId) => {
      // default webNode update
      let updateConfig = { nodeId, config: webNodes?.[nodeId] };
      // modify update if nodeId references or used to reference a nodeView;
      // replaces or removes the nodeView, respectively
      if (
        nodeViews?.[nodeId] ||
        state.page.wizardPageContent.nodeViews?.[nodeId]
      ) {
        updateConfig.config = nodeViews?.[nodeId];
        updateConfig.viewType = "nodeViews";
      }
      commit("updateViewConfig", updateConfig);
    });
    // update translators with the interactivity store
    let { selectionTranslators: translators } = webNodePageConfiguration || {};
    if (translators) {
      dispatch("interactivity/updateSelectionTranslators", { translators });
    }
  },

  updateNodeViewConfig({ commit, dispatch }, { nodeView }) {
    consola.trace(
      "PageBuilder: Update node view config via action: ",
      nodeView,
    );
    const newViewConfig = {
      viewType: "nodeViews",
      update: nodeView,
      nodeId: "VIEW",
    };
    commit("updateViewConfig", newViewConfig);
    dispatch("pagebuilder/dialog/cleanSettings", null, { root: true });
  },

  setResourceBaseUrl({ commit }, { resourceBaseUrl }) {
    consola.trace(
      "PageBuilder: Set resourceBaseUrl via action:",
      resourceBaseUrl,
    );
    commit("setResourceBaseUrl", resourceBaseUrl);
  },

  updateWebNode({ commit }, newWebNode) {
    consola.trace(
      `WebNode[type: ${newWebNode.type}, id: ${newWebNode.nodeId}]: Updated value via action:`,
      newWebNode,
    );
    commit("updateViewConfig", newWebNode);
  },

  setWebNodeLoading({ commit }, { nodeId, loading }) {
    consola.trace(
      `PageBuilder: setting loading state of ${nodeId} via action: `,
      loading,
    );
    commit("setWebNodeLoading", { nodeId, loading });
  },

  async waitForWebNodeLoaded({ state }) {
    // The `webNodesLoading` array tracks nodes whose components are still mounting.
    // We wait in a loop until the node is removed from `webNodesLoading`, indicating
    // the component is ready. If it takes too long (30 retries = 3 seconds), we fail.
    // eslint-disable-next-line no-magic-numbers
    let remainingRetries = 30;
    const waitingTimeForNodesInMs = 100;
    while (state.webNodesLoading.length > 0) {
      remainingRetries--;
      if (remainingRetries === 0) {
        consola.warn("Could not finish loading webNodes after 30 retries");
        return false;
      }
      await sleep(waitingTimeForNodesInMs);
    }
    return true;
  },

  async addValueGetter({ commit, state }, { nodeId, valueGetter }) {
    consola.trace("PageBuilder: add value getter via action: ", nodeId);
    commit("addValueGetter", {
      nodeId,
      valueGetter,
    });

    // backwards compat to keep the old behaviour for data-apps/detached
    // mode as they dont need to track dirty changes
    if (!state.trackDirtyState) {
      return;
    }

    // The component must finish mounting before we can retrieve the initial value.
    // The `webNodesLoading` array tracks nodes whose components are still mounting.
    // We wait in a loop until the node is removed from `webNodesLoading`, indicating
    // the component is ready. If it takes too long (30 retries = 3 seconds), we fail.
    // eslint-disable-next-line no-magic-numbers
    let remainingRetries = 30;
    const waitingTimeForNodesInMs = 100;
    while (state.webNodesLoading.includes(nodeId)) {
      remainingRetries--;
      if (remainingRetries === 0) {
        consola.warn(
          `Could not get initial value for node ${nodeId} after 30 retries`,
        );
        return;
      }
      await sleep(waitingTimeForNodesInMs);
    }
    try {
      const initialValue = await valueGetter();
      if (initialValue.value) {
        commit("addToCleanViewValuesState", {
          nodeId,
          value: initialValue.value,
        });
      }
    } catch (e) {
      consola.warn("Could not get initial value for node ", nodeId, e);
    }
  },

  removeValueGetter({ commit }, { nodeId }) {
    consola.trace("PageBuilder: remove value getter via action: ", nodeId);
    commit("removeFromCleanViewValuesState", {
      nodeId,
    });
    commit("removeValueGetter", nodeId);
  },

  async getAllViewValueGetters({ state, dispatch }) {
    consola.debug("PageBuilder: getting all getters from nodes in clean state");

    const nodesLoaded = await dispatch("waitForWebNodeLoaded");
    if (!nodesLoaded) {
      consola.debug("Web nodes not loaded yet. Cannot get getters.");
      return false;
    }

    const cleanViewValues = state.cleanViewValuesState;
    // eslint-disable-next-line no-undefined
    if (cleanViewValues === undefined) {
      consola.debug("Initial view values undefined");
      return false;
    }

    const nodesToCheck = Object.keys(cleanViewValues);

    if (nodesToCheck.length === 0) {
      consola.debug("No nodes to check. No initial state?");
      return false;
    }

    const gettersOfNodesToCheck = Object.entries(state.pageValueGetters)
      .filter(([nodeId]) => nodesToCheck.includes(nodeId))
      .reduce((acc, [nodeId, getter]) => {
        acc[nodeId] = getter;
        return acc;
      }, {});

    const allGettersPresent = nodesToCheck.every(
      // eslint-disable-next-line no-undefined
      (nodeId) => gettersOfNodesToCheck[nodeId] !== undefined,
    );

    if (!allGettersPresent) {
      consola.debug("Not all getters present.");
      return false;
    }

    return gettersOfNodesToCheck;
  },

  async getViewValues({ state }, stringify = false) {
    consola.debug(
      "PageBuilder: getViewValues. Stringified values: ",
      stringify,
    );
    let valuePromises = Object.values(state.pageValueGetters).map((getter) =>
      getter(),
    );

    try {
      const values = await Promise.all(valuePromises);
      return values.reduce((acc, element) => {
        if (stringify) {
          acc[element.nodeId] = generateUniqueStringFromViewValue(
            element.value,
          );
        } else {
          acc[element.nodeId] = element.value;
        }
        return acc;
      }, {});
    } catch (e) {
      consola.error(`Could not retrieve all view values: ${e}`);
      return {};
    }
  },

  addValidator({ commit }, { nodeId, validator }) {
    consola.trace("PageBuilder: add validator via action: ", nodeId);
    commit("addValidator", { nodeId, validator });
  },

  removeValidator({ commit }, { nodeId }) {
    consola.trace("PageBuilder: remove validator via action: ", nodeId);
    commit("removeValidator", nodeId);
  },

  async getValidity({ state }) {
    let validityPromises = Object.values(state.pageValidators).map(
      (validator) => validator(),
    );
    try {
      const validityArray = await Promise.all(validityPromises);
      return validityArray.reduce((acc, nodeResp) => {
        acc[nodeResp.nodeId] = nodeResp.isValid;
        return acc;
      }, {});
    } catch (e) {
      consola.error(`Page validation failed: ${e}`);
      return {};
    }
  },

  addValidationErrorSetter({ commit }, { nodeId, errorSetter }) {
    consola.trace(
      "PageBuilder: add validation error setter via action: ",
      nodeId,
    );
    commit("addValidationErrorSetter", { nodeId, errorSetter });
  },

  removeValidationErrorSetter({ commit }, { nodeId }) {
    consola.trace(
      "PageBuilder: remove validation error setter via action: ",
      nodeId,
    );
    commit("removeValidationErrorSetter", nodeId);
  },

  setValidationErrors({ state }, { page }) {
    const setValidationErrorPromises = [];
    for (const nodeId in page) {
      // Server responses for WebPortal Component errors may have the error attr.
      let errorMessage = page[nodeId].error || page[nodeId];
      if (typeof state.pageValidationErrorSetters[nodeId] === "function") {
        setValidationErrorPromises.push(
          state.pageValidationErrorSetters[nodeId](errorMessage),
        );
      }
    }
    return Promise.all(setValidationErrorPromises)
      .then(() => true)
      .catch(() => false);
  },

  triggerReExecution({ dispatch }, { nodeId }) {
    try {
      consola.debug(`Pagebuilder: re-execution triggered by node ${nodeId}`);
      dispatch("api/triggerReExecution", { nodeId }, { root: true });
    } catch (e) {
      consola.debug("Pagebuilder: re-execution failed.");
    }
  },

  setNodesReExecuting({ commit }, nodesReExecuting) {
    consola.debug(
      "PageBuilder: setting re-executing nodes via action: ",
      nodesReExecuting,
    );
    commit("setNodesReExecuting", nodesReExecuting);
  },

  async getDirtyNodes({ state, dispatch }) {
    consola.debug("PageBuilder: getting dirty nodes");

    const gettersOfNodesToCheck = await dispatch("getAllViewValueGetters");

    if (!gettersOfNodesToCheck) {
      consola.debug("Issues during getter evaluation. Cannot get dirty nodes.");
      return {};
    }

    const dirtyNodesViewValues = await Promise.all(
      Object.entries(gettersOfNodesToCheck).map(async ([nodeId, getter]) => {
        const newViewValue = await getter();
        const valueToCompare = generateUniqueStringFromViewValue(
          newViewValue.value,
        );

        return valueToCompare === state.cleanViewValuesState[nodeId]
          ? null
          : {
              [nodeId]: valueToCompare,
            };
      }),
    );

    return dirtyNodesViewValues
      .filter(Boolean)
      .reduce((acc, node) => ({ ...acc, ...node }), {});
  },

  async isDirty({ dispatch }, _) {
    consola.debug("PageBuilder: checking if page is dirty");
    return Object.keys(await dispatch("getDirtyNodes")).length > 0;
  },

  async isDefault({ state, dispatch }, _) {
    consola.debug("PageBuilder: checking if page is default");

    const gettersOfNodesToCheck = await dispatch("getAllViewValueGetters");

    if (!gettersOfNodesToCheck) {
      consola.debug(
        "Issues during getter evaluation. Cannot check defaultness.",
      );
      return true; // If we cannot determine defaultness, we assume it is default.
    }

    return (
      await Promise.all(
        Object.keys(gettersOfNodesToCheck).map(async (nodeId) => {
          const newViewValue = await gettersOfNodesToCheck[nodeId]();
          const valueToCompare = generateUniqueStringFromViewValue(
            newViewValue.value,
          );

          const webNode = state.page.wizardPageContent.webNodes[nodeId];

          if (!webNode) {
            // TODO AP-25095: enable 'apply as default' for ui-extensions
            return true;
          }

          const defaultViewValue = toValue(
            webNode.viewRepresentation.defaultValue,
          );

          if (!defaultViewValue) {
            return true;
          }

          const defaultValue =
            generateUniqueStringFromViewValue(defaultViewValue);

          return valueToCompare === defaultValue;
        }),
      )
    ).every(Boolean);
  },

  async resetDirtyState({ commit, state, dispatch }) {
    consola.debug("PageBuilder: resetting dirty state.");

    const nodesLoaded = await dispatch("waitForWebNodeLoaded");
    if (!nodesLoaded) {
      consola.debug("Web nodes not loaded yet. Cannot reset dirty state.");
      return;
    }

    Object.entries(state.pageValueGetters).forEach(([nodeId, getter]) => {
      // Older nodes sometimes fail to provide a value. In that case we skip the reset.
      // But as these nodes do not provide a clean value either, we do not need to reset them.
      getter()
        .then((viewValue) => {
          commit("addToCleanViewValuesState", {
            nodeId,
            value: viewValue.value,
          });
        })
        .catch((e) =>
          consola.warn(
            `Could not reset dirty state for node ${nodeId} because of error: ${e}`,
          ),
        );
    });
  },

  setReportingContent({ state, commit }, { nodeId, reportingContent }) {
    commit("setReportingContent", { nodeId, reportingContent });
    state.imageGenerationWaiting.splice(
      state.imageGenerationWaiting.indexOf(nodeId),
      1,
    ); // TODO error handling
    if (state.imageGenerationWaiting.length === 0) {
      let report = generateReportLayout(state.reportingContent);
      report = decodeURIComponent(encodeURIComponent(report));
      window.EquoCommService.send(state.generatedReportActionId, report);
    }
  },
};
