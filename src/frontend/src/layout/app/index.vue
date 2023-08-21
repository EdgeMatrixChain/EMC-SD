<template>
  <n-layout has-sider position="absolute" style="min-width: 1280px">
    <n-layout-sider :width="400" content-style="padding: 24px;">
      <Sider />
    </n-layout-sider>
    <n-layout>
      <n-layout-header>
        <Header />
      </n-layout-header>
      <n-layout-content content-style="padding: 24px;">
        <template v-if="ready">
          <router-view />
        </template>
        <template v-else>
          <div class="loading">
            <NSpin />
          </div>
        </template>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent, nextTick } from 'vue';
import { NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NSpin } from 'naive-ui';
import Sider from '@/layout/app/sider.vue';
import Header from '@/layout/app/header.vue';
import { useUserStore, useNodeStore } from '@/stores/app';
import { useRouter } from 'vue-router';
export default defineComponent({
  name: 'Layout',
  components: { NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, Sider, Header, NSpin },
  setup() {
    const ready = ref(false);
    const router = useRouter();
    const userStore = useUserStore();
    const nodeStore = useNodeStore();
    onMounted(async () => {
      let { user, nodeId } = userStore.setupLocalstorage();
      //useRoute() back route query is undefined
      let route = router.resolve(location.hash.substring(1));
      let _queryNodeId = route.query.nodeid;
      if (_queryNodeId) {
        nodeId = _queryNodeId as string;
      } else if (!nodeId) {
        nodeId = '16Uiu2HAm14xAsnJHDqnQNQ2Qqo1SapdRk9j8mBKY6mghVDP9B9u5';
      }
      userStore.setNodeId(nodeId);
      await nodeStore.init(userStore.network, nodeId, user.privateKey);

      ready.value = true;
    });
    return {
      ready,
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
