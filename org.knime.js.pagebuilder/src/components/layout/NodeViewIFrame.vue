<script>

export default {
    props: {
        webNode: {
            default: () => null,
            type: Object
        }
    },
    mounted() {
        const doc = this.$el.contentDocument;
        const body = doc.body;
        
        /* TODO inject ressources
        const jobId = this.$route.query.exec; // hack
        const head = doc.head;

        this.webNode.stylesheets.forEach(stylesheet => {
            const link = doc.createElement('link');
            link.setAttribute('type', 'style/css');
            link.href = `/${restApiURL}/${jobWebResources({ jobId, webResource: stylesheet })[0]}`;
            head.appendChild(link);
        });

        this.webNode.javascriptLibraries.forEach(lib => {
            const script = doc.createElement('script');
            script.src = `/${restApiURL}/${jobWebResources({ jobId, webResource: lib })[0]}`;
            head.appendChild(script);
        });
        */

        const text = doc.createElement('p');
        text.innerText = this.webNode.nodeInfo.nodeName;
        body.appendChild(text);
    }
};
</script>

<template>
  <iframe />
</template>
