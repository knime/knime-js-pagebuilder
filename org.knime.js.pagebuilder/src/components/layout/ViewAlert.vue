<script>
import Label from '~/webapps-common/ui/components/forms/Label';
import Button from '~/webapps-common/ui/components/Button';

import SignWarningIcon from '~/webapps-common/ui/assets/img/icons/sign-warning.svg?inline';
import CloseIcon from '~/webapps-common/ui/assets/img/icons/close.svg?inline';
import DropdownIcon from '~/webapps-common/ui/assets/img/icons/arrow-dropdown.svg?inline';

/**
 * This component serves as the override for window.alert when invoked from within a node
 * iFrame and provides updated styling with similar functionality to a native browser alert.
 */
export default {
    components: {
        Label,
        Button,
        SignWarningIcon,
        CloseIcon,
        DropdownIcon
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
            default: 'warn'
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
    data() {
        return {
            messageExpanded: false
        };
    },
    computed: {
        nodeName() {
            return (this.nodeInfo && this.nodeInfo.nodeName) || 'Missing node'; // eslint-disable-line no-extra-parens
        },
        title() {
            return `${this.type === 'warn' ? 'WARNING' : this.type.toUpperCase()}: ${this.nodeName}`;
        },
        subTitle() {
            return this.type === 'warn' ? 'Message(s) on node:' : 'Oops, something went wrong!';
        },
        messageText() {
            return this.message || 'No further information available. Please check the workflow configuration.';
        },
        expandedClass() {
            return this.type === 'warn' || this.messageExpanded ? 'expanded' : null;
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
        },
        /**
         * Event handler for expanding message of the alert.
         *
         * @emits {closeAlert} the event which the parent should use to inactivate the alert.
         * @returns {undefined}
         */
        expandMessage() {
            consola.trace('Expanding alert message.');
            this.messageExpanded = !this.messageExpanded;
        }
    }
};
</script>

<template>
  <div>
    <transition name="fade">
      <div
        v-if="active"
        class="overlay"
      />
    </transition>
    <transition name="slide-fade">
      <section v-if="active">
        <div :class="['pop-over', expandedClass, type]">
          <header>
            <SignWarningIcon class="icon warn-icon" />
            <Label
              :text="title"
              class="label"
            />
            <Button
              class="close-button"
              @click="onClose"
            >
              <CloseIcon class="icon close-icon" />
            </Button>
          </header>
          <div
            v-if="messageText"
            :class="'alert-body expandable-message ' + type"
          >
            <div class="expand-controls">
              <span>{{ subTitle }}</span>
              <span
                v-if="type !== 'warn'"
                class="expand-text"
              >
                (See {{ messageExpanded ? 'less' : 'more' }})
                <Button
                  class="expand-button"
                  @click="expandMessage"
                >
                  <DropdownIcon />
                </Button>
              </span>
            </div>
            <transition name="message-fade">
              <div
                v-show="type === 'warn' || messageExpanded"
                class="scrollable-message"
              >
                <span v-if="type !== 'warn'">
                  <span class="info-header">
                    nodeID:
                  </span>
                  {{ nodeId }}
                  <br>
                  <span class="info-header">
                    node annotation:
                  </span>
                  {{ nodeInfo.nodeAnnotation || 'N/A' }}
                  <br>
                  <span class="info-header">
                    message:
                  </span>
                </span>
                {{ messageText }}
              </div>
            </transition>
          </div>
        </div>
      </section>
    </transition>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.fade-leave-active,
.fade-enter-active {
  transition: opacity 0.2s linear;
}

.fade-enter,
.fade-leave-to,
.message-fade-enter,
.message-fade-leave-to {
  opacity: 0;
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: opacity 0.1s linear;
}

.message-fade-enter-active {
  transition-duration: 0.15s;
  transition-delay: 0.3s;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s linear 0.1s;
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(25%);
  opacity: 0;
}

.overlay {
  z-index: 1;
  position: absolute;
  top: 0;
  background-color: rgba(255, 255, 255, 0.7);
  width: 100%;
  height: 100%;
}

section {
  font-size: 16px;
  white-space: pre-wrap;
  z-index: 1;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;

  & .pop-over {
    max-width: 50%;
    min-width: var(--grid-min-width);
    max-height: 110px;
    height: unset;
    transition: max-height 0.3s linear;
    margin: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(255, 255, 255);
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.5);

    & header {
      position: relative;
      color: rgba(255, 255, 255);
      padding: 15px 20px 10px 59px;

      & .icon {
        stroke-width: calc(32px / 24);
        stroke: rgba(255, 255, 255);

        &.warn-icon {
          position: absolute;
          left: 20px;
          width: 24px;
          height: 24px;
        }
      }

      & .close-button {
        position: absolute;
        top: 6px;
        right: 4px;
        z-index: 2;
      }
    }

    & .alert-body {
      position: relative;
      display: block;
      background-color: rgba(255, 255, 255);
      max-height: 75%;
      overflow-y: hidden;
      box-sizing: content-box;

      & .scrollable-message {
        padding: 0 20px;
        height: calc(100% - 56px);
        overflow-y: scroll;

        & .info-header {
          font-weight: bold;
        }
      }
    }

    &.error header {
      background-color: var(--theme-color-error);
    }

    &.expanded {
      max-height: 75%;
      transition: max-height 0.3s linear;

      & .expand-button {
        transform: scaleY(-1);
      }

      & .alert-body {
        height: calc(100% - 56px);
        max-height: unset;
        box-sizing: content-box;
      }
    }

    &.warn {
      &.expanded {
        display: flex;
        flex-direction: column;
        height: fit-content;
        min-height: fit-content;
        max-height: 75%;
        overflow-y: hidden;

        & .alert-body {
          height: unset;

          & .scrollable-message {
            padding: 0 20px 10px 20px;
          }
        }
      }

      & header {
        background-color: var(--theme-color-action-required);
      }
    }

    & .expand-controls {
      padding: 15px 20px 15px 20px;

      & .expand-text {
        float: right;
        margin-right: 26px;
      }

      & .expand-button {
        margin: 0;
        top: 6px;
        right: 4px;
        z-index: 2;
        position: absolute;
        transition: transform 0.4s ease-in-out;
      }
    }
  }
}
</style>
