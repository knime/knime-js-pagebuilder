<script>

const MAX_SPINNER_HEIGHT = 40; // px
/**
 * Animation overlay for individual nodes or widgets while they are re-executing.
 */
export default {
    props: {
        show: {
            type: Boolean,
            default: false
        },
        showSpinner: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            SVG_STROKE_PIXEL_OFFSET: 3 // px
        };
    },
    computed: {
        spinnerHeight() {
            return this.showSpinner ? this.getSpinnerHeight() : 0;
        },
        circleRadius() {
            return Math.max((this.spinnerHeight / 2) - this.SVG_STROKE_PIXEL_OFFSET, 0);
        },
        svgLeft() {
            return this.showSpinner ? this.getOverlayWidth() : 0;
        },
        svgStyle() {
            return `height:${this.spinnerHeight}px;` +
                `width:${this.spinnerHeight}px;` +
                `top:${this.spinnerHeight / 2}px;` +
                `left:${this.svgLeft - (this.spinnerHeight / 2)}px;`;
        },
        spinnerStyle() {
            return `transform-origin: ${this.circleRadius + this.SVG_STROKE_PIXEL_OFFSET}px` +
                ` ${this.circleRadius + this.SVG_STROKE_PIXEL_OFFSET}px 0;`;
        }
    },
    methods: {
        getSpinnerHeight() {
            let el = this.$refs?.overlay?.offsetHeight;
            return el ? Math.min(el / 2, MAX_SPINNER_HEIGHT) : 0;
        },
        getOverlayWidth() {
            let el = this.$refs?.overlay?.offsetWidth;
            return el ? el / 2 : 0;
        }
    }
};
</script>

<template>
  <transition
    v-if="show"
    appear
    name="fade"
  >
    <div ref="overlay">
      <transition
        v-if="showSpinner"
        appear
        name="fade"
      >
        <svg
          :view-box="`0 0 ${spinnerHeight} ${spinnerHeight}`"
          :style="svgStyle"
        >
          <circle
            :r="circleRadius"
            :cy="circleRadius + SVG_STROKE_PIXEL_OFFSET"
            :cx="circleRadius + SVG_STROKE_PIXEL_OFFSET"
            :style="spinnerStyle"
          />
        </svg>
      </transition>
    </div>
  </transition>
</template>

<style type="postcss" scoped>

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(720deg);
  }

  100% {
    transform: rotate(1080deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity linear 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

svg {
  background: transparent;
  margin: auto;
  position: absolute;
}

circle {
  fill: transparent;
  stroke: var(--knime-masala);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 95%;
  animation: spin 4s linear infinite;
}

div {
  height: 100%;
  width: 100%;
  background-color: var(--knime-white);
  position: absolute;
  opacity: 0.7;
  z-index: 1;
  pointer-events: all;
  top: 0;
}

</style>
