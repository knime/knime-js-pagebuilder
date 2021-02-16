<script>
import { mapState } from 'vuex';

import ReloadIcon from '~/webapps-common/ui/assets/img/icons/reload.svg?inline';
import svgWithTitle from 'webapps-common/ui/util/svgWithTitle';

/**
 * Animation overlay for individual nodes or widgets while they are re-executing.
 *
 * TODO: WEBP-680 Update with UX Designs
 */
export default {
    components: {
        ReloadIcon: svgWithTitle(ReloadIcon, 'Loading…')
    },
    props: {
        /**
         * The unique string node ID as it exists
         * in the store webNodes
         */
        nodeId: {
            required: true,
            type: String,
            validator(nodeId) {
                return nodeId !== '';
            }
        }
    },
    computed: {
        ...mapState({
            nodesReExecuting: state => state.pagebuilder.nodesReExecuting
        }),
        isExecuting() {
            return this.nodesReExecuting?.includes(this.nodeId);
        }
    }
};
</script>

<template>
  <transition
    v-if="isExecuting"
    appear
    name="fade"
  >
    <div>
      <ReloadIcon />
    </div>
  </transition>
</template>

<style type="postcss" scoped>

.fade-enter-active,
.fade-leave-active {
  transition: opacity linear 1s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  100% {
    transform: rotate(-360deg);
  }
}

svg {
  animation: spin 2s linear infinite;
  height: 40px;
  top: 50%;
  left: 50%;
  position: absolute;
  stroke-width: 3px;
  margin: auto;
  stroke: var(--knime-masala);
}

div {
  height: 100%;
  width: 100%;
  background-color: white;
  position: absolute;
  opacity: 0.5;
}

</style>
