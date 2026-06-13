<template>
  <div class="w-full max-w-6xl mx-auto px-4 py-8">
    <!-- HERO SECTION -->
    <div class="flex flex-col md:flex-row items-center gap-8 mb-12">
      <div class="flex-shrink-0">
        <img src="/img/agentsmith.png" alt="Agent Smith" width="200" height="200" class="rounded-lg" />
      </div>
      <div class="flex-1">
        <h1 class="text-3xl font-bold mb-2">Agent Smith</h1>
        <p class="text-xl text-gray-600 mb-4">Build AI agents that think, work, and remember</p>
        <p class="text-gray-500">
          A TypeScript framework for creating local-first AI agents with tool calling,
          semantic memory, and a powerful terminal client.
        </p>
      </div>
    </div>

    <!-- PREREQUISITES -->
    <div class="bg-gray-50 dark:secondary rounded-lg p-6 mb-10 border">
      <h2 class="text-lg font-semibold mb-3">Before you start</h2>
      <ul class="space-y-2 text-gray-700">
        <li class="flex items-center gap-2">
          <span class="text-green-500">✓</span>
          Node.js and npm installed
        </li>
        <li class="flex items-center gap-2">
          <span class="text-green-500">✓</span>
          A language model backend running: <a href="https://github.com/ggml-org/llama.cpp">Llama.cpp</a>, or any
          OpenAI-compatible server
        </li>
      </ul>
    </div>

    <!-- QUICKSTART PATH -->
    <div class="mb-10">
      <h2 class="text-2xl font-bold mb-2">Quickstart</h2>
      <p class="text-gray-500 mb-6">Get up and running in about 10 minutes</p>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:secondary border rounded-lg p-4">
          <div class="text-2xl font-bold text-blue-600 mb-2">1</div>
          <h3 class="font-semibold mb-1">Install the CLI</h3>
          <code class="text-sm bg-gray-100 dark:secondary px-2 py-1 rounded">npm i -g @agent-smith/cli</code>
        </div>
        <div class="bg-white dark:secondary border rounded-lg p-4">
          <div class="text-2xl font-bold text-blue-600 mb-2">2</div>
          <h3 class="font-semibold mb-1">Configure backend</h3>
          <code class="text-sm bg-gray-100 dark:secondary px-2 py-1 rounded">lm conf</code>
        </div>
        <div class="bg-white dark:secondary border rounded-lg p-4">
          <div class="text-2xl font-bold text-blue-600 mb-2">3</div>
          <h3 class="font-semibold mb-1">Create an agent</h3>
          <code class="text-sm bg-gray-100 dark:secondary px-2 py-1 rounded">YAML definition</code>
        </div>
        <div class="bg-white dark:secondary border rounded-lg p-4">
          <div class="text-2xl font-bold text-blue-600 mb-2">4</div>
          <h3 class="font-semibold mb-1">Run it</h3>
          <code class="text-sm bg-gray-100 dark:secondary px-2 py-1 rounded">lm my-agent "hello"</code>
        </div>
      </div>
      <div class="flex flex-row space-x-3">
        <button class="btn success text-lg px-8 py-3" @click="router.push('/terminal_client/quickstart')">
          Get Started with the terminal client
        </button>
        <button class="btn success text-lg px-8 py-3" @click="router.push('/frontend/quickstart')">
          Get Started with the frontend
        </button>
      </div>
    </div>

    <!-- EXAMPLE OUTPUT -->
    <div class="mb-10">
      <h2 class="text-2xl font-bold mb-2">What you'll build</h2>
      <p class="text-gray-500 mb-4">A shell agent that can execute commands in a sandboxed container</p>

      <div class="bg-gray-900 rounded-lg p-6 text-gray-100 font-mono text-sm overflow-x-auto">
        <div class="text-gray-400 mb-2"># Install the shell plugin</div>
        <div class="text-green-400">$ npm i -g @agent-smith/feat-shell</div>

        <div class="text-gray-400 mt-4 mb-2"># Create an agent YAML file</div>
        <div class="text-gray-300">
          <span class="text-purple-400">---</span>
        </div>
        <div class="text-gray-300">
          <span class="text-blue-400">description</span>: <span class="text-green-300">"Shell demo agent"</span>
        </div>
        <div class="text-gray-300">
          <span class="text-blue-400">prompt</span>: |-
        </div>
        <div class="text-gray-300 pl-4">
          <span class="text-green-300">"Execute the user's request"</span>
        </div>
        <div class="text-gray-300">
          <span class="text-blue-400">model</span>: <span class="text-green-300">"qwen4b"</span>
        </div>
        <div class="text-gray-300">
          <span class="text-blue-400">toolsList</span>:
        </div>
        <div class="text-gray-300 pl-4">
          - <span class="text-green-300">"shell"</span>
        </div>

        <div class="text-gray-400 mt-4 mb-2"># Run the agent</div>
        <div class="text-green-400">$ lm shell-demo "List files in current directory" --workspace .</div>

        <div class="text-yellow-400 mt-2">⚒️ Executing [shell-demo] shell { cmd: 'ls' }</div>
        <div class="text-gray-300 mt-1">
          total 24<br />
          drwxr-xr-x 5 user staff 160 Jun 1 10:00 .<br />
          -rw-r--r-- 1 user staff 412 Jun 1 10:00 README.md<br />
          -rw-r--r-- 1 user staff 102 Jun 1 10:00 package.json
        </div>
      </div>
    </div>

    <!-- WHAT YOU CAN DO -->
    <div class="mb-10">
      <h2 class="text-2xl font-bold mb-6">What you can do with the CLI</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="border rounded-lg p-5">
          <h3 class="font-semibold text-lg mb-2">🔍 Query LLMs</h3>
          <p class="text-gray-600 mb-2">Run quick inference queries with the <code>q</code> command</p>
          <code class="text-sm bg-gray-100 px-2 py-1 rounded">lm q "Explain quantum computing"</code>
        </div>
        <div class="border rounded-lg p-5">
          <h3 class="font-semibold text-lg mb-2">🤖 Create Agents</h3>
          <p class="text-gray-600 mb-2">Define YAML agents with prompts, models, and tools</p>
          <code class="text-sm bg-gray-100 px-2 py-1 rounded">lm agents</code>
        </div>
        <div class="border rounded-lg p-5">
          <h3 class="font-semibold text-lg mb-2">⚙️ Chain Workflows</h3>
          <p class="text-gray-600 mb-2">Build pipelines connecting actions and agents</p>
          <code class="text-sm bg-gray-100 px-2 py-1 rounded">lm workflow git-commit</code>
        </div>
        <div class="border rounded-lg p-5">
          <h3 class="font-semibold text-lg mb-2">🔧 Extend with Plugins</h3>
          <p class="text-gray-600 mb-2">Install plugins for git, shell, filesystem, search, and more</p>
          <code class="text-sm bg-gray-100 px-2 py-1 rounded">npm i -g @agent-smith/feat-*</code>
        </div>
      </div>
    </div>

    <!-- EXPLORE MORE -->
    <div class="mb-10">
      <h2 class="text-2xl font-bold mb-4">Explore the documentation</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button class="btn" @click="router.push('/terminal_client/agents/overview')">
          Agents
        </button>
        <button class="btn" @click="router.push('/terminal_client/actions')">
          Actions
        </button>
        <button class="btn" @click="router.push('/terminal_client/workflows')">
          Workflows
        </button>
        <button class="btn" @click="router.push('/plugins/overview')">
          Plugins
        </button>
      </div>
    </div>

    <!-- ARCHITECTURE OVERVIEW -->
    <div class="mb-10">
      <h2 class="text-2xl font-bold mb-2">How it works</h2>
      <p class="text-gray-500 mb-4">Understand the agent loop and architecture</p>
      <img src="/doc/agent-flow.png" alt="Agent flow diagram" class="rounded-lg border" />
      <div class="mt-4">
        <a href="javascript:openLink('/architecture/overview')" class="text-blue-600 hover:underline">
          Read the architecture overview →
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>
