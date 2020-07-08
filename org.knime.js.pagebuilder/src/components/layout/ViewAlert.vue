<script>
import Label from '~/webapps-common/ui/components/forms/Label';
import Button from '~/webapps-common/ui/components/Button';

import SignWarningIcon from '~/webapps-common/ui/assets/img/icons/sign-warning.svg?inline';
import CircleWarningIcon from '~/webapps-common/ui/assets/img/icons/circle-warning.svg?inline';
import CloseIcon from '~/webapps-common/ui/assets/img/icons/close.svg?inline';
import DropdownIcon from '~/webapps-common/ui/assets/img/icons/arrow-dropdown.svg?inline';
import CopyIcon from '~/webapps-common/ui/assets/img/icons/copy.svg?inline';

import { copyText } from '~/webapps-common/util/copyText';

/**
 * This component serves as the override for window.alert when invoked from within a node
 * iFrame and provides updated styling with similar functionality to a native browser alert.
 */
export default {
    components: {
        Label,
        Button,
        SignWarningIcon,
        CircleWarningIcon,
        CloseIcon,
        DropdownIcon,
        CopyIcon
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
         * @returns {undefined}
         */
        expandMessage() {
            consola.trace('Expanding alert message.');
            this.messageExpanded = !this.messageExpanded;
        },
        /**
         * Event handler for copying the text of the alert.
         * Issues toast for successful copying of text.
         *
         * @returns {undefined}
         */
        copyText() {
            consola.trace('Copying alert message.');
            copyText(this.$refs.messageContent.textContent);
            this.$store.dispatch('notification/show', {
                notification: {
                    message: 'Text copied!',
                    type: 'success',
                    autoRemove: true
                }
            });
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
      <div
        v-if="active"
        class="alert-body"
      >
        <div :class="['pop-over', expandedClass, type]">
          <header>
            <Component
              :is="type === 'warn' ? 'CircleWarningIcon' : 'SignWarningIcon'"
              class="icon warn-icon"
            />
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
            class="alert-body"
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
                ref="messageContent"
                class="scrollable-message"
              >
                <span v-if="type !== 'warn'">
                  <span class="info-header">Node:</span>
                  {{ `${nodeId} ${nodeInfo.nodeAnnotation ? '(' + nodeInfo.nodeAnnotation + ')' : ''}\n` }}
                  <span class="info-header">Message:</span>
                </span>
                <span class="message-block">
                  {{ messageText }}
                </span>
              </div>
            </transition>
            <div class="copy-button-container">
              <Button
                v-show="messageExpanded"
                :compact="true"
                class="copy-button"
                @click="copyText"
              >
                <CopyIcon />
                Copy Text
              </Button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.message-fade-enter-active,
.fade-enter-active {
  transition: opacity 0.1s ease-out;
}

.fade-enter,
.fade-leave-to,
.message-fade-enter,
.message-fade-leave-to {
  opacity: 0;
}

.fade-leave-active,
.message-fade-leave-active {
  transition: opacity 0.2s ease-in -0.1s;
}

.message-fade-enter-active {
  transition-duration: 0.15s;
  transition-delay: 0.3s;
}


.slide-fade-leave-active {
  transition: all 0.3s ease-in 0.1s;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out 0.1s;
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
  left: 0;
  background-color: rgba(255, 255, 255, 0.7);
  width: 100%;
  height: 100%;
}

.alert-body {
  font-size: 16px;
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  & .pop-over {
    max-width: 50%;
    min-width: var(--grid-min-width);
    max-height: 110px;
    height: unset;
    transition: max-height 0.3s ease-in;
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
      padding: 15px 20px 15px 59px;

      & .label >>> span.label-text {
        margin: 4px 0 0 0;
      }

      & .icon {
        stroke-width: calc(32px / 24);
        stroke: rgba(255, 255, 255);

        &.warn-icon {
          position: absolute;
          left: 20px;
          top: 18px;
          width: 24px;
          height: 24px;
        }
      }

      & .close-button {
        position: absolute;
        top: 8px;
        right: 4px;
        z-index: 2;

        & svg {
          margin: 0;
        }
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
        padding: 0 0 0 20px;
        white-space: pre-line;
        overflow-x: hidden;
        width: calc(100% - 10px);
        height: calc(100% - 76px);

        & .info-header {
          font-weight: bold;
        }

        & .message-block {
          overflow-x: hidden;
          width: 100%;
          text-overflow: ellipsis;
          position: relative;
          display: inline-block;
        }
      }
    }

    & .expand-controls {
      padding: 15px 20px 5px 20px;

      & .expand-text {
        float: right;
        margin-right: 26px;
      }

      & .expand-button {
        padding: 5px;
        margin: 6px;
        top: 6px;
        right: 4px;
        z-index: 2;
        position: absolute;
        transition: transform 0.3s ease-in-out;

        & svg {
          margin: 0;
        }
      }
    }

    &.expanded {
      max-height: 75%;
      transition: max-height 0.3s ease-out;

      & .expand-button {
        transform: scaleY(-1);
      }

      & .alert-body {
        height: calc(100% - 58px);
        max-height: unset;
        box-sizing: content-box;
      }

      & .copy-button-container {
        display: flex;

        & .copy-button {
          margin: auto;

          & svg {
            margin: 0;
          }
        }
      }
    }

    &.error header {
      background-color: var(--theme-color-error);
    }

    &.warn {
      &.expanded {
        display: flex;
        flex-direction: column;
        height: fit-content; /* firefox does not support yet; cause warning to always be 75% height */
        max-height: 75%;
        overflow-y: hidden;

        & .alert-body {
          height: unset;
          min-height: 87px;

          & .scrollable-message {
            height: calc(100% - 46px);
          }
        }
      }

      & header {
        background-color: var(--theme-color-action-required);
      }
    }
  }
}
</style>
