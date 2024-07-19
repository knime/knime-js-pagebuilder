<script>
import packages from "@@/licenses/used-packages.json";

/**
 * Wrapper component that is built as a separate library. The purpose of this renderless
 * component is to provide access to the licenses of the PageBuilder. This component is
 * loaded by the WebPortal at the same time as the main PageBuilder library. The component
 * is registered with the global Vue instance, but is never intended to be rendered.
 */
export default {
  packages, // JSON packages created by the license-check tool from @knime/licenses
};
</script>

<template>
  <!-- Placeholder div; component is never rendered -->
  <div />
</template>
