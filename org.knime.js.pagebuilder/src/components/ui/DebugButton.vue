<script>
import FunctionButton from '~/webapps-common/ui/components/FunctionButton';
import InspectorIcon from '~/webapps-common/ui/assets/img/icons/code-html.svg?inline';

export default {
    components: {
        FunctionButton,
        InspectorIcon
    },
    props: {
        debugPort: {
            type: String,
            required: true
        },
        position: {
            type: String,
            required: false,
            default: 'right'
        }
    },
    data() {
        return {
            debugPage: ''
        };
    },
    computed: {
        // Composed URL to either open the correct debugger or the overview page
        debugUrl() {
            return `http://localhost:${this.debugPort}${this.debugPage}`;
        },
        classes() {
            return ['button', 'button-'.concat(this.position)];
        }
    },
    async mounted() {
        // get all existing debugger instances
        let debuggerInstances = await fetch(`http://localhost:${this.debugPort}/json/list?t=${new Date().getTime()}`)
            .then(response => response.json());

        // when there is only 1 instance we open it (otherwise the list of all instances is displayed)
        if (debuggerInstances.length === 1) {
            this.debugPage = debuggerInstances[0].devtoolsFrontendUrl;
        }
    },
    methods: {
        openBrowser(url) {
            if (window.openBrowser) {
                window.openBrowser(url);
            } else {
                // eslint-disable-next-line no-console
                console.warn("No 'openBrowser'-browser function available");
            }
        }
    }
};
</script>

<template>
  <FunctionButton
    primary
    target="_blank"
    :class="classes"
    title="Open developer tools"
    @click="openBrowser(debugUrl)"
  >
    <InspectorIcon />
  </FunctionButton>
</template>

<style lang="postcss" scoped>
.button {
  position: fixed;
  bottom: 10px;
}

.button-right {
  right: 10px;
}

.button-left {
  left: 10px;
}
</style>
