<template>
  <n-card style="width: 400px" :bordered="false" size="huge" role="dialog" aria-modal="true">
    <template #header>
      <n-h3 style="margin-bottom: 0">Sign in to EMC</n-h3>
    </template>
    <template #header-extra>
      <n-button strong secondary circle class="signin-cancel" @click.stop.prevent="onPressCancel">
        <template #icon>
          <CloseIcon />
        </template>
      </n-button>
    </template>
    <n-form ref="formRef" :model="formData" :rules="formRule">
      <n-form-item path="privateKey" label="Private Key" :show-label="false" style="margin-bottom: 16px">
        <div style="width: 100%">
          <div class="n-form-item-label" style="align-items: center; justify-content: space-between">
            <label class="n-form-item-label--right-mark"
              ><span class="n-form-item-label__text">Private Key</span
              ><span class="n-form-item-label__asterisk">&nbsp;*</span></label
            >
          </div>
          <n-input v-model:value="formData.privateKey" @keydown.enter.prevent @blur="onBlurPrivateKey" />
        </div>
      </n-form-item>
      <n-form-item path="publicKey" label="Public Key (Address)" style="margin-bottom: 16px">
        <n-input
          v-model:value="formData.publicKey"
          placeholder="Please input private key"
          disabled
          @keydown.enter.prevent
        />
      </n-form-item>
    </n-form>
    <n-button class="signin-btn" type="primary" :loading="formSubmitting" @click.stop.prevent="onPressSubmit"
      >Sign in</n-button
    >
    <n-button class="signin-btn" ghost type="primary" @click.stop.prevent="onPressSubmitNew">
      Sign in with new private key
    </n-button>
  </n-card>
</template>
<script lang="ts">
import { genPrivateKey, addressWith } from '@edgematrixjs/util';
import { ref, defineComponent } from 'vue';
import {
  NH3,
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
  useMessage,
} from 'naive-ui';
import { Close as CloseIcon } from '@vicons/ionicons5';
import { useUserStore } from '@/stores/app';
type SignIn = {
  privateKey: string;
  publicKey: string;
};
export default defineComponent({
  components: { NH3, NForm, NFormItem, NButton, NMenu, NInput, NCard, NTag, NModal, CloseIcon },
  props: {
    privateKey: { type: String, default: '' },
    publicKey: { type: String, default: '' },
  },
  emits: ['cancel', 'signin'],
  setup(props, ctx) {
    const formRef = ref<FormInst | null>(null);
    const formData = ref<SignIn>({
      privateKey: props.privateKey,
      publicKey: props.publicKey,
    });
    const formRule: FormRules = {
      privateKey: [{ required: true, message: "Can't be empty", trigger: ['input', 'blur'] }],
      publicKey: [{ required: true, message: "Can't be empty", trigger: ['input', 'blur'] }],
    };
    const formSubmitting = ref(false);
    const message = useMessage();
    const userStore = useUserStore();
    const publicKeyWith = (privateKey: string): string => {
      try {
        return addressWith(privateKey);
      } catch (e) {
        return '';
      }
    };
    const handleSubmit = async () => {
      let privateKey = formData.value.privateKey;
      let publicKey = formData.value.publicKey;
      formSubmitting.value = true;
      const resp = await userStore.login({ privateKey, publicKey });
      formSubmitting.value = false;
      if (resp._result !== 0) return;
      ctx.emit('signin', { privateKey, publicKey });
    };

    return {
      formRef,
      formData,
      formRule,
      formSubmitting,
      onBlurPrivateKey() {
        if (formData.value.privateKey) {
          formData.value.publicKey = publicKeyWith(formData.value.privateKey);
        } else {
          formData.value.publicKey = '';
        }
      },
      onPressCancel() {
        ctx.emit('cancel');
      },
      async onPressSubmit() {
        try {
          await formRef.value?.validate();
          handleSubmit();
        } catch (errors) {
          console.info(errors);
        }
      },
      onPressSubmitNew: () => {
        formData.value.privateKey = genPrivateKey();
        formData.value.publicKey = publicKeyWith(formData.value.privateKey);
        handleSubmit();
      },
    };
  },
});
</script>
<style scoped>
.signin-btn {
  width: 100%;
  font-weight: bold !important;
}
.signin-btn:not(:last-child) {
  margin-bottom: 32px;
}
</style>
