import mimes from 'mime-standard';
import { getImageMime } from 'base64-image-mime';

export const download = (fileURL = '', fileName = '') => {
  // for non-IE
  if (!window.ActiveXObject) {
    const save = document.createElement('a');
    save.href = fileURL;
    save.target = '_blank';
    save.download = fileName || `${new Date().getTime()}`;
    if (navigator.userAgent.toLowerCase().match(/(ipad|iphone|safari)/) && navigator.userAgent.search('Chrome') < 0) {
      document.location = save.href;
      // window event not working here
    } else {
      const evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false,
      });
      save.dispatchEvent(evt);
      (window.URL || window.webkitURL).revokeObjectURL(save.href);
    }
  }
  // for IE < 11
  else if (!!window.ActiveXObject && document.execCommand) {
    const _window = window.open(fileURL, '_blank');
    _window.document.close();
    _window.document.execCommand('SaveAs', true, fileName);
    _window.close();
  }
};

export const mime2ext = (mime) => {
  mime = mime.trim().toLowerCase();
  if (!mimes.hasOwnProperty(mime)) return '';
  return mimes[mime][0];
};

export const downloadBase64 = (base64) => {
  const mime = getImageMime(base64);
  const arr = base64.split(',');
  const bytes = atob(arr[1]);
  const ab = new ArrayBuffer(bytes.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mime });
  const url = URL.createObjectURL(blob);
  const preName = `${new Date().getTime()}`;
  const ext = mime2ext(mime);
  const fileName = ext ? `${preName}.${ext}` : preName;
  download(url, fileName);
  URL.revokeObjectURL(url);
};

export const fileToBase64 = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (evt) {
      resolve({ _result: 0, data: evt.target.result });
    };
    reader.onerror = function (evt) {
      resolve({ _result: 1, _desc: 'Cover to base64 failed' });
    };
    reader.readAsDataURL(file);
  });
};
