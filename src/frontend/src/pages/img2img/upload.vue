<template>
  <div class="upload">
    <n-upload @before-upload="onUploadImage">
      <n-upload-dragger style="padding: 0">
        <div class="upload-dragger" @click="onPressGround($event)">
          <template v-if="!value">
            <div class="upload-dragger-empty">
              <n-icon size="48" :depth="3">
                <ImageOutlineIcon />
              </n-icon>
              <n-p depth="3" style="margin: 0"> Click or drag images to this area</n-p>
            </div>
          </template>
          <template v-else>
            <div class="upload-dragger-result">
              <img class="upload-dragger-result-img" :src="value" />
              <div class="upload-dragger-result-tools">
                <n-button strong secondary round type="default" @click.prevent.stop="onPressRemove"> Remove </n-button>
              </div>
            </div>
          </template>
        </div>
      </n-upload-dragger>
    </n-upload>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { NP, NIcon, NButton, NUpload, NUploadDragger } from 'naive-ui';
import type { UploadFileInfo } from 'naive-ui';
import { ImageOutline as ImageOutlineIcon } from '@vicons/ionicons5';
import { downloadBase64, fileToBase64 } from '@/tools/download';

export default defineComponent({
  name: 'Upload',
  components: {
    NP,
    NIcon,
    NButton,
    NUpload,
    NUploadDragger,
    ImageOutlineIcon,
  },
  props: {
    //base64 string
    value: { type: String, default: '' },
  },
  emits: ['error', 'update:value'],
  setup(props, ctx) {
    return {
      async onUploadImage({ file: fileInfo, fileList }: { file: UploadFileInfo; fileList: UploadFileInfo[] }) {
        if (!fileInfo || !fileInfo.file) {
          ctx.emit('error', { _desc: 'File processing failed' } as UploadError);
          return false;
        }
        const file = fileInfo.file;
        if (file.size > 1024 * 400) {
          ctx.emit('error', { _desc: 'Maximum image size of 400KB.' } as UploadError);
          return false;
        }
        const SUPPORT_MIMES = ['image/png', 'image/jpg', 'image/jpeg'];
        const mime = SUPPORT_MIMES.find((mime) => mime === file.type);
        if (!mime) {
          const _desc = `Image-Mime [${file.type}] is not support, [${SUPPORT_MIMES.join(
            ' | '
          )}] is currently supported`;
          ctx.emit('error', { _desc } as UploadError);
          return false;
        }
        const { _result, _desc, data: base64 } = await fileToBase64(file);
        if (_result !== 0) {
          ctx.emit('error', { _desc } as UploadError);
          return false;
        }
        ctx.emit('update:value', base64);
        //return false to prevent component auto handling and upload
        return false;
      },
      onPressGround(event: MouseEvent) {
        if (props.value) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      onPressRemove() {
        ctx.emit('update:value', '');
      },
    };
  },
});
</script>
<style scoped>
.upload {
  width: 100%;
}
.upload-dragger {
  --padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 128px;
  padding: var(--padding);
  box-sizing: border-box;
}

.upload-dragger-result {
}
.upload-dragger-result-img {
  width: 100%;
}
.upload-dragger-result-tools {
  margin-top: var(--padding);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
