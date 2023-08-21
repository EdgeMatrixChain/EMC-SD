import { ref, h } from 'vue';
import { defineStore } from 'pinia';
import type { MenuOption } from 'naive-ui';
import { RouterLink } from 'vue-router';

type SiderMenuOption = {
  label: string;
  key: string;
  desc?: string;
  to?: any;
  children?: any[];
  extra?: any;
};

interface MenuItemRouterLink {
  key: string;
  label: string;
  to?: any;
}

interface MenuItemText {
  label: string;
}

function renderMenuItemText({ label }: MenuItemText) {
  return h('h4', {}, label);
}

function renderMenuItemLink({ label, to, key }: MenuItemRouterLink): MenuOption {
  return {
    key: key,
    label: () => h(RouterLink, { to }, { default: () => renderMenuItemText({ label }) }),
  };
}

export const useSiderStore = defineStore('sider', () => {
  const menus = ref<Array<any>>([]);
  const siderMenus = ref<Array<any>>([]);
  const loading = ref(false);
  return {
    menus,
    siderMenus,
    loading,
    initMenus(list: Array<SiderMenuOption>) {
      loading.value = true;
      menus.value = list;
      const _siderMenus: MenuOption[] = [];
      list.forEach((item: any, index: number) => {
        if (typeof item.to === 'object') {
          _siderMenus.push(renderMenuItemLink({ label: item.label, to: item.to, key: item.key }));
        } else if (Array.isArray(item.children)) {
          const menuChildren: MenuOption[] = [];
          item.children.forEach((item: any, index: number) => {
            if (typeof item.to === 'object') {
              menuChildren.push(renderMenuItemLink({ label: item.label, to: item.to, key: item.key }));
            }
          });
          _siderMenus.push({
            label: () => renderMenuItemText({ label: item.label }),
            key: item.key,
            children: menuChildren,
          });
        }
        // _siderMenus.push({
        //   key: `divider-${index}`,
        //   type: 'divider',
        //   props: { style: { marginLeft: '16px' } },
        // });
      });
      loading.value = false;
      siderMenus.value = _siderMenus;
    },
  };
});
