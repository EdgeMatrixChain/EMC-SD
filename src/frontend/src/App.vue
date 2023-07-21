<template>
  <router-view />
</template>

<script>
import { ref, onMounted, defineComponent, nextTick } from 'vue';
import { useLoadingBar } from 'naive-ui';
import { loadingBarApiRef } from './routes/index';
import { useIsMobile } from './tools/composables';
import Layout from '@/layout/app/index';
export default defineComponent({
  name: 'App',
  components: { Layout },
  setup() {
    const loadingBar = useLoadingBar();
    const isMobileRef = useIsMobile();

    onMounted(async () => {
      loadingBarApiRef.value = loadingBar;
    });
    
    return {
      isMobile: isMobileRef,
    };
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
