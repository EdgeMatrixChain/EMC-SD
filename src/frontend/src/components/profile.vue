<template>
  <n-card style="width: 400px" :bordered="false" size="huge" role="dialog" aria-modal="true">
    <template #cover>
      <div class="avatar-wrapper">
        <div class="avatar">
          <n-icon size="80">
            <PersonCircleSharpIcon />
          </n-icon>
        </div>
        <div class="close-wrapper">
          <n-button strong secondary circle class="signin-cancel" @click.stop.prevent="onPressClose">
            <template #icon>
              <CloseIcon />
            </template>
          </n-button>
        </div>
      </div>
    </template>
    <n-descriptions label-placement="top" :column="1">
      <n-descriptions-item>
        <template #label> Nickname </template>
        <span>{{ user.nickname }}</span>
      </n-descriptions-item>
      <n-descriptions-item>
        <template #label> Private key </template>
        <span>{{ user.privateKey }}</span>
      </n-descriptions-item>
      <n-descriptions-item>
        <template #label> Public Key </template>
        <span>{{ user.publicKey }}</span>
      </n-descriptions-item>
      <n-descriptions-item>
        <template #label> EMC Balance </template>
        <span>{{ user.balance }}</span>
      </n-descriptions-item>
    </n-descriptions>
  </n-card>
</template>
<script lang="ts">
import { ref, defineComponent, defineProps, h, computed, Component } from 'vue';
import { NDescriptions, NDescriptionsItem, NH3, NButton, NCard, NIcon } from 'naive-ui';
import { Close as CloseIcon, PersonCircleSharp as PersonCircleSharpIcon } from '@vicons/ionicons5';
import { useUserStore } from '@/stores/app';
export default defineComponent({
  components: {
    NH3,
    NDescriptions,
    NDescriptionsItem,
    NButton,
    NCard,
    NIcon,
    CloseIcon,
    PersonCircleSharpIcon,
  },
  emits: ['close'],
  setup(props, ctx) {
    const userStore = useUserStore();
    return {
      user: computed(() => userStore.user),
      onPressClose() {
        ctx.emit('close');
      },
    };
  },
});
</script>
<style scoped>
.avatar-wrapper {
  padding-top: 60%;
  position: relative;
}

.avatar {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.close-wrapper {
  position: absolute;
  top: 24px;
  right: 24px;
}
</style>
