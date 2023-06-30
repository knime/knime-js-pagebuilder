<script>
import { markRaw, toRaw } from 'vue';
import { mapState } from 'vuex';
import { KnimeService, IFrameKnimeServiceAdapter } from '@knime/ui-extension-service';
import UIExtComponent from './UIExtComponent.vue';
import UIExtIFrame from './UIExtIFrame.vue';
import AlertLocal from '../ui/AlertLocal.vue';
import WarningLocal from '../ui/WarningLocal.vue';
import layoutMixin from '../mixins/layoutMixin';

/**
 * Wrapper for all UIExtensions. Determines the type of component to render (either native/Vue-based or iframe-based).
 * Also detects changes to it's configuration and increments a local counter to help with re-renders of iframe-based
 * components.
 */
export default {
    components: {
        UIExtComponent,
        UIExtIFrame,
        AlertLocal,
        WarningLocal
    },
    mixins: [layoutMixin],
    // using provide/inject instead of a prop to pass the knimeService to the children because
    // 1) we don't want reactivity in this case
    // 2) any deeply nested child of the UIComponent can get access to knimeService if needed
    provide() {
        this.initKnimeService();
        const getKnimeService = () => this.knimeService;
        return { getKnimeService };
    },
    props: {
        extensionConfig: {
            default: () => ({}),
            type: Object,
            validate(extensionConfig) {
                if (typeof extensionConfig !== 'object') {
                    return false;
                }
                const requiredProperties = ['nodeId', 'workflowId', 'projectId', 'resourceInfo'];
                return requiredProperties.every(key => extensionConfig.hasOwnProperty(key));
            }
        },
        /**
         * View configuration, mainly layout and sizing options
         */
        viewConfig: {
            default: () => ({}),
            type: Object
        }
    },
    data() {
        return {
            configKey: 0,
            knimeService: null,
            alert: null,
            isWidget: false
        };
    },
    computed: {
        ...mapState('pagebuilder', ['page', 'isDialogLayout', 'isReporting']),
        isUIExtComponent() {
            return this.extensionConfig?.resourceInfo?.type === 'VUE_COMPONENT_LIB';
        },
        resourceLocation() {
            return this.$store.getters['api/uiExtResourceLocation']({
                resourceInfo: this.extensionConfig?.resourceInfo
            });
        },
        displayError() {
            return this.alert?.type === 'error';
        },
        displayWarning() {
            return this.alert?.type === 'warn';
        },
        pageIdPrefix() {
            return this.page?.wizardPageContent?.webNodePageConfiguration
                ?.projectRelativePageIDSuffix;
        },
        nodeId() {
            return this.pageIdPrefix ? `${this.pageIdPrefix}:${this.viewConfig.nodeID}` : this.viewConfig.nodeID;
        }
    },
    watch: {
        extensionConfig() {
            this.$store.dispatch('pagebuilder/service/deregisterService', { service: this.knimeService });

            this.initKnimeService();
            this.configKey += 1; // needed to force a complete re-rendering of UIExtIFrames and UIExtComponents
        }
    },
    beforeUnmount() {
        this.$store.dispatch('pagebuilder/service/deregisterService', { service: this.knimeService });
    },
    mounted() {
        const nodeInfo = this.extensionConfig.nodeInfo;
        const alertMessage = nodeInfo?.nodeErrorMessage || nodeInfo?.nodeWarnMessage;
        if (alertMessage) {
            const isError = nodeInfo?.nodeErrorMessage;
            const nodeId = this.extensionConfig.nodeId;
            this.handleAlert({ message: alertMessage, type: isError ? 'error' : 'warn', subtitle: '', nodeId });
        }
    },
    methods: {
        initKnimeService() {
            const ServiceConstructor = this.isUIExtComponent ? KnimeService : IFrameKnimeServiceAdapter;
            let knimeService = new ServiceConstructor(
                toRaw(this.extensionConfig),
                this.callService,
                this.pushEvent
            );
            if (this.isReporting) {
                // const actionId = this.extensionConfig.generatedImageActionId;
                // TODO remove once action is coming from backend
                // eslint-disable-next-line vue/no-mutating-props
                this.extensionConfig.generatedImageActionId = 'generatingReportContent';
                if (!this.isUIExtComponent) {
                    knimeService.registerImageGeneratedCallback(
                        generatedImage => this.$store.dispatch('pagebuilder/setReportingContent', {
                            nodeId: this.nodeId,
                            reportingContent: `<img style="width:${this.$el.offsetWidth}px" src="${generatedImage}" />`
                        })
                    );
                }
            } else if (this.extensionConfig?.generatedImageActionId) {
                const actionId = this.extensionConfig.generatedImageActionId;
                knimeService.registerImageGeneratedCallback(
                    generatedImage => window.EquoCommService.send(actionId, generatedImage)
                );
            }
            this.knimeService = markRaw(knimeService);
            this.$store.dispatch('pagebuilder/service/registerService', { service: this.knimeService });
        },
        callService(nodeService, serviceRequest, requestParams) {
            return this.$store.dispatch('api/callService', {
                extensionConfig: toRaw(this.extensionConfig),
                nodeService,
                serviceRequest,
                requestParams
            });
        },
        pushEvent(event) {
            if (event?.type === 'alert') {
                return this.handleAlert(event.alert);
            }
            return this.$store.dispatch('pagebuilder/service/pushEvent', event);
        },
        handleAlert(alert) {
            if (this.isDialogLayout) {
                this.showAlert(alert);
            } else {
                this.alert = alert;
            }
        },
        /**
         * Dispatches an event to show the local alert details with the global alert via store action.
         *
         * @param {Object} alert - the alert to display.
         * @returns {Promise}
         */
        showAlert(alert) {
            return this.$store.dispatch('pagebuilder/alert/showAlert', { ...alert, callback: this.closeAlert });
        },
        /**
         * Callback function passed to the alert store to close the local alert when a global alert action is
         * triggered. Can be used locally if needed.
         *
         * @param {Boolean} [remove] - optionally if the local alert should be cleared.
         * @returns {undefined}
         */
        closeAlert(remove) {
            if (remove) {
                this.alert = null;
            }
        }
    }
};
</script>

<template>
  <div
    :class="layoutClasses"
    :style="layoutStyle"
  >
    <UIExtComponent
      v-if="isUIExtComponent"
      :key="configKey + '-1'"
      :node-id="nodeId"
      :resource-location="resourceLocation"
    />
    <UIExtIFrame
      v-else
      :key="configKey + '-2'"
      :resource-location="resourceLocation"
    />
    <AlertLocal
      v-if="displayError"
      active
      @show-alert="showAlert(alert)"
    />
    <WarningLocal
      v-if="displayWarning"
      class="local-warning"
      @click="showAlert(alert)"
    />
  </div>
</template>

<style lang="postcss" scoped>
@import url('../mixins/layoutMixin.css');

.local-warning {
  position: absolute;
  bottom: 0;
  top: unset;
}
</style>
