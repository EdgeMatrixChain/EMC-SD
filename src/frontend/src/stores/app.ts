import { ref, h } from 'vue';
import { defineStore } from 'pinia';
import Utils from '@/tools/utils';
import { sendTelegram } from '@/tools/send';
import { genPrivateKey, addressWith } from '@edgematrixjs/util';

export const useUserStore = defineStore('user', () => {
  const title = ref('');
  const user = ref({
    privateKey: '',
    publicKey: '',
    nickname: '',
    avatar: '',
    balance: 0,
  });
  const network = ref('https://oregon.edgematrix.xyz');
  const peerId = ref('16Uiu2HAm14xAsnJHDqnQNQ2Qqo1SapdRk9j8mBKY6mghVDP9B9u5');
  const nodeList = ref<any[]>([]);
  const nodeStore = useNodeStore();
  return {
    user,
    title,
    network,
    peerId,
    nodeList,
    setTitle(str: string) {
      title.value = str;
    },
    async setNodeId(_nodeId: string) {
      Utils.setLocalStorage('emcsd.nodeid', _nodeId);
      peerId.value = _nodeId;
      // if (network.value && _nodeId && user.value.privateKey) {
      //   const menus = await nodeStore.init(network.value, _nodeId, user.value.privateKey);
      //   siderStore.initMenus(menus);
      // }
      return { _result: 0, nodeId: _nodeId };
    },
    async addNode(node: any) {
      const atNodeListIndex = nodeList.value.findIndex((item) => item.nodeId === node.nodeId);
      if (atNodeListIndex === -1) {
        nodeList.value.push({
          nodeId: node.nodeId,
          nodeName: Utils.formatAddress(node.nodeId, 6),
          modelName: node.modelName,
        });
        Utils.setLocalStorage('emcsd.nodelist', nodeList.value);
      }
    },
    async login(params = { privateKey: '', publicKey: '' }) {
      const privateKey = params.privateKey;
      const publicKey = params.publicKey;
      const nickname = Utils.formatAddress(params.publicKey);
      const avatar = '';
      const balance = 0;
      const _user = {
        privateKey,
        publicKey,
        nickname,
        avatar,
        balance,
      };
      Utils.setLocalStorage('emcsd.user', _user);
      user.value = _user;
      if (network.value && peerId.value && privateKey) {
        await nodeStore.init(network.value, peerId.value, privateKey);
      }
      return { _result: 0, user: _user };
    },
    logout() {
      const _user = {
        privateKey: '',
        publicKey: '',
        nickname: '',
        avatar: '',
        balance: 0,
      };
      Utils.removeLocalStorage('emcsd.user');
      user.value = _user;
      return { _result: 0, user: _user };
    },
    setupLocalstorage() {
      let _user = Utils.getLocalStorage('emcsd.user');
      if (!_user || _user === 'undefined' || _user === 'null') {
        const privateKey = genPrivateKey();
        const publicKey = addressWith(privateKey);
        const nickname = Utils.formatAddress(publicKey);
        const avatar = '';
        const balance = 0;
        _user = { privateKey, publicKey, nickname, avatar, balance };
        Utils.setLocalStorage('emcsd.user', _user);
      }
      if (_user) {
        user.value = _user;
      }
      const _nodeId: string = Utils.getLocalStorage('emcsd.nodeid');
      if (_nodeId) {
        peerId.value = _nodeId;
      }

      let _nodeList: any[] = Utils.getLocalStorage('emcsd.nodelist');
      if (!_nodeList) {
        const _d = [
          { nodeId: '16Uiu2HAm14xAsnJHDqnQNQ2Qqo1SapdRk9j8mBKY6mghVDP9B9u5', modelName: 'anythingMidjourneyV4' },
          { nodeId: '16Uiu2HAkwaui8LKmt4B9XkhB5ET5tbSApVB89awUvrXSfPh6KFy5', modelName: 'realisticVision' },
          // '16Uiu2HAkwaui8LKmt4B9XkhB5ET5tbSApVB89awUvrXSfPh6KFy5',
        ];
        _nodeList = _d.map((item) => ({
          nodeId: item.nodeId,
          nodeName: Utils.formatAddress(item.nodeId, 6),
          modelName: item.modelName,
        }));
      }
      nodeList.value = _nodeList;
      return { user: _user, nodeId: _nodeId, nodeList: _nodeList };
    },
  };
});

