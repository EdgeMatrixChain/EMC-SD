<template>
  <div class="page">
    <template v-if="errorCode === 1">
      <span style="margin-right: 4px">{{ errorText }}</span>
      <n-a @click="onPressRefresh"> refresh </n-a>
    </template>
    <template v-else-if="errorCode > 0">
      <span>{{ errorText }}</span>
    </template>
    <template v-else-if="errorCode === 0">
      <div class="page-forms">
        <n-card title="Generate image">
          <n-form ref="formRef" :model="formData">
            <n-grid :cols="24" :x-gap="24">
              <n-form-item-gi :span="24" path="prompt" label="Prompt">
                <n-input
                  type="textarea"
                  v-model:value="formData.prompt"
                  placeholder="List the things you want in the image (e.g. bubbles,tank)"
                  :autosize="true"
                  style="min-height: 140px"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="24" path="negativePrompt" label="Negative Prompt">
                <n-input
                  type="textarea"
                  v-model:value="formData.negativePrompt"
                  placeholder="List the things to remove from the image (e.g. fog, fingers)"
                  :autosize="true"
                  style="min-height: 80px"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="24" path="sampler" label="Sampler">
                <n-select
                  v-model:value="formData.sampler"
                  label-field="label"
                  value-field="val"
                  placeholder="Select"
                  :options="samplerOptions"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="24" path="steps" label="Steps">
                <n-space vertical style="width: 100%">
                  <n-slider v-model:value="formData.steps" :min="1" :max="150" :step="1" />
                  <n-input-number v-model:value="formData.steps" size="small" :min="1" :max="150" :step="1" />
                </n-space>
              </n-form-item-gi>
              <n-form-item-gi :span="12" path="width" label="Width">
                <n-space vertical style="width: 100%">
                  <n-slider v-model:value="formData.width" :min="128" :max="1024" :step="128" />
                  <n-input-number v-model:value="formData.width" size="small" :min="128" :max="1024" :step="128" />
                </n-space>
              </n-form-item-gi>
              <n-form-item-gi :span="12" path="height" label="Height">
                <n-space vertical style="width: 100%">
                  <n-slider v-model:value="formData.height" :min="128" :max="1024" :step="128" />
                  <n-input-number v-model:value="formData.height" size="small" :min="128" :max="1024" :step="128" />
                </n-space>
              </n-form-item-gi>
              <n-form-item-gi :span="24" path="seed" label="Seed">
                <n-input-number
                  v-model:value="formData.seed"
                  size="small"
                  :min="-1"
                  :max="99999999999"
                  :step="1"
                  style="width: 100%"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="12" path="cfgScale" label="CFG Scale">
                <n-space vertical style="width: 100%">
                  <n-slider v-model:value="formData.cfgScale" :min="1" :max="30" :step="0.5" />
                  <n-input-number v-model:value="formData.cfgScale" size="small" :min="1" :max="30" :step="0.5" />
                </n-space>
              </n-form-item-gi>
              <n-form-item-gi :span="12" path="clipSkip" label="Clip Skip">
                <n-space vertical style="width: 100%">
                  <n-slider v-model:value="formData.clipSkip" :min="0" :max="10" :step="1" />
                  <n-input-number v-model:value="formData.clipSkip" size="small" :min="0" :max="10" :step="1" />
                </n-space>
              </n-form-item-gi>
            </n-grid>
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
import { defineComponent, onMounted, onUnmounted, ref, watch, computed } from 'vue';
import {
  NA,
  NIcon,
  NCard,
  NGrid,
  NForm,
  NFormItem,
  NFormItemGi,
  NInput,
  NButton,
  NSpace,
  FormInst,
  NSlider,
  NSelect,
  NInputNumber,
  NSpin,
  NDescriptions,
  NDescriptionsItem,
  useMessage,
  NModal,
  NAlert,
} from 'naive-ui';
import { useUserStore } from '@/stores/app';
import { sendTelegram } from '@/tools/send';
import { CloudDownloadOutline as CloudDownloadOutlineIcon } from '@vicons/ionicons5';
import Utils from '@/tools/utils';
import { downloadBase64 } from '@/tools/download';
import { getImageMime } from 'base64-image-mime';
import SignIn from '@/components/signin.vue';
import { txt2img as txt2imgConfig } from '@/apiConfig';
import { sampler as samplerOptions } from './options';
import { config as formConfigs } from './formConfigs';
import { format as parametersFormat } from '@/tools/parameters';
import { genPrivateKey } from '@edgematrixjs/util';
interface FormDataType {
  prompt: string | null;
  negativePrompt: string | null;

  sampler: string; //sampler_index
  steps: number; //steps

  width: number;
  height: number;
  cfgScale: number; //cfg_scale

  seed: number; //seed
  clipSkip: number; //clip_skip
  // modelHash:string;
  [k: string]: any;
}

