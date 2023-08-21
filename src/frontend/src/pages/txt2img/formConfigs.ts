

export const config = [
  { key: 'prompt', type: 'string', required: true, exposeKey: 'prompt', exposeRequired: true },
  { key: 'negativePrompt', type: 'string', exposeKey: 'negativePrompt', exposeRequired: true },
  { key: 'sampler', type: 'string', exposeKey: 'sampler' },
  { key: 'steps', type: 'number', exposeKey: 'steps' },
  { key: 'width', type: 'number', defaultValue: 512, exposeKey: 'width', exposeRequired: true },
  { key: 'height', type: 'number', defaultValue: 512, exposeKey: 'height', exposeRequired: true },
  { key: 'cfgScale', type: 'number', defaultValue: 7, exposeKey: 'cfgScale' },
  { key: 'seed', type: 'number', defaultValue: -1, exposeKey: 'seed' },
  { key: 'clipSkip', type: 'number', exposeKey: 'clipSkip' },
];
