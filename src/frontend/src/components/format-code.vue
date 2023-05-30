<template>
  <n-collapse accordion style="margin: 24px 0">
    <n-collapse-item title="Fomatted Code snippet - Javascript" name="javascript">
      <div class="code-wrapper">
        <n-code :hljs="hljs" :code="javascriptCode" language="javascript" show-line-numbers word-wrap />
      </div>
    </n-collapse-item>
  </n-collapse>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { NCollapse, NCollapseItem, NCode } from 'naive-ui';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

export default defineComponent({
  name: 'FormatCode',
  components: {
    NCollapse,
    NCollapseItem,
    NCode,
  },
  setup() {
    hljs.registerLanguage('javascript', javascript);
    const javascriptCode = ref(`
function responseFormatted(responseData) {
  const responseDataFormatted = { ...responseData };
  if (responseDataFormatted.result) {
    responseDataFormatted.result = parseJSON(responseDataFormatted.result) || responseDataFormatted.result;
    if (responseDataFormatted.result?.response) {
      let insideResponse = responseDataFormatted.result.response;
      insideResponse = window.atob(insideResponse);
      insideResponse = parseJSON(insideResponse) || insideResponse;
      responseDataFormatted.result.response = insideResponse;
    }
  }
  return responseDataFormatted;
}
        `);

    return {
      hljs,
      javascriptCode,
    };
  },
});
</script>
<style scoped>
.code-wrapper {
  padding: 24px;
  background-color: rgba(255, 255, 255, 0.1);
}

@media (prefers-color-scheme: light) {
  .code-wrapper {
    background-color: #eee;
  }
}
</style>
