<template>
  <n-layout has-sider position="absolute" style="min-width: 1280px">
    <n-layout-sider :width="400" content-style="padding: 24px;">
      <Sider />
    </n-layout-sider>
    <n-layout>
      <n-layout-header><Header /></n-layout-header>
      <n-layout-content content-style="padding: 24px;">
        <template v-if="ready">
          <router-view />
        </template>
        <template v-else>
          <div class="loading">
            <n-spin size="large" />
          </div>
        </template>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script>
import { ref, onMounted, defineComponent } from 'vue';
import { useLoadingBar, NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NSpin } from 'naive-ui';
import { loadingBarApiRef } from './routes/index';
import { useIsMobile } from './tools/composables';
import Sider from '@/layout/app/sider';
import Header from '@/layout/app/header';
import { useUserStore, useNodeStore } from './stores/app';
import { useSiderStore } from './stores/sider';
import { useRouter } from 'vue-router';
export default defineComponent({
  name: 'App',
  components: { NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, Sider, Header, NSpin },
  setup() {
    const ready = ref(false);
    const loadingBar = useLoadingBar();
    //is mobild
    const isMobileRef = useIsMobile();

    const router = useRouter();
    const userStore = useUserStore();
    const siderStore = useSiderStore();
    const nodeStore = useNodeStore();

    onMounted(async () => {
      let { user, nodeId } = userStore.setupLocalstorage();
      if (!nodeId) {
        nodeId = '16Uiu2HAm14xAsnJHDqnQNQ2Qqo1SapdRk9j8mBKY6mghVDP9B9u5';
        userStore.setNodeId(nodeId);
      }
      if (nodeId) {
        const menus = await nodeStore.init(userStore.network, nodeId);
        siderStore.initMenus(menus);
      } else {
        router.replace({ name: 'home' });
      }
      loadingBarApiRef.value = loadingBar;
      loadingBar.finish();
      ready.value = true;
    });
    return {
      ready,
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
