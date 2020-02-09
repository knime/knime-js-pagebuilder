<script>
import Label from '~/webapps-common/ui/components/forms/Label';
import Button from '~/webapps-common/ui/components/Button';

import SignWarningIcon from '~/webapps-common/ui/assets/img/icons/sign-warning.svg?inline';
import CloseIcon from '~/webapps-common/ui/assets/img/icons/close.svg?inline';

/**
 * This component serves as the override for window.alert when invoked from within a node
 * iFrame and provides updated styling with similar functionality to a native browser alert.
 */
export default {
    components: {
        Label,
        Button,
        SignWarningIcon,
        CloseIcon
    },
    props: {
        nodeInfo: {
            type: Object,
            default: () => {}
        },
        nodeId: {
            type: String,
            default: ''
        },
        /**
         * Can be either 'error' or 'warn'. Only affects styling.
         */
        type: {
            type: String,
            default: 'info'
        },
        /**
         * Displayed in the alert body.
         */
        message: {
            type: String,
            default: ''
        },
        /**
         * Opens and closes the alert from the parent.
         */
        active: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        nodeName() {
            return (this.nodeInfo && this.nodeInfo.nodeName) || 'Missing node'; // eslint-disable-line no-extra-parens
        },
        title() {
            return `${this.nodeName} (node ID ${this.nodeId}) ${this.type.toUpperCase()}`;
        }
    },
    methods: {
        /**
         * Event handler for closing the alert.
         *
         * @emits {closeAlert} the event which the parent should use to inactivate the alert.
         * @returns {undefined}
         */
        onClose() {
            consola.trace('Closing alert requested (ViewAlert).');
            this.$emit('closeAlert');
        }
    }
};
</script>

<template>
  <transition name="slide-fade">
    <section
      v-if="active"
      :class="type"
    >
      <SignWarningIcon class="icon warn-icon" />
      <Label :text="title" />
      <span v-if="message">
        Message on node: {{ message }}
      </span>
      <span v-else>
        No further information available. Please check the configuration of the workflow.
      </span>
      <Button
        class="icon close"
        @click="onClose"
      >
        <CloseIcon class="close-icon" />
      </Button>
    </section>
  </transition>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.slide-fade-leave-active,
.slide-fade-enter-active {
  transition: all 0.3s linear;
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(1em);
  opacity: 0;
}

.icon {
  position: absolute;
  stroke-width: calc(32px / 24);
}

.warn-icon {
  margin-left: -40px;
  width: 24px;
  height: 24px;
}

.close {
  top: 0;
  right: 0;
  z-index: 2;
}

section {
  border: 2px solid;
  padding: 18px 56px;
  font-size: 16px;
  z-index: 1;
  position: absolute;
  top: 0;
  background-color: rgba(239, 241, 242, 0.85);
  width: 100%;
  height: 100%;
  overflow-y: auto !important;

  & .close-icon {
    margin-right: 0;
    stroke: var(--theme-color-masala);
  }

  &.error {
    color: var(--theme-color-error);
    border-color: var(--theme-color-error);

    & .warn-icon {
      stroke: var(--theme-color-error);
    }
  }

  &.warn {
    color: var(--theme-color-action-required);
    border-color: var(--theme-color-action-required);

    & .warn-icon {
      stroke: var(--theme-color-action-required);
    }
  }
}

</style>
