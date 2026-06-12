<template>
    <div>
        <div class="prosed">
            <h1>Usage</h1>
        </div>
        <div class="flex flex-col space-y-5 mt-5">
            <div>Let's initialize a persistent state object:</div>
            <div>
                <static-code-block :hljs="hljs" :code="code1" lang="ts"></static-code-block>
            </div>
            <div>Note: the interface definition is optional, it is used to get a better autocompletion in the IDE.</div>
            <div>To retrieve the persistent state from memory:</div>
            <div>
                <static-code-block :hljs="hljs" :code="code2" lang="ts"></static-code-block>
            </div>
            <div>Then render this in the template:</div>
            <div class="flex flex-col space-y-2">
                <div>Key1: {{ state.key1 }}</div>
                <div>Key2: {{ state.key2 }}</div>
                <div>Key3: {{ state.key3 }}</div>
            </div>
            <div>
                <static-code-block :hljs="hljs" :code="code3" lang="html"></static-code-block>
            </div>
            <div>Now let's change some values in the state and see how it persists:</div>
            <div>
                <static-code-block :hljs="hljs" :code="code4" lang="ts"></static-code-block>
            </div>
            <div>
                <button class="btn light" @click="mutateState()">Mutate</button>
            </div>
            <div>
                <static-code-block :hljs="hljs" :code="code5" lang="html"></static-code-block>
            </div>
            <div>Reload the page to see that the state changes will persist.</div>
        </div>
        <div class="pt-8">
            <a href="javascript:openLink('/transient_memory/api')">Next: api</a>
        </div>
    </div>
</template>

<script setup lang="ts">
import { hljs } from "@/conf.js";
import { StaticCodeBlock } from "@docdundee/vue";
import { useTmem } from "@agent-smith/tmem";
import { onBeforeMount, reactive } from "vue";

interface MyPersistentState {
    key1: string;
    key2: Array<number>;
    key3: Record<string, any>;
}

const initialData: MyPersistentState = {
    key1: "value1",
    key2: [0, 1],
    key3: { "k": "v" },
}

const tmem = useTmem<MyPersistentState>("mystate", initialData);

const state = reactive<MyPersistentState>(initialData);

async function init() {
    await tmem.init();
    state.key1 = await tmem.get("key1");
    state.key2 = await tmem.get("key2");
    state.key3 = await tmem.get("key3");
}

async function mutateState() {
    const key2 = await tmem.get<Array<number>>("key2");
    key2.push(1);
    await tmem.set("key2", key2);
    state.key2 = key2;
}

onBeforeMount(() => init())

const code1 = `import { useTmem } from "@agent-smith/tmem";

interface MyPersistentState {
    key1: string;
    key2: Array<number>;
    key3: Record<string, any>;
}

const initialData: MyPersistentState = {
    key1: "value1",
    key2: [0, 1],
    key3: { "k": "v" },
}

const tmem = useTmem<MyPersistentState>("mystate", initialData);`;

const code2 = `import { onBeforeMount, reactive } from "vue";

// ...

const state = reactive<MyPersistentState>(initialData);

async function init() {
    await tmem.init();
    state.key1 = await tmem.get("key1");
    state.key2 = await tmem.get("key2");
    state.key3 = await tmem.get("key3");
}

onBeforeMount(() => init())`;

const code3 = `<div class="flex flex-col space-y-2">
    <div>Key1: {{ state.key1 }}</div>
    <div>Key2: {{ state.key2 }}</div>
    <div>Key3: {{ state.key3 }}</div>s
</div>`;

const code4 = `async function mutateState() {
    const key2 = await tmem.get<Array<number>>("key2");
    key2.push(1);
    await tmem.set("key2", key2);
    state.key2 = key2;
}`;

const code5 = `<button class="btn light" @click="mutateState()">Mutate</button>`;
</script>
