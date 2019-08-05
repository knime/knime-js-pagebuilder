<script>
export default {
    name: 'DemoFrame',
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
    <button @click="setDemo">update own store</button><br>
    <button @click="messageParent">message outer app</button>
  </div>
</template>

<style lang="postcss" scoped>
</style>
