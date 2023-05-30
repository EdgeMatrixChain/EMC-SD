<template>
  <n-dropdown :options="options" size="large" @select="onMenu">
    <div class="user-card">
      <n-icon size="48">
        <PersonCircleSharpIcon />
      </n-icon>
      <div class="user-card-body">
        <div class="user-card-body-row">
          <span>{{ nickname }}</span>
        </div>
        <div class="user-card-body-row">
          <div class="emc-balance">
            <div class="emc-balance-cell">
              <div class="icon-coin-wrapper">
                <img class="icon-coin" />
              </div>
              <span class="emc-balance-text">EMC</span>
            </div>
            <span style="font-size: 12px; font-weight: bold"> {{ balance }}</span>
          </div>
        </div>
      </div>
    </div>
  </n-dropdown>
</template>

<script lang="ts">
import { ref, defineComponent, h, computed, watch } from 'vue';
import { NDropdown, NIcon, DropdownOption, useMessage } from 'naive-ui';
import { PersonCircleSharp as PersonCircleSharpIcon } from '@vicons/ionicons5';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/app';

const dropdownOptions = [
{
    label: 'Your profile',
    key: 'profile',
  },
  {
    label: 'Exchange EMC',
    key: 'exchange_emc',
  },
  {
    key: 'footer-divider',
    type: 'divider',
  },
  {
    label: 'Sign out',
    key: 'sign_out',
  },
];

export default defineComponent({
  components: {
    NDropdown,
    NIcon,
    PersonCircleSharpIcon,
  },
  emits: ['menu'],
  setup(props, ctx) {
    const message = useMessage();
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();
    const isLoading = ref(false);
    const isSignIn = computed(() => userStore.user.privateKey);

    return {
      isLoading,
      isSignIn,
      options: dropdownOptions,
      title: computed(() => userStore.title),
      nickname: computed(() => userStore.user.nickname),
      balance: computed(() => userStore.user.balance),
      onMenu(key: string, item: DropdownOption) {
        ctx.emit('menu', key);
      },
      onSignInSuccess() {},
      onSignInCancel() {},
    };
  },
});
</script>
<style scoped>
.user-card {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 16px;
}
.user-card:hover {
  background-color: rgba(255, 255, 255, 0.09);
}
.user-card-body {
  flex: 1;
  margin-left: 8px;
}
.user-card-body-row {
  display: flex;
  align-items: center;
}
.user-card-body-row:not(:last-child) {
  margin-bottom: 4px;
}
.emc-balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.emc-balance-cell {
  display: flex;
  align-items: center;
}
.icon-coin-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  background-color: rgba(130, 130, 130, 0.1);
  margin-right: 4px;
}
.icon-coin {
  content: url('@/assets/icon_coin.png');
  width: 20px;
  height: 20px;
}
.emc-balance-text {
  font-size: 12px;
  font-weight: bold;
}

@media (prefers-color-scheme: light) {
  .user-card:hover {
    background-color: rgba(0, 0, 0, 0.09);
  }
}
</style>
