<script>
import PageBuilder from '../components/PageBuilder.vue';

export default {
    components: {
        PageBuilder
    },
    data() {
        return {
            actions: {
                messageToParent: (store, message) => {
                    this.content = `${message} — ${Date.now()}`;
                }
            },
            content: '(unset)'
        };
    }
};
</script>

<template>
  <div>
    <h1>PageBuilder Dev App</h1>
    <p>
      This webportal app simulator can be run with <code>npm run dev</code> and features hot reloading when any source
      file changes.
    </p>
    <p>
      Use <code>npm run dev-inte</code> to integrate with the dev mode of the <code>knime-webportal</code>
      project.
    </p>
    <p>
      See the README file for details.
    </p>
    <div class="frame">
      <PageBuilder :actions="actions" />
    </div>
    <p>
      message from PageBuilder: {{ content }}
    </p>
  </div>
</template>

<style lang="postcss">
body {
  font-family: "Roboto", "Arial", sans-serif;
  font-weight: 300;
}

.frame {
  border: 5px solid orange;
}
</style>
