<template>
  <div class="w-full">
    <div class="flex flex-row">
      <div class="w-[400px] h-[300px]">
        <img src="/img/agentsmith.png" alt="" width="400" height="300" />
      </div>
      <div class="mt-12 flex flex-col w-[620px]">
        <div class="text-2xl">What Agent Smith can do:</div>
        <ul class="mt-8 list-disc space-y-2">
          <li><b>Think</b>: use language model servers to perform inference queries</li>
          <li><b>Work</b>: manage long running workflows with multiple tasks, using tools</li>
          <li><b>Remember</b>: use semantic memory to store data</li>
          <li><b>Interact</b>: perform interactions with the user</li>
        </ul>
      </div>
    </div>
    <div class="ml-8">
      <div class="flex flex-col items-start mt-5 space-y-5">
        <div class="text-xl">Quickstart</div>
        <div>
          Start here:<br /><button class="mt-5 btn success" @click="router.push('/terminal_client/quickstart')">Terminal
            client quick
            start</button>
        </div>
        <div class="text-xl">Agent loop</div>
        <div>
          <img src="/doc/agent-flow.png" alt="agent flow" />
        </div>
      </div>
      <div>
        <button class="mt-5 btn" @click="router.push('/terminal_client/quickstart')">Next: terminal client</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>