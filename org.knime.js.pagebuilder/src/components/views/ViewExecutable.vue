<script>
import Button from '~/webapps-common/ui/components/Button';

export default {
    components: {
        Button
    }
};
</script>

<template>
  <div class="view-container">
    <p class="message">
      Please execute the node to see the preview again.
    </p>
    <!-- eslint-disable -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 93 93" stroke="#000" fill="none" stroke-linejoin="round">
      <path d="M82.667 15.4502H77.667V29.4012H82.667V15.4502Z" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M64.333 26.5078H59.333V32.2948H64.333V26.5078Z" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M64.333 23.6152H59.333V26.5082H64.333V23.6152Z" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M73.5 26.9312H68.5V32.2952H73.5V26.9312Z" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M82.667 10.3218H77.667V15.4498H82.667V10.3218Z" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M73.5 22.0898H68.5V26.9308H73.5V22.0898Z" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M82.667 29.4019H77.667V32.2949H82.667V29.4019Z" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M64.333 16.3691H59.333V23.6151H64.333V16.3691Z" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M85.0701 35.6782H56.9301" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M60 79.9998L70 69.9998V56.3848" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M83.615 70H70.142" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M70 83.6148C77.5194 83.6148 83.615 77.5191 83.615 69.9998C83.615 62.4804 77.5194 56.3848 70 56.3848C62.4807 56.3848 56.385 62.4804 56.385 69.9998C56.385 77.5191 62.4807 83.6148 70 83.6148Z" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M11.5 57V82" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M11 81.5H36" stroke-miterlimit="10" stroke-linejoin="round"/>
      <line stroke-linecap="round" x1="20" y1="62" x2="20" y2="62" transform="translate(x, y) scale(1.6)" stroke-width="1.5%"/>
      <line stroke-linecap="round" x1="30.5" y1="58.5" x2="30.5" y2="58.5" transform="translate(x, y) scale(1.6)" stroke-width="1.5%"/>
      <line stroke-linecap="round" x1="25.5" y1="64.5" x2="25.5" y2="64.5" transform="translate(x, y) scale(1.6)" stroke-width="1.5%"/>
      <line stroke-linecap="round" x1="33.5" y1="63.5" x2="33.5" y2="63.5" transform="translate(x, y) scale(1.6)" stroke-width="1.5%"/>
      <line stroke-linecap="round" x1="30.5" y1="67.5" x2="30.5" y2="67.5" transform="translate(x, y) scale(1.6)" stroke-width="1.5%"/>
      <line stroke-linecap="round" x1="20.5" y1="67.5" x2="20.5" y2="67.5" transform="translate(x, y) scale(1.6)" stroke-width="1.5%"/>
      <line stroke-linecap="round" x1="17.5" y1="71.5" x2="17.5" y2="71.5" transform="translate(x, y) scale(1.6)" stroke-width="1.5%"/>
      <line stroke-linecap="round" x1="14.5" y1="76.5" x2="14.5" y2="76.5" transform="translate(x, y) scale(1.6)" stroke-width="1.5%"/>
      <path d="M23 9.65283L8.966 19.8488L14.327 36.3468H31.673L37.034 19.8488L23 9.65283Z" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M37.034 19.8488L23 23.9248V9.65283" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M31.673 36.3471L23 23.9251L14.327 36.3471L8.966 19.8491L23 23.9251" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M23 15.6592L15.365 21.7082L17.884 31.2522L28.143 31.4882L34.522 20.5792L23 15.6592Z" stroke-miterlimit="10" stroke-linejoin="round"/>
      <line y1="46.5" x2="93" y2="46.5" />
      <line x1="46.5" y1="2.18557e-08" x2="46.5" y2="93" />
    </svg>
    <!-- eslint-enable -->
    <!-- TODO: UIEXT-110: Enable execute from view -->
    <Button
      with-border
      disabled
      title="Execute & save"
    >
      Execute & save
    </Button>
  </div>
</template>

<style lang="postcss" scoped>
.view-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  & > * {
    margin-block-start: 1em;
    margin-block-end: 1em;
  }

  & .message {
    font-size: 16px;
    line-height: 21px;
    font-weight: 300;
    color: var(--knime-masala);
  }

  & svg {
    max-height: 200px;
    max-width: 200px;
    stroke: var(--knime-gray-dark-semi);
  }
}
</style>