/**
 * This store controls the global alert behavior for the PageBuilder. The alert provided with the @see showAlert action
 * will be displayed in top-level, @see AlertGlobal component. Local events can be triggered on removal of the global
 * alert from this store by providing a callback function when registering the alert.
 */
export const namespaced = true;

export const state = () => ({
  alert: null,
});

export const mutations = {
  showAlert(state, alert) {
    state.alert = alert;
  },

  closeAlert(state) {
    state.alert = null;
  },
};

export const actions = {
  showAlert({ commit }, alert) {
    commit("showAlert", alert);
  },

  closeAlert({ commit, state }, remove) {
    if (state.alert.callback) {
      state.alert.callback(remove);
    }
    commit("closeAlert");
  },
};

export const getters = {
  /**
   * Convenience getter to format the current alert for use with the common Message component from webapps-common.
   *
   * @param {Object} state - vuex alert store state.
   * @returns {Object | null} [message] - the alert in message-format if one is set; else null.
   */
  alertAsMessage: (state) => {
    if (!state.alert) {
      return null;
    }
    let { message, type = "UNKNOWN", subtitle, nodeId } = state.alert;
    let typeHeader = type === "warn" ? "WARNING" : type.toUpperCase();
    let messageHeader = "";
    let details;
    if (subtitle) {
      messageHeader = subtitle;
      details = message || "";
    } else if (message) {
      messageHeader = message;
    } else {
      details =
        "No further information available. Please check the workflow configuration.";
    }
    return {
      message: `${typeHeader} ${messageHeader}`,
      details,
      count: 1,
      id: nodeId,
      type,
      showCollapser: Boolean(details),
      showCloseButton: true,
    };
  },
};
