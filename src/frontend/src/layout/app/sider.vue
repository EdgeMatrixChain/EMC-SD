<template>
  <div class="sider">
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
          <template v-if="nodeInfoLoading">
            <n-descriptions-item>
              <n-skeleton text :repeat="2" />
            </n-descriptions-item>
          </template>
          <template v-else>
            <n-descriptions-item>
              <template #label>
                <template v-if="nodeSdModelName">
                  <NodeModelItem :model-name="nodeSdModelName" />
                </template>
                <template v-else>
                  <n-tag type="error" style="font-weight: bold">No model was found</n-tag>
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
        </n-descriptions>
      </n-card>
    </div>
    <!-- <div class="sider-body">
      <template v-if="siderMenusLoading">
        <n-skeleton text :repeat="2" />
      </template>
      <template v-else>
        <n-menu
          :value="currentMenu"
          :default-expand-all="true"
          :options="siderMenus"
          :indent="16"
          :accordion="true"
          :watch-props="['defaultExpandedKeys']"
          @update:value="handleUpdateValue"
        />
      </template>
    </div> -->
    <div class="footer text-color-3">
      <n-button strong secondary round @click="onPressGitHub">
        <template #icon>
          <n-icon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#a)">
                <path
                  d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12Z"
                  fill="currentColor"
                ></path>
              </g>
              <defs>
                <clipPath id="a"><path fill="#fff" d="M0 0h24v24H0z"></path></clipPath>
              </defs>
            </svg>
          </n-icon>
        </template>
        GitHub
      </n-button>
      <span>Power by Edge Matrix & Stable Diffusion</span>
    </div>
    <n-modal v-model:show="isVisibleSettingNode" :mask-closable="false">
      <SettingNode @cancel="onSettingNodeCancel" @submit="onSettingNodeConfirm" />
    </n-modal>
  </div>
</template>
<script lang="ts">
import { ref, defineComponent, computed, watch } from 'vue';
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
import { useRoute } from 'vue-router';
import { useUserStore, useNodeStore } from '@/stores/app';
import SettingNode from '@/components/setting-node.vue';
import NodeModelItem from '@/components/node-model-item.vue';

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
    NodeModelItem,
  },
  setup() {
    const message = useMessage();
    const userStore = useUserStore();
    const nodeStore = useNodeStore();
    const isVisibleSettingNode = ref(false);
    const currentMenu = ref('');

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
      isVisibleSettingNode,
      network: computed(() => userStore.network),
      nodeId: computed(() => userStore.peerId),
      nodeInfoLoading: computed(() => nodeStore.infoLoading),
      nodeName: computed(() => nodeStore.name),
      nodeStartUpTime: computed(() => nodeStore.startUpTime),
      nodeRunTime: computed(() => nodeStore.runTime),
      nodeVersion: computed(() => nodeStore.version),
      nodeTags: computed(() => nodeStore.tags),
      nodeSdModelName: computed(() => nodeStore.sdModelName),
      onPressGitHub() {
        window.open('https://github.com/EMCProtocol-dev/EMC-SD');
      },
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
.global-card {
  padding: 8px;
}
.global-card .n-card:not(:last-child) {
  margin-bottom: 24px;
}
.footer {
  display: flex;
  flex-direction: column;
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
