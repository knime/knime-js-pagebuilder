<script>
const MAX_SPINNER_HEIGHT = 40; // px
/**
 * Animation overlay for individual nodes or widgets while they are re-executing.
 */
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    showSpinner: {
      type: Boolean,
      default: false,
    },
    useCssTransition: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      overlayRefAvailable: false,
      SVG_STROKE_PIXEL_OFFSET: 3, // px
    };
  },
  computed: {
    spinnerHeight() {
      return this.showSpinner ? this.getSpinnerHeight() : 0;
    },
    circleRadius() {
      return Math.max(this.spinnerHeight / 2 - this.SVG_STROKE_PIXEL_OFFSET, 0);
    },
    svgLeft() {
      return this.showSpinner ? this.getHalfOverlayWidth() : 0;
    },
    svgTop() {
      return this.showSpinner ? this.getHalfOverlayHeight() : 0;
    },
    svgStyle() {
      return (
        `height:${this.spinnerHeight}px;` +
        `width:${this.spinnerHeight}px;` +
        `top:${this.svgTop - this.spinnerHeight / 2}px;` +
        `left:${this.svgLeft - this.spinnerHeight / 2}px;`
      );
    },
    spinnerStyle() {
      const offset = this.circleRadius + this.SVG_STROKE_PIXEL_OFFSET;
      return `transform-origin: ${offset}px ${offset}px 0;`;
    },
  },
  methods: {
    getSpinnerHeight() {
      return Math.min(this.getHalfOverlayHeight(), MAX_SPINNER_HEIGHT);
    },
    getHalfOverlayWidth() {
      return this.$refs.overlay?.offsetWidth / 2 || 0;
    },
    getHalfOverlayHeight() {
      return this.$refs.overlay?.offsetHeight / 2 || 0;
    },
  },
};
</script>

<template>
  <transition
    v-if="show"
    appear
    name="fade"
    :css="useCssTransition"
    @after-enter="overlayRefAvailable = true"
  >
    <div ref="overlay">
      <transition
        v-if="showSpinner && overlayRefAvailable"
        appear
        name="fade"
        :css="useCssTransition"
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
