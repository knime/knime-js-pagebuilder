<!-- This file is just a placeholder to demonstrate basic functionality -->

<script>
import DownloadIcon from '~/webapps-common/ui/assets/img/icons/arrow-download.svg?inline';
import ArrowsIcon from '~/webapps-common/ui/assets/img/icons/arrows-order.svg?inline';
import Button from '~/webapps-common/ui/components/Button';

export default {
    name: 'DemoFrame',
    components: {
        DownloadIcon,
        Button,
        ArrowsIcon
    },
    computed: {
        value() {
            return this.$store.state.pagebuilder.demo;
        }
    },
    methods: {
        setDemo() {
            this.$store.commit('pagebuilder/setDemo', Date.now());
        },
        messageParent() {
            this.$store.dispatch('pagebuilder/proxyToParent', 'Hello from pagebuilder');
            // same as
            // this.$store.dispatch('pagebuilder/outbound/messageToParent', 'Hello from pagebuilder');
        }
    }
};
</script>

<template>
  <div>
    <h2>PageBuilder</h2>
    Value from store: {{ value }}<br>
    <Button @click="setDemo"><DownloadIcon /> update own store</Button>
    <br>
    <Button @click="messageParent"><ArrowsIcon /> message outer app</Button>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

svg {
  display: inline-block;
  vertical-align: middle;
  width: 20px;
  height: 20px;
  stroke-width: calc(32px / 20);
  margin-right: 0.3em;
}

button:hover svg {
  stroke: var(--theme-color-3);
}
</style>
