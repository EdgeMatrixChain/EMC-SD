import { AxiosResponse, AxiosRequestConfig, Axios } from 'axios';

const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  POST_JSON: 'POST_JSON',
  POST_FORMDATA: 'POST_FORMDATA',
  DELETE: 'DELETE',
  PUT: 'PUT',
};

function FormData() {
  if (typeof window !== 'undefined' && window.FormData) {
    return window.FormData;
  } else {
    return require('form-data');
  }
}

class Http {
  constructor(config) {
    const opt = config || {};
    opt.timeout = opt.timeout || 600000;
    this.client = new Axios(opt);
    this.client?.interceptors.response.use(
      (response) => response,
      (error) => error.response || {}
    );
  }

  _formatOptions(method, options) {
    if (typeof options.data === 'object' && !(options.data instanceof FormData())) {
      const newData = {};
      Object.keys(options.data).forEach((key) => {
        if (options.data[key] !== void 0) {
          newData[key] = options.data[key];
        } else {
          console.info(`remove undefined attr:${key}`);
        }
      });
      options.data = newData;
    }

    if (typeof options.headers !== 'object') {
      options.headers = {};
    }

    if (method === HTTP_METHOD.GET) {
      options.method = 'GET';
      if (options.data) {
        options.params = options.data;
        options.paramsSerializer = {
          serialize: (params) =>
            Object.keys(params)
              .map((k) => `${k}=${params[k]}`)
              .join('&'),
        };
        delete options.data;
      }
    } else if (method === HTTP_METHOD.POST) {
      options.method = 'POST';
      options.headers['content-type'] = 'application/x-www-form-urlencoded';
      options.data = Object.keys(options.data)
        .map((key) => `${key}=${encodeURIComponent(options.data[key])}`)
        .join('&');
    } else if (method === HTTP_METHOD.POST_JSON) {
      options.method = 'POST';
      options.headers['content-type'] = 'application/json';
      options.data = typeof options.data === 'string' ? options.data : JSON.stringify(options.data);
    } else if (method === HTTP_METHOD.POST_FORMDATA) {
      options.method = 'POST';
      options.headers['content-type'] = 'multipart/form-data';
    } else if (method === HTTP_METHOD.DELETE) {
      options.method = 'DELETE';
      options.headers['content-type'] = 'application/json';
    } else if (method === HTTP_METHOD.PUT) {
      options.method = 'PUT';
      options.headers['content-type'] = 'application/json';
    }
    return options;
  }

  _handler() {
    return (response) => {
      if (response.status === 0) {
        return response;
      }
      const contentType = response.headers ? response.headers['content-type'] : '';
      if (contentType === 'application/json' && typeof response.data === 'string') {
        try {
          response.data = JSON.parse(response.data);
        } catch (e) {
          //try parse json with response.data failed
        }
      }
      return response;
    };
  }

  get(options) {
    const _opt = this._formatOptions(HTTP_METHOD.GET, options);
    return this.client?.request(_opt).then(this._handler());
  }

  post(options) {
    const _opt = this._formatOptions(HTTP_METHOD.POST, options);
    return this.client?.request(_opt).then(this._handler());
  }

  postFormData(options) {
    const _opt = this._formatOptions(HTTP_METHOD.POST_FORMDATA, options);
    return this.client?.request(_opt).then(this._handler());
  }

  postJSON(options) {
    const _opt = this._formatOptions(HTTP_METHOD.POST_JSON, options);
    return this.client?.request(_opt).then(this._handler());
  }

  delete(options) {
    const _opt = this._formatOptions(HTTP_METHOD.DELETE, options);
    return this.client?.request(_opt).then(this._handler());
  }

  put(options) {
    const _opt = this._formatOptions(HTTP_METHOD.PUT, options);
    return this.client?.request(_opt).then(this._handler());
  }
}

Http.getInstance = function () {
  if (!Http._instance) {
    Http._instance = new Http();
  }
  return Http._instance;
};

export { Http };