interface PostMessageRequest {
  type: string;
  data: any;
}

export default defineComponent({
  name: 'Txt2Img',
  components: {
    NA,
    NIcon,
    NCard,
    NGrid,
    NForm,
    NFormItem,
    NFormItemGi,
    NInput,
    NSlider,
    NSelect,
    NInputNumber,
    NSpin,
    NButton,
    NSpace,
    NDescriptions,
    NDescriptionsItem,
    NAlert,
    CloudDownloadOutlineIcon,
    NModal,
    SignIn,
  },
  setup() {
    const userStore = useUserStore();
    const message = useMessage();
    const errorCode = ref<number>(-1);
    const errorText = ref<string>('');
    const formRef = ref<FormInst | null>(null);
    const formData = ref<FormDataType>({
      prompt: '',
      negativePrompt: '',
      sampler: samplerOptions[0].val,
      steps: 20,
      width: 512,
      height: 512,
      cfgScale: 7,
      seed: -1,
      clipSkip: 0,
    });
    // const formData = ref<FormDataType>({
    //   prompt:
    //     'deconstruction of self, Neon futurism, hyperrealistic surrealism, dreamscape, award winning masterpiece with incredible details, liminal space, highly detailed,Cleveland Ohio, cinematic ,rim lighting ,octane render, wvebg1, bganidusk',
    //   negativePrompt:
    //     '(low quality, worst quality:1.4), (bad anatomy), (inaccurate limb:1.2), bad composition, inaccurate eyes, extra digit, fewer digits, (extra arms:1.2)',
    //   sampler: 'DPM++ 2M Karras',
    //   steps: 30,
    //   width: 512,
    //   height: 682,
    //   cfgScale: 7,
    //   seed: 1674451477',
    //   clipSkip: 0,
    // });
    const insideResponseImage = ref('');
    const insideResponseError = ref<any>(null);
    const insideResponseInfo = ref('');
    const isExeuting = ref(false);
    const isVisibleSignIn = ref(false);
    const apiConfig: any = {};

    const handleWindowMessage = (event: MessageEvent) => {
      const request: PostMessageRequest = event.data as PostMessageRequest;
      if (request.type === 'emcsd-txt2img-parameters' && request.data) {
        const data: { [k: string]: any } = parametersFormat(request.data);
        Object.entries(data).forEach(([k, v]) => {
          if (v) {
            formData.value[k] = v;
          }
        });
      }
    };

    onMounted(async () => {
      const { path, method, body, mappings } = txt2imgConfig;
      apiConfig.path = path;
      apiConfig.method = method;
      apiConfig.body = { ...body };
      apiConfig.mappings = { ...mappings };

      errorCode.value = 0;
      errorText.value = '';

      if (window.opener) {
        window.opener.postMessage({ type: 'emcsd-txt2img-ready' }, '*');
      }

      window.addEventListener('message', handleWindowMessage);
    });

    onUnmounted(() => {
      window.removeEventListener('message', handleWindowMessage);
    });

    return {
      errorCode,
      errorText,
      privateKey: computed(() => userStore.user?.privateKey),
      samplerOptions,
      formRef,
      formData,
      insideResponseImage,
      insideResponseError,
      insideResponseInfo,
      isExeuting,
      isVisibleSignIn,
      onPressRefresh() {
        window.location.reload();
      },
      onPressReset() {
        formData.value.prompt = '';
        formData.value.negativePrompt = '';
        formData.value.width = 512;
        formData.value.height = 512;
      },
      async onPressGenerate() {
        const network = userStore.network;
        const peerId = userStore.peerId;
        const privateKey = userStore.user?.privateKey;
        if (!privateKey) {
          message.error('Please sigin first');
          return;
        }

        const errors: string[] = [];
        const body: any = apiConfig.body;

        formConfigs.forEach((item) => {
          let value = formData.value[item.key];
          //set default value
          if (!value && typeof item.defaultValue !== 'undefined') {
            value = item.defaultValue;
          }
          //is required
          if (item.required && !value) {
            errors.push(`${item.key} can not be empty`);
          }
          let exposeKey = apiConfig.mappings[item.exposeKey];
          if (item.exposeRequired && !exposeKey) {
            errors.push(`expose key '${item.exposeKey}' is empty`);
          }
          body[exposeKey] = value;
        });

        if (errors.length > 0) {
          message.error(errors.join(', '));
          return;
        }

        console.info(body);

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
          nonce: '0x0',
          privateKey: genPrivateKey(),
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
        const teleRespData = response.data || {};
        const teleRespDataFormatted = Utils.responseFormatted({ ...teleRespData });
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
  width: 32vw;
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
}
.result-img-wrapper:hover .result-img-tools {
  display: inline-block;
}
</style>
./options ../../tools/parameters ./formConfigs
