export const namespaced = true;

export const state = () => ({
  applySettings: null,
  dirtySettings: false,
  dirtyModelSettings: false,
  settingsOnClean: null,
});

export const mutations = {
  dirtySettings(state, isModelSetting) {
    state.dirtySettings = true;
    if (isModelSetting) {
      state.dirtyModelSettings = true;
    }
  },

  cleanSettings(state, currentSettings) {
    state.dirtySettings = false;
    state.dirtyModelSettings = false;
    state.settingsOnClean = currentSettings;
  },

  /**
   * Adds the method to apply the dialog settings to the dialogApplySettings key.
   *
   * @param {*} state - Vuex state.
   * @param {function} applySettings - the method to add.
   * @returns {undefined}
   */
  setApplySettings(state, applySettings) {
    state.applySettings = applySettings;
  },
};

export const actions = {
  dirtySettings({ commit }, isModelSetting) {
    commit("dirtySettings", isModelSetting);
  },

  cleanSettings({ commit }, currentSettings) {
    commit("cleanSettings", currentSettings);
  },

  /**
   * Calls setApplySettings to add the applySettings method to the store.
   *
   * @param {Object} context - Vuex context.
   * @param {Object} params - action config.
   * @param {function} param.dialogApplySettings - the method to commit to the state.
   * @returns {undefined}
   */
  setApplySettings({ commit }, { applySettings }) {
    commit("setApplySettings", applySettings);
  },

  /**
   * Calls the setApplySettings method to update the changed settings.
   *
   * @param {Object} context - Vuex context.
   * @returns {Promise<any>} - a Promise calling the applySettings method.
   */
  callApplySettings({ state }) {
    return state.applySettings();
  },
};
