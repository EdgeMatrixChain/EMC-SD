<template>
  <n-config-provider :theme="theme" :theme-overrides="overrideTheme">
    <!-- <n-theme-editor> </n-theme-editor> -->
    <n-loading-bar-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-dialog-provider>
            <App />
          </n-dialog-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
    <!-- <n-global-style /> -->
  </n-config-provider>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {
  NConfigProvider,
  NGlobalStyle,
  NLoadingBarProvider,
  NMessageProvider,
  NNotificationProvider,
  NDialogProvider,
  NThemeEditor,
  darkTheme,
  GlobalThemeOverrides,
} from 'naive-ui';

// import { useRouter, useRoute } from 'vue-router';
// import { initRouter, siteSetup } from './store'
import App from './App.vue';
export default defineComponent({
  name: 'AppSetup',
  components: {
    NConfigProvider,
    NGlobalStyle,
    NLoadingBarProvider,
    NMessageProvider,
    NNotificationProvider,
    NDialogProvider,
    NThemeEditor,
    App,
  },
  setup() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = ref(isDark ? darkTheme : null);
    const lightThemeOverrides: GlobalThemeOverrides = {
      common: {
        // primaryColor: '#000000',
      },
      Dropdown: {
        // color: 'rgb(16, 16, 20)',
      },
    };
    const darkThemeOverrides: GlobalThemeOverrides = {
      common: {
        // primaryColor: '#FFFF00',
      },
      Dropdown: {
        color: 'rgb(16, 16, 20)',
      },
    };
    const overrideTheme = ref(isDark ? darkThemeOverrides : lightThemeOverrides);
    return { theme, overrideTheme };
  },
});
</script>
