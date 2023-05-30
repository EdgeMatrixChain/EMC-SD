<template>
  <div class="page">
    <template v-if="errorCode > 0">
      <span>{{ errorText }}</span>
    </template>
    <template v-else-if="errorCode === 0">
      <div class="page-forms">
        <n-card title="Generate image">
          <n-form ref="formRef" :model="formData">
            <n-form-item path="initImage" label="Init Image">
              <Upload v-model:value="formData.initImage" @error="onUploadError" />
            </n-form-item>
            <n-form-item path="prompt" label="Prompt">
              <n-input
                type="textarea"
                v-model:value="formData.prompt"
                placeholder="List the things you want in the image (e.g. bubbles,tank)"
                :autosize="true"
                style="min-height: 80px"
              />
            </n-form-item>
            <n-form-item path="negativePrompt" label="Negative Prompt">
              <n-input
                type="textarea"
                v-model:value="formData.negativePrompt"
                placeholder="List the things to remove from the image (e.g. fog, fingers)"
                :autosize="true"
                style="min-height: 40px"
              />
            </n-form-item>
            <n-form-item path="width" label="Width">
              <n-space vertical style="width: 100%">
                <n-slider v-model:value="formData.width" :min="128" :max="1024" :step="128" />
                <n-input-number v-model:value="formData.width" size="small" :min="128" :max="1024" :step="128" />
              </n-space>
            </n-form-item>
            <n-form-item path="height" label="Height">
              <n-space vertical style="width: 100%">
                <n-slider v-model:value="formData.height" :min="128" :max="1024" :step="128" />
                <n-input-number v-model:value="formData.height" size="small" :min="128" :max="1024" :step="128" />
              </n-space>
            </n-form-item>
          </n-form> 
          <n-space :wrap-item="false" :wrap="false" align="center" justify="center" :size="[24, 0]">
            <n-button :block="true" :disabled="isExeuting" @click="onPressReset" style="flex: 1">Reset</n-button>
            <template v-if="!privateKey">
              <n-button
                type="primary"
                :block="true"
                :loading="isExeuting"
                @click="isVisibleSignIn = true"
                style="flex: 1"
                >Sign in is required to generate image</n-button
              >
            </template>
            <template v-else>
              <n-button type="primary" :block="true" :loading="isExeuting" @click="onPressGenerate" style="flex: 1"
                >Generate image for free</n-button
              >
            </template>
          </n-space>
        </n-card>
      </div>
      <div class="page-results">
        <n-card title="Result">
          <div class="result-content">
            <template v-if="isExeuting">
              <div class="result-empty">
                <n-spin size="large" />
              </div>
            </template>
            <template v-else-if="insideResponseImage">
              <div class="result-img-wrapper">
                <img class="result-img" :src="insideResponseImage" />
                <div class="result-img-tools">
                  <n-button tertiary circle @click="onPressDownload">
                    <template #icon>
                      <n-icon size="14">
                        <CloudDownloadOutlineIcon />
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </div>
              <n-descriptions label-placement="top" :column="1">
                <n-descriptions-item>
                  <template #label>
                    <span>Response Information</span>
                  </template>
                  <span style="display: inline-block; white-space: pre-wrap">{{ insideResponseInfo }}</span>
                </n-descriptions-item>
              </n-descriptions>
            </template>
            <template v-else-if="insideResponseError">
              <n-alert :title="insideResponseError.title" type="error"> {{ insideResponseError.content }} </n-alert>
            </template>
            <template v-else>
              <div class="result-empty">
                <span class="text-color-3">
                  Please enter some content in the form and click the "Generate image" button to generate an image
                </span>
              </div>
            </template>
          </div>
        </n-card>
      </div>
    </template>
  </div>
  <n-modal v-model:show="isVisibleSignIn" :mask-closable="false">
    <SignIn @signin="isVisibleSignIn = false" @cancel="isVisibleSignIn = false" />
  </n-modal>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import {
  NText,
  NP,
  NIcon,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSpace,
  FormInst,
  NSlider,
  NInputNumber,
  NSpin,
  NDescriptions,
  NDescriptionsItem,
  NUpload,
  NUploadDragger,
  NUploadFileList,
  NUploadTrigger,
  NAlert,
  NModal,
  useMessage,
} from 'naive-ui';
import { useUserStore } from '@/stores/app';
import { sendTelegram } from '@/tools/send';
import { CloudDownloadOutline as CloudDownloadOutlineIcon, ImageOutline as ImageOutlineIcon } from '@vicons/ionicons5';
import Utils from '@/tools/utils';
import { downloadBase64 } from '@/tools/download';
import { getImageMime } from 'base64-image-mime';
import { useSiderStore } from '@/stores/sider';
import { useRoute } from 'vue-router';
import Upload from './upload.vue';
import SignIn from '@/components/signin.vue';
interface FormDataType {
  initImage: string;
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
}

