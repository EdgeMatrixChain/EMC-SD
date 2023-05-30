<template>
  <template v-if="isLoading">
    <div class="sider-loading">
      <n-spin size="large" />
    </div>
  </template>
  <div class="global-card">
    <n-card>
      <n-descriptions label-placement="top" :column="1">
        <template #header> <img class="logo" /> </template>
        <n-descriptions-item>
          <template #label>
            <n-space align="center" :wrap-item="false" :size="[4, 0]">
              <img class="icon-network" />
              <span>Network</span>
            </n-space>
          </template>
          <span>{{ network }}</span>
        </n-descriptions-item>
        <n-descriptions-item>
          <template #label>
            <n-space align="center" justify="space-between" :wrap-item="false">
              <n-space align="center" :wrap-item="false" :size="[4, 0]" style="line-height: 1">
                <img class="icon-compower" />
                <span>EMC Node ID</span>
              </n-space>
              <n-button strong secondary circle @click.stop.prevent="onPressSetNode">
                <template #icon>
                  <RepeatSharpIcon />
                </template>
              </n-button>
            </n-space>
          </template>
          <span>{{ nodeId }}</span>
        </n-descriptions-item>
      </n-descriptions>
    </n-card>
    <n-card>
      <n-descriptions label-placement="top" :column="1">
        <template #header>
          <n-space align="center" :wrap-item="false" :size="[10, 0]">
            <n-icon size="28">
              <NodeIcon />
            </n-icon>
            <span style="font-weight: bold">Node Information</span>
          </n-space>
        </template>
        <template v-if="nodeName">
          <n-descriptions-item>
            <template #label>
              <template v-if="nodeSdModelId">
                <n-tag type="info" style="font-weight: bold">
                  <n-space align="center" :wrap-item="false" :size="[4, 0]">
                    <img class="icon-stablediffusion" />{{ nodeSdModelId }}
                  </n-space>
                </n-tag>
              </template>
              <template v-else>
                <n-tag type="error" style="font-weight: bold">No corresponding model was found</n-tag>
              </template>
            </template>
            <!-- <n-space align="center" :wrap-item="false" :size="[4, 10]" style="margin-top: 8px">
              <n-icon size="16">
                <TimeIcon />
              </n-icon>
              <span>It's running {{ nodeRunTime }}</span>
            </n-space> -->
          </n-descriptions-item>
        </template>
        <template v-else>
          <n-descriptions-item>
            <n-skeleton text :repeat="2" />
          </n-descriptions-item>
        </template>
      </n-descriptions>
    </n-card>
  </div>
  <n-menu
    :value="currentMenu"
    :default-expand-all="true"
    :options="siderMenus"
    :indent="16"
    :accordion="true"
    :watch-props="['defaultExpandedKeys']"
    @update:value="handleUpdateValue"
  />
  <div class="footer text-color-3">Power by Edge Matrix & Stable Diffusion</div>
  <n-modal v-model:show="isVisibleSettingNode" :mask-closable="false">
    <SettingNode @cancel="onSettingNodeCancel" @submit="onSettingNodeConfirm" />
  </n-modal>
</template>
<script lang="ts">
import { ref, defineComponent, h, computed, watch } from 'vue';
import {
  NDescriptions,
  NDescriptionsItem,
  NSpace,
  NButton,
  NSpin,
  NMenu,
  NCard,
  NTag,
  NModal,
  NIcon,
  NSkeleton,
  useMessage,
} from 'naive-ui';
import type { MenuOption } from 'naive-ui';
import { RepeatSharp as RepeatSharpIcon, GitMergeSharp as NodeIcon, TimeOutline as TimeIcon } from '@vicons/ionicons5';
import { useRouter, useRoute } from 'vue-router';
import { useSiderStore } from '@/stores/sider';
import { useUserStore, useNodeStore } from '@/stores/app';
import SettingNode from '@/components/setting-node.vue';

export default defineComponent({
  components: {
    NDescriptions,
    NDescriptionsItem,
    NSpace,
    NButton,
    NSpin,
    NMenu,
    NCard,
    NTag,
    RepeatSharpIcon,
    NModal,
    SettingNode,
    NIcon,
    NodeIcon,
    TimeIcon,
    NSkeleton,
  },
  setup() {
    const message = useMessage();
    const userStore = useUserStore();
    const nodeStore = useNodeStore();
    const siderStore = useSiderStore();
    const siderMenus = computed(() => siderStore.siderMenus);
    const isVisibleSettingNode = ref(false);
    const currentMenu = ref('');

    const isLoading = ref(false);

    const router = useRouter();
    const route = useRoute();

    watch(
      () => route.path,
      (path, oldVal) => {
        currentMenu.value = path;
      },
      { immediate: true }
    );

    return {
      currentMenu,
      siderMenus,
      isLoading,
      isVisibleSettingNode,
      network: computed(() => userStore.network),
      nodeId: computed(() => userStore.peerId),

      nodeName: computed(() => nodeStore.name),
      nodeStartUpTime: computed(() => nodeStore.startUpTime),
      nodeRunTime: computed(() => nodeStore.runTime),
      nodeVersion: computed(() => nodeStore.version),
      nodeTags: computed(() => nodeStore.tags),
      nodeSdModelId: computed(() => nodeStore.sdModelId),
      onPressSetNode() {
        isVisibleSettingNode.value = true;
      },
      onSettingNodeCancel() {
        isVisibleSettingNode.value = false;
      },
      async onSettingNodeConfirm({ nodeId }: any) {
        isVisibleSettingNode.value = false;
      },
      handleUpdateValue(key: string, item: MenuOption) {
        // console.info(key);
        // message.info('[onUpdate:value]: ' + JSON.stringify(key));
        // message.info('[onUpdate:value]: ' + JSON.stringify(item));
      },
    };
  },
});
</script>
<style scoped>
.sider-loading {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
}
.logo {
  content: url('@/assets/logo.png');
  width: 180px;
}
.icon-network {
  content: url('@/assets/icon_network.png');
  width: 20px;
  height: 20px;
  object-fit: cover;
}
.icon-compower {
  content: url('@/assets/icon_compower.png');
  width: 14px;
  height: 14px;
  margin-left: 4px;
  margin-right: 1px;
  object-fit: cover;
}
.icon-stablediffusion {
  content: url('@/assets/icon_stablediffusion.png');
  width: 16px;
  height: 16px;
  object-fit: cover;
}
.global-card {
  padding: 8px;
}
.global-card .n-card:not(:last-child) {
  margin-bottom: 24px;
}
.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

@media (prefers-color-scheme: light) {
  .logo {
    content: url('@/assets/logo.light.png');
  }
  .icon-network {
    content: url('@/assets/icon_network.light.png');
  }
  .icon-compower {
    content: url('@/assets/icon_compower.light.png');
  }
}
</style>
