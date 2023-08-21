<template>
  <router-view />
</template>

<script lang="ts">
import { onMounted, defineComponent, ref } from 'vue';
import { useLoadingBar, NSpin } from 'naive-ui';
import { loadingBarApiRef } from './routes/index';
import Layout from '@/layout/app/index.vue';
export default defineComponent({
  name: 'App',
  components: { Layout },
  setup() {
    const loadingBar = useLoadingBar();
    onMounted(async () => {
      loadingBarApiRef.value = loadingBar;
    });
    return {};
  },
});
</script>
<style scoped>
.loading {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