export default defineComponent({
  name: 'Img2Img',
  components: {
    NText,
    NP,
    NIcon,
    NCard,
    NForm,
    NFormItem,
    NInput,
    NSlider,
    NInputNumber,
    NSpin,
    NButton,
    NSpace,
    NDescriptions,
    NDescriptionsItem,
    NUpload,
    NUploadDragger,
    NUploadFileList,
    NUploadTrigger,
    CloudDownloadOutlineIcon,
    ImageOutlineIcon,
    NAlert,
    NModal,
    Upload,
    SignIn,
  },
  setup() {
    const userStore = useUserStore();
    const message = useMessage();
    const errorCode = ref<number>(-1);
    const errorText = ref<string>('');
    const formRef = ref<FormInst | null>(null);
    const formData = ref<FormDataType>({
      initImage: '',
      prompt: '',
      negativePrompt: '',
      width: 512,
      height: 512,
    });
    const insideResponseImage = ref('');
    const insideResponseError = ref<any>(null);
    const insideResponseInfo = ref('');
    const isExeuting = ref(false);
    const isVisibleSignIn = ref(false);
    const apiConfig: any = {};
    const route = useRoute();
    const siderStore = useSiderStore();

    watch(
      () => siderStore.menus,
      (menus, oldVal) => {
        const menu = menus.find((m) => m.key === route.path);
        if (menu && menu.extra) {
          const { path, method, body, mappings } = menu.extra;
          apiConfig.path = path;
          apiConfig.method = method;
          apiConfig.body = { ...body };
          apiConfig.mappings = { ...mappings };
          errorCode.value = 0;
          errorText.value = '';
        } else {
          errorCode.value = 1;
          errorText.value = 'Not found api config';
        }
      },
      { immediate: true }
    );

    return {
      errorCode,
      errorText,
      privateKey: computed(() => userStore.user?.privateKey),
      formRef,
      formData,
      insideResponseImage,
      insideResponseError,
      insideResponseInfo,
      isExeuting,
      isVisibleSignIn,
      onUploadError({ _desc }: UploadError) {
        message.error(_desc);
      },
      onPressReset() {
        formData.value.initImage = '';
        formData.value.prompt = '';
        formData.value.negativePrompt = '';
        formData.value.width = 512;
        formData.value.height = 512;
      },
      async onPressGenerate() {
        const initImage = formData.value.initImage;
        const prompt = formData.value.prompt;
        const negativePrompt = formData.value.negativePrompt;
        const width = formData.value.width * 1 || 512;
        const height = formData.value.height * 1 || 512;

        const network = userStore.network;
        const peerId = userStore.peerId;
        const privateKey = userStore.user.privateKey;
        if (!privateKey) {
          message.error('Please sigin first');
          return;
        }
        if (!prompt) {
          //error
        }
        const body: any = apiConfig.body;
        const initImageKey = apiConfig.mappings['initImage'];
        body[initImageKey] = [initImage];
        const promptKey = apiConfig.mappings['prompt'];
        body[promptKey] = prompt;
        const negativePromptKey = apiConfig.mappings['negativePrompt'];
        body[negativePromptKey] = negativePrompt;
        const widthKey = apiConfig.mappings['width'];
        body[widthKey] = width;
        const heightKey = apiConfig.mappings['height'];
        body[heightKey] = height;
        console.info(`request body: `, body);
        const input: any = {
          path: apiConfig.path,
          method: apiConfig.method,
          headers: [],
          body: body,
        };
        insideResponseImage.value = '';
        insideResponseError.value = null;
        insideResponseInfo.value = '';
        isExeuting.value = true;
        const { _result, _desc, response } = await sendTelegram({
          network,
          peerId,
          privateKey,
          endpoint: '/api',
          input: input,
        });
        isExeuting.value = false;
        if (_result !== 0) {
          const error = { title: 'Error', content: _desc };
          insideResponseError.value = error;
          message.error(_desc || '');
          return;
        }
        const teleRespData = response.data;
        const teleRespDataFormatted = Utils.responseFormatted({ ...response.data });
        console.info('/api response:', teleRespDataFormatted);
        const insideResponse = teleRespDataFormatted?.result?.response;
        if (insideResponse.error || insideResponse.errors) {
          const error = {
            title: insideResponse.error,
            content: insideResponse.errors,
          };
          insideResponseError.value = error;
          message.error(`${insideResponse.error}\n${insideResponse.errors}`);
        } else if (!Array.isArray(insideResponse?.images) || !insideResponse?.images?.length) {
          const error = {
            title: 'Error',
            content: 'Invalid response data',
          };
          insideResponseError.value = error;
          message.error(`${error.content}`);
        } else if (insideResponse?.images?.length > 0) {
          const mime = getImageMime(insideResponse.images[0]) || 'image/png';
          insideResponseImage.value = `data:${mime};base64,${insideResponse.images[0]}`;
          const _insideResponseInfo = Utils.parseJSON(insideResponse.info) || {};
          if (_insideResponseInfo.infotexts?.length > 0) {
            insideResponseInfo.value = _insideResponseInfo.infotexts[0];
          } else {
            insideResponseInfo.value = insideResponse.info;
          }
        }
      },
      onPressDownload() {
        downloadBase64(insideResponseImage.value);
      },
    };
  },
});
</script>

<style scoped>
.page {
  min-height: 80vh;
  display: flex;
}
.page-forms {
  width: 560px;
  min-width: 400px;
  margin-right: 24px;
}

.page-results {
  flex: 1;
}

.result-content {
  min-height: 562px;
}

.result-empty {
  min-height: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-img-wrapper {
  width: 60%;
  min-width: 300px;
  position: relative;
}

.result-img {
  width: 100%;
  min-width: 300px;
}

.result-img-tools {
  position: absolute;
  z-index: 1;
  right: 0;
  top: 0;
  padding: 4px;
  display: none;
  background-color: rgba(0, 0, 0, 0.1);
}
.result-img-wrapper:hover .result-img-tools {
  display: inline-block;
}

@media (prefers-color-scheme: light) {
  .result-img-tools {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
