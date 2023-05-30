<template>
  <n-card style="width: 600px" :bordered="false" size="huge" role="dialog" aria-modal="true">
    <template #header>
      <n-h3 style="margin-bottom: 0">Please select a node</n-h3>
    </template>
    <template #header-extra>
      <n-button strong secondary circle class="signin-cancel" @click.stop.prevent="onPressCancel">
        <template #icon>
          <CloseIcon />
        </template>
      </n-button>
    </template>
    <n-spin :show="selecting">
      <n-list show-divider hoverable clickable>
        <!-- <template #header> <span style="font-weight: bold">History Nodes</span> </template> -->
        <template v-for="item in nodeList">
          <n-list-item @click.prevent.stop="onPressSelect(item)" style="padding:12px 8px;">
            <NodeModelItem :model-name="item.modelName" />
            <n-space align="center" :wrap-item="false" :size="[4, 0]" style="margin-top: 8px">
              <n-icon size="14">
                <NodeIcon />
              </n-icon>
              <span style="font-size: 12px">{{ item.nodeId }}</span>
            </n-space>
          </n-list-item>
        </template>
        <n-list-item style="padding:12px 4px;">
          <template v-if="isAddVisible">
            <n-form ref="formRef" :model="formData" inline>
              <n-form-item
                path="nodeId"
                label="Node ID"
                :show-label="false"
                :feedback="formFeedback.nodeId"
                style="width: 100%"
              >
                <n-input v-model:value="formData.nodeId" @keydown.enter.prevent placeholder="Enter the node id" />
              </n-form-item>
              <n-form-item :show-label="false" style="width: 120px">
                <n-space align="center" justify="end" :wrap-item="false" :size="[8, 0]" style="width: 100%">
                  <n-button strong secondary circle :disabled="exeuting" @click="onPressAddCancel"
                    ><template #icon>
                      <CloseOutline />
                    </template>
                  </n-button>
                  <n-button strong secondary circle :loading="exeuting" type="primary" @click="onPressAddConfirm"
                    ><template #icon>
                      <Checkmark />
                    </template>
                  </n-button>
                </n-space>
              </n-form-item>
            </n-form>
          </template>
          <template v-else>
            <n-a quaternary @click="onPressAdd"> Add news </n-a>
          </template>
        </n-list-item>
      </n-list>
    </n-spin>
    <!-- <template #footer>
      <div class="setting-footer">
        <n-button class="setting-footer-btn" :disabled="exeuting" @click="onPressCancel">Cancel</n-button>
        <n-button class="setting-footer-btn" type="primary" :loading="exeuting" @click="onPressSubmit"
          >Confirm</n-button
        >
      </div>
    </template> -->
  </n-card>
</template>
<script lang="ts">
import { ref, defineComponent, computed } from 'vue';
import {
  NForm,
  NFormItem,
  NButton,
  NInput,
  NMenu,
  NCard,
  NTag,
  NModal,
  FormInst,
  NIcon,
  NH3,
  NList,
  NListItem,
  NSpin,
  NSpace,
  NA,
  useMessage,
} from 'naive-ui';
import { useNodeStore, useUserStore } from '@/stores/app';
import { useSiderStore } from '@/stores/sider';
import {
  Hourglass as HourglassIcon,
  Close as CloseIcon,
  Checkmark,
  CloseOutline,
  GitMergeSharp as NodeIcon,
} from '@vicons/ionicons5';

import NodeModelItem from '@/components/node-model-item.vue';
type NodeSetting = {
  nodeId: string;
};
export default defineComponent({
  components: {
    NForm,
    NFormItem,
    NButton,
    NMenu,
    NInput,
    NCard,
    NTag,
    NModal,
    NH3,
    HourglassIcon,
    NList,
    NListItem,
    NSpin,
    NSpace,
    CloseIcon,
    Checkmark,
    CloseOutline,
    NA,
    NodeModelItem,
    NodeIcon,
    NIcon,
  },
  props: {
    nodeId: { type: String, default: '' },
  },
  emits: ['cancel', 'submit'],
  setup(props, ctx) {
    const userStore = useUserStore();
    const nodeStore = useNodeStore();
    const siderStore = useSiderStore();

    const formRef = ref<FormInst | null>(null);
    const formData = ref<NodeSetting>({
      nodeId: props.nodeId,
    });
    const formFeedback = ref<any>({
      nodeId: '',
    });
    const queryNodeInfo = (nodeId: string) => {
      const network = userStore.network;
      return nodeStore.queryNodeInfo(network, nodeId);
    };
    const message = useMessage();
    const exeuting = ref(false);
    const isAddVisible = ref(false);
    const selecting = ref(false);

    return {
      formRef,
      formData,
      formFeedback,
      exeuting,
      isAddVisible,
      selecting,
      nodeList: computed(() => userStore.nodeList),
      onPressAdd() {
        isAddVisible.value = true;
      },
      onPressAddCancel() {
        isAddVisible.value = false;
        formData.value.nodeId = '';
      },
      async onPressAddConfirm() {
        const nodeId = formData.value.nodeId;
        if (!nodeId) {
          formFeedback.value.nodeId = 'Can not be empty';
          return;
        }
        exeuting.value = true;
        const { _result, data: node } = await queryNodeInfo(nodeId);
        exeuting.value = false;
        if (_result !== 0) {
          formFeedback.value.nodeId = 'Invalid node, no information was found';
          return;
        }
        userStore.addNode({ nodeId, modelName: node.sdModelId });
        isAddVisible.value = false;
        formData.value.nodeId = '';
      },
      onPressCancel() {
        ctx.emit('cancel');
      },
      async onPressSelect(item: any) {
        const nodeId = item.nodeId;
        userStore.setNodeId(nodeId);
        selecting.value = true;
        const menus = await nodeStore.init(userStore.network, nodeId);
        selecting.value = false;
        siderStore.initMenus(menus);
        ctx.emit('submit', { nodeId });
      },
      async onPressSubmit() {
        try {
          exeuting.value = true;
          await formRef.value?.validate();
          const nodeId = formData.value.nodeId;
          userStore.setNodeId(nodeId);
          const menus = await nodeStore.init(userStore.network, nodeId);
          exeuting.value = false;
          siderStore.initMenus(menus);
          ctx.emit('submit', { nodeId });
        } catch (errors) {
          console.info(errors);
          exeuting.value = false;
        }
      },
    };
  },
});
</script>
<style scoped>
.setting-item-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.setting-item:not(:last-child) {
  margin-bottom: 16px;
}

.setting-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.setting-footer-btn:not(:last-child) {
  margin-right: 16px;
}
</style>
