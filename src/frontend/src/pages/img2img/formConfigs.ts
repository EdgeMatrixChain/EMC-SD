export const config = [
  { key: 'initImage', type: 'string', required: true, exposeKey: 'initImage', exposeRequired: true },
  { key: 'prompt', type: 'string', exposeKey: 'prompt', exposeRequired: true },
  { key: 'negativePrompt', type: 'string', exposeKey: 'negativePrompt', exposeRequired: true },
  { key: 'width', type: 'number', defaultValue: 512, exposeKey: 'width', exposeRequired: true },
  { key: 'height', type: 'number', defaultValue: 512, exposeKey: 'height', exposeRequired: true },
];
