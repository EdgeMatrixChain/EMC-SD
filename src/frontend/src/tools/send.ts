import { LegacyTransaction, Transaction } from '@edgematrixjs/tx';
import { addressWith, hexToBuffer, addHexPrefix } from '@edgematrixjs/util';
import { Http } from '@/tools/http';

const chainId = 2;
const debug = true;
const totallyWaitTime = 2000;

interface TelegramCountParameters {
  network: string;
  privateKey: string;
}

export const getTelegramCount = async (params: TelegramCountParameters) => {
  const { network, privateKey } = params;
  const address = addressWith(privateKey);
  const http = Http.getInstance();
  const nonceResp = await http.postJSON({
    url: network,
    data: { jsonrpc: '2.0', id: 1, method: 'edge_getTelegramCount', params: [address] },
  });
  return nonceResp.data?.result;
};

export const sendTelegram = async (params: TelegramParameters) => {
  const { network, nonce, peerId, privateKey, endpoint, input } = params;
  const http = Http.getInstance();

  if (debug) {
    console.info(`sendTelegram privateKey--->\n${privateKey}`);
    console.info(`sendTelegram publicKey--->\n${addressWith(privateKey)}`);
  }

  const preData = {
    peerId: peerId,
    endpoint: endpoint,
    Input: input === void 0 ? '' : input,
  };

  if (debug) {
    console.info(`sendTelegram pre data--->\n${JSON.stringify(preData)}`);
  }

  const transaction = new LegacyTransaction({
    nonce: nonce || '0x0',
    gasPrice: '0x0',
    gasLimit: '0x0',
    to: '0x0000000000000000000000000000000000003001',
    value: '0x0',
    data: Buffer.from(JSON.stringify(preData), 'utf-8'),
    chainId: chainId,
  });
  const signed = transaction.sign(hexToBuffer(privateKey));
  if (debug) {
    console.info(`sendTelegram signed to json--->\n${JSON.stringify(signed.toJSON())}`);
  }
  const serialized = signed.serialize();
  const hexSerialized = addHexPrefix(serialized.toString('hex'));
  const beforeTime = new Date().getTime();
  const teleResp = await http.postJSON({
    url: network,
    data: { jsonrpc: '2.0', id: 1, method: 'edge_sendRawTelegram', params: [hexSerialized] },
  });
  const diffTime = new Date().getTime() - beforeTime;
  const waitTime = totallyWaitTime - diffTime;
  if (waitTime > 0) {
    console.info(`waitting ${waitTime} times`);
    await new Promise<void>((resolve) => setTimeout(() => resolve(), waitTime));
  }

  if (!teleResp || !teleResp.data) {
    return { _result: 1, _desc: "It's network or server error" };
  }

  if (teleResp.data.error) {
    const error = teleResp.data.error;
    return { _result: 1, _desc: `Sorry, has some error: [${error.code}] ${error.message}` };
  }

  return { _result: 0, response: teleResp };
};
