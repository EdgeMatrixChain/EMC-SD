export const format = (parameters: string) => {
  if (!parameters) {
    return {};
  }
  const data: { [k: string]: any } = {
    prompt: '',
    negativePrompt: '',
    steps: 0,
    sampler: '',
    width: 0,
    height: 0,
    cfgScale: 0,
    seed: '',
    clipSkip: 0,
  };
  const parametersArray = parameters.split('\n');
  let promptIndex = 0;
  let negativePromptIndex = -1;
  let optionsIndex = -1;
  parametersArray.forEach((line, index) => {
    if (line.startsWith('Negative prompt:')) {
      negativePromptIndex = index;
    } else if (line.startsWith('Steps')) {
      optionsIndex = index;
    }
  });
  if (parametersArray[promptIndex]) {
    data.prompt = parametersArray[promptIndex];
  }
  if (negativePromptIndex > -1) {
    data.negativePrompt = parametersArray[negativePromptIndex].replaceAll('Negative prompt: ', '');
  }

  if (optionsIndex > -1) {
    const options: { [k: string]: any } = {};
    parametersArray[optionsIndex].split(',').forEach((str: string) => {
      const strs = str.trim().split(':');
      if (strs.length === 2) {
        const k = strs[0].trim();
        const v = strs[1].trim();
        options[k] = v;
      }
    });
    const optionsSize = (options.Size || options.size || '0x0').split('x');
    const optionsWidth = parseInt(optionsSize[0]) || 0;
    const optionsHeight = parseInt(optionsSize[1]) || 0;
    data.steps = parseInt(options.Steps || options.steps) || 0;
    data.sampler = options.Sampler || options.sampler || '';
    data.width = optionsWidth;
    data.height = optionsHeight;
    data.cfgScale = parseFloat(options['CFG scale'] || options['cfg_scale'] || options['cfg scale']) || 0;
    data.seed = parseInt(options.Seed || options.seed) || -1;
    data.clipSkip = parseInt(options['Clip skip'] || options['clip_skip'] || options['clip skip']) || 0;
  }
  Object.entries(data).forEach(([k, v]) => {
    if (!v) {
      delete data[k];
    }
  });
  console.info(data);
  return data;
};
