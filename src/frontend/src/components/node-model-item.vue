<template>
  <n-tag type="info" style="font-weight: bold">
    <n-space align="center" :wrap-item="false" :size="[4, 0]">
      <img class="icon-stablediffusion" />{{ modelName }}
    </n-space>
  </n-tag>
</template>
<script lang="ts">
import { ref, defineComponent, computed } from 'vue';
import { NSpace, NTag } from 'naive-ui';
export default defineComponent({
  props: { modelName: { type: String, default: '' } },
  components: { NSpace, NTag },
});
</script>
<style scoped>
.icon-stablediffusion {
  content: url('@/assets/icon_stablediffusion.png');
  width: 16px;
  height: 16px;
  object-fit: cover;
}
</style>
