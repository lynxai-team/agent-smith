# LocalLm Browser

Run models in the browser using [Wllama](https://github.com/ngxson/wllama)

## Install

```bash
npm i @locallm/browser
```

## Usage

Vuejs example:

```vue
<template>
  <div>
    {{ output }}
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { PromptTemplate } from 'modprompt';
import { LmBrowserProviderParams, OnLoadProgress, WllamaProvider } from '@locallm/browser';

const output = ref("");

const lm = WllamaProvider.init({
  onToken: (t) => { output.value = t },
} as LmBrowserProviderParams);
const model = {
  name: "Qween 0.5b",
  url: "https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF/resolve/main/qwen2-0_5b-instruct-q5_k_m.gguf",
  ctx: 32768,
}

const onModelLoading: OnLoadProgress = (st) => {
  console.log(st.percent, "%")
}

async function init() {
  await lm.loadBrowsermodel(model.name, model.url, model.ctx, onModelLoading);
  const p = new PromptTemplate("chatml")
    .replaceSystem("You are an AI assistant. Important: always use json to respond")
    .prompt("List the planets of the solar system.")
  const res = await lm.infer(
    p,
    { temperature: 0, min_p: 0.05 }
  );
  console.log(res.stats)
}

onMounted(() => init())
</script>
```