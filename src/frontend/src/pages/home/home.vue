<template>
  <div class="page">
    <!-- <template v-if="errorCode > 0">
      <div style="white-space: pre-wrap">{{ errorText }}</div>
    </template>
    <template v-if="errorCode === 0">
      <div class="info">
        <template v-if="isLoading">
          <n-spin size="large" />
        </template>
        <template v-else>
          <span>Please click the left menu to generate a picture</span>
        </template>
      </div>
    </template> -->
    <div class="info">
      <template v-if="isLoading">
        <n-spin size="large" />
      </template>
      <template v-else>
        <span>Please click the left menu to generate a picture</span>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { NH4, NTag, NSpin, NButton, NModal } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/app';

export default defineComponent({
  name: 'Home',
  components: {
    NH4,
    NTag,
    NSpin,
    NButton,
    NModal,
  },
  setup() {
    const isLoading = ref(false);
    const errorCode = ref(-1);
    const errorText = ref('');
    const userStore = useUserStore();
    onMounted(() => {
      let _errorCode = 0;
      let _errorText = 'Before you start, do the following: \n';
      let _errorMsgs = [];
      if (!userStore.user?.privateKey) {
        _errorCode = 1;
        _errorMsgs.push('Sign in');
      }
      if (!userStore.peerId) {
        _errorCode = 1;
        _errorMsgs.push('Set up the nodes');
      }
      errorCode.value = _errorCode;
      errorText.value = _errorCode > 0 ? `${_errorText}${_errorMsgs.join('\n')}` : '';
    });
    return {
      isLoading,
      errorCode,
      errorText,
    };
  },
});
</script>

<style scoped>
.info {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
