<template>
  <n-card style="width: 400px" :bordered="false" size="huge" role="dialog" aria-modal="true">
    <template #header>
      <n-h3 style="margin-bottom: 0">Enter the node id</n-h3>
    </template>
    <template #header-extra>
      <n-button quaternary type="info" @click.prevent.stop="onPressMoreNodes">More nodes</n-button>
    </template>
    <n-form ref="formRef" :model="formData" :rules="formRule">
      <n-form-item path="nodeId" label="Node ID" :show-label="false" style="margin-bottom: 16px">
        <n-input v-model:value="formData.nodeId" @keydown.enter.prevent />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="setting-footer">
        <n-button class="setting-footer-btn" :disabled="exeuting" @click="onPressCancel">Cancel</n-button>
        <n-button class="setting-footer-btn" type="primary" :loading="exeuting" @click="onPressSubmit"
          >Confirm</n-button
        >
      </div>
    </template>
  </n-card>
</template>
<script lang="ts">
import { genPrivateKey, addressWith } from '@edgematrixjs/util';
import { ref, defineComponent, defineProps, h, computed, Component } from 'vue';
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
  FormRules,
  FormItemRule,
  NIcon,
  NH3,
  useMessage,
} from 'naive-ui';
import { useNodeStore, useUserStore } from '@/stores/app';
import { useSiderStore } from '@/stores/sider';
import { Hourglass as HourglassIcon } from '@vicons/ionicons5';
type NodeSetting = {
  nodeId: string;
};
export default defineComponent({
  components: { NForm, NFormItem, NButton, NMenu, NInput, NCard, NTag, NModal, NH3, HourglassIcon },
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
    const formRule: FormRules = {
      nodeId: [
        {
          required: true,
          trigger: ['blur'],
          validator: (rule: FormItemRule, value: string) => {
            return new Promise<void>(async (resolve, reject) => {
              if (!value) {
                reject(Error('Can not be empty'));
                return;
              }
              const network = userStore.network;
              const nodeId = value;
              const { _result, data } = await nodeStore.queryNodeInfo(network, nodeId);
              if (_result !== 0) {
                reject(Error('Invalid node ID, no information was found'));
              } else {
                resolve();
              }
            });
          },
        },
      ],
    };
    const message = useMessage();
    const exeuting = ref(false);
    return {
      formRef,
      formData,
      formRule,
      exeuting,
      onPressMoreNodes() {
        message.warning('Coming soon', {
          icon: () => h(NIcon, null, { default: () => h(HourglassIcon) }),
        });
      },
      onPressCancel() {
        ctx.emit('cancel');
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
