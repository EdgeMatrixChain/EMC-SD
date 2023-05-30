<template>
  <n-space class="header" align="center" justify="space-between">
    <span class="title">{{ title }}</span>
    <template v-if="!isSignIn">
      <n-button strong secondary type="primary" :disabled="isLoading" @click="onPressSignIn" style="font-weight: bold">
        <template #icon>
          <n-icon size="20">
            <PersonCircleSharpIcon />
          </n-icon>
        </template>
        <span>Sign in EMC</span>
      </n-button>
    </template>
    <template v-else>
      <HeaderUser @menu="onUserMenu" />
    </template>
  </n-space>
  <n-modal v-model:show="isVisibleSignIn" :mask-closable="false">
    <SignIn @signin="onSignInSuccess" @cancel="onSignInCancel" />
  </n-modal>
  <n-modal v-model:show="isVisibleProfile" :mask-closable="false">
    <Profile @close="onProfileClose" />
  </n-modal>
</template>
<script lang="ts">
import { ref, defineComponent, h, computed, watch } from 'vue';
import { NSpace, NButton, NIcon, NModal, useMessage } from 'naive-ui';
import { PersonCircleSharp as PersonCircleSharpIcon, Hourglass as HourglassIcon } from '@vicons/ionicons5';
import SignIn from '@/components/signin.vue';
import Profile from '@/components/profile.vue';
import HeaderUser from '@/layout/app/header-user.vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/app';

export default defineComponent({
  components: {
    NSpace,
    NButton,
    NIcon,
    NModal,
    PersonCircleSharpIcon,
    HourglassIcon,
    SignIn,
    Profile,
    HeaderUser,
  },
  setup() {
    const message = useMessage();
    const router = useRouter();
    const userStore = useUserStore();
    const isLoading = ref(false);
    const isVisibleSignIn = ref(false);
    const isVisibleProfile = ref(false);
    const isSignIn = computed(() => userStore.user.privateKey);

    return {
      isLoading,
      isVisibleSignIn,
      isVisibleProfile,
      isSignIn,
      title: computed(() => userStore.title),
      nickname: computed(() => userStore.user.nickname),
      balance: computed(() => userStore.user.balance),
      onPressSignIn() {
        isVisibleSignIn.value = true;
      },
      onSignInSuccess() {
        isVisibleSignIn.value = false;
      },
      onSignInCancel() {
        isVisibleSignIn.value = false;
      },
      onUserMenu(key: string) {
        if (key === 'profile') {
          isVisibleProfile.value = true;
        } else if (key === 'exchange_emc') {
          message.warning('Coming soon', {
            icon: () => h(NIcon, null, { default: () => h(HourglassIcon) }),
          });
        } else if (key === 'sign_out') {
          userStore.logout();
          router.push({ name: 'home' });
        }
      },
      onProfileClose() {
        isVisibleProfile.value = false;
      },
    };
  },
});
</script>
<style scoped>
.header {
  padding: 0 24px;
  height: 80px;
  box-sizing: border-box;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

@media (prefers-color-scheme: light) {
}
</style>