export const useNodeStore = defineStore('node', () => {
  //node info
  const name = ref('');
  const startUpTime = ref('');
  const runTime = ref('');
  const version = ref('');
  const tags = ref<any[]>([]);
  const sdModelName = ref('');
  const idl = ref<any[]>([]);
  const infoLoading = ref(false);
  const queryNodeInfo = async (_network: string, _nodeId: string, _privateKey?: string) => {
    const { _result, _desc, response } = await sendTelegram({
      network: _network,
      peerId: _nodeId,
      privateKey: _privateKey || genPrivateKey(),
      endpoint: '/info',
    });
    //response data
    let _name = '';
    let _startUpTime = '';
    let _runTime = '';
    let _version = '';
    let _tags: any[] = [];
    let _sdModelName = '';
    if (_result === 0) {
      const responseDataFormatted = Utils.responseFormatted(response.data);
      const { response: insideResponse } = responseDataFormatted.result || {};
      console.info(`/info response: `, insideResponse);
      const { name = '', startupTime = 0, uptime = 0, version = '', tag = '' } = insideResponse;
      _name = name;
      _startUpTime = startupTime ? new Date(startupTime).toUTCString() : '';
      _runTime = uptime ? `about ${Math.round(uptime / 1000 / 60)} minutes` : '';
      _version = version ? version : '';
      _tags = typeof tag === 'string' ? tag.split(',') : [];

      const { data: sdInfo } = await queryNodeSDInfo(_network, _nodeId, _privateKey);
      if (sdInfo && sdInfo.modelName) {
        _sdModelName = sdInfo.modelName;
      }
    }
    return {
      _result,
      data: {
        name: _name,
        startUpTime: _startUpTime,
        runTime: _runTime,
        version: _version,
        tags: _tags,
        sdModelName: _sdModelName,
      },
    };
  };

  const queryNodeSDInfo = async (_network: string, _nodeId: string, _privateKey?: string) => {
    const input: any = {
      path: '/sdapi/v1/options',
      method: 'GET',
      headers: [],
    };

    const { _result, _desc, response } = await sendTelegram({
      network: _network,
      peerId: _nodeId,
      nonce: '0x0',
      privateKey: genPrivateKey(),
      endpoint: '/api',
      input: input,
    });
    let info: any = {};
    if (_result === 0) {
      const responseDataFormatted = Utils.responseFormatted(response.data);
      const { response: insideResponse } = responseDataFormatted.result || {};
      console.info(`sd-info response: `, insideResponse);
      info = insideResponse || {};
      if (info.sd_model_checkpoint) {
        info.modelName = info.sd_model_checkpoint.split('.')[0];
      }
    }
    return { _result, data: info };
  };

  const queryNodeIDL = async (_network: string, _nodeId: string, _privateKey?: string) => {
    const { _result, _desc, response } = await sendTelegram({
      network: _network,
      peerId: _nodeId,
      privateKey: _privateKey || genPrivateKey(),
      endpoint: '/idl',
    });
    let _idl = [];
    if (_result === 0) {
      const responseDataFormatted = Utils.responseFormatted(response.data);
      const { response: insideResponse } = responseDataFormatted.result || {};
      console.info(`/idl response: `, insideResponse);
      if (Array.isArray(insideResponse)) {
        _idl = insideResponse;
      } else if (typeof insideResponse === 'object') {
        _idl = insideResponse.idl || [];
      }
    }
    return { _result, data: { idl: _idl } };
  };

  const convertMenusWithIDL = (idl: any[]): Array<any> => {
    const menus: Array<any> = [
      { label: 'Text -> Image', key: '/txt2img', desc: '', to: { name: 'txt2img' } },
      { label: 'Image -> Image', key: '/img2img', desc: '', to: { name: 'img2img' } },
    ];
    const menusMapper = {} as { [key: string]: any };
    menus.forEach((item: any) => {
      menusMapper[item.key] = item;
    });

    const idlMapper = {} as { [key: string]: any };

    idl.forEach((item) => {
      const { bundles, ...o } = item;
      if (!Array.isArray(bundles)) return;
      const bundle = bundles.find((bind: any) => bind.app === 'emc-icp-sd');
      if (bundle) {
        let bundleConfig: any = {};
        try {
          bundleConfig = JSON.parse(bundle.config);
        } catch (e) {}
        if (bundleConfig.menu) {
          idlMapper[bundleConfig.menu] = { ...o, __bundleConfig: bundleConfig };
        }
      }
    });
    menus.forEach((item: any) => {
      const idl = idlMapper[item.key];
      if (!idl) return;
      const mappings = idl.__bundleConfig?.mappings;
      if (!mappings) {
        console.warn(`ignore idl, because idl not define mappings `);
        return;
      }
      let bodyRaw = {};
      try {
        bodyRaw = JSON.parse(idl.rawExample);
      } catch (e) {}

      item.extra = {
        path: idl.path,
        method: idl.method,
        body: bodyRaw,
        mappings: mappings,
      };
    });
    return menus;
  };

  return {
    name,
    startUpTime,
    runTime,
    version,
    tags,
    sdModelName,
    idl,
    infoLoading,
    queryNodeInfo,
    async init(_network: string, _nodeId: string, _privateKey?: string) {
      infoLoading.value = true;
      const { data: nodeInfo } = await queryNodeInfo(_network, _nodeId, _privateKey);
      name.value = nodeInfo.name;
      startUpTime.value = nodeInfo.startUpTime;
      runTime.value = nodeInfo.runTime;
      version.value = nodeInfo.version;
      tags.value = nodeInfo.tags;
      sdModelName.value = nodeInfo.sdModelName;
      infoLoading.value = false;
    },
  };
});
