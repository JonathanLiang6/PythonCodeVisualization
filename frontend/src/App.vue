<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 class="text-xl font-bold text-primary">Python代码可视化工具</h1>
        <div class="flex items-center space-x-4">
          <button class="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors">
            新建文件
          </button>
          <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
            保存
          </button>
          <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors" @click="openShareDialog">
            分享
          </button>
        </div>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="flex-1 flex flex-col md:flex-row">
      <!-- 左侧代码编辑区 -->
      <div class="flex-1 border-r border-gray-200 flex flex-col">
        <!-- 编辑器工具栏 -->
        <div class="bg-white border-b border-gray-200 px-4 py-2 flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <button class="px-2 py-1 hover:bg-gray-100 rounded" @click="openTemplateDialog">
              <span class="text-sm">模板</span>
            </button>
            <button class="px-2 py-1 hover:bg-gray-100 rounded">
              <span class="text-sm">折叠/展开</span>
            </button>
            <button class="px-2 py-1 hover:bg-gray-100 rounded">
              <span class="text-sm">查找</span>
            </button>
          </div>
          <div class="ml-auto flex items-center">
            <span class="text-sm text-gray-500 mr-2">主题</span>
            <select 
              class="border border-gray-300 rounded px-2 py-1 text-sm"
              v-model="store.theme"
              @change="handleThemeChange"
            >
              <option value="light">明亮</option>
              <option value="dark">暗黑</option>
              <option value="high-contrast">高对比</option>
            </select>
          </div>
        </div>

        <!-- 代码编辑器 -->
        <div class="flex-1 relative">
          <div ref="editorRef" class="w-full h-full"></div>
        </div>

        <!-- 执行控制栏 -->
        <div class="bg-white border-t border-gray-200 px-4 py-3 flex items-center space-x-2">
          <button class="p-2 hover:bg-gray-100 rounded" title="首步" @click="handleStepFirst">
            <span>◀◀</span>
          </button>
          <button class="p-2 hover:bg-gray-100 rounded" title="上步" @click="handleStepPrev">
            <span>◀</span>
          </button>
          <button class="p-2 bg-primary text-white rounded" title="运行" @click="handleExecute">
            <span>▶</span>
          </button>
          <button class="p-2 hover:bg-gray-100 rounded" title="暂停" @click="handlePause">
            <span>⏸</span>
          </button>
          <button class="p-2 hover:bg-gray-100 rounded" title="下步" @click="handleStepNext">
            <span>▶</span>
          </button>
          <button class="p-2 hover:bg-gray-100 rounded" title="末步" @click="handleStepLast">
            <span>▶▶</span>
          </button>
          <button class="p-2 hover:bg-gray-100 rounded" title="重置" @click="handleReset">
            <span>↻</span>
          </button>

          <div class="ml-4 flex items-center space-x-2">
            <span class="text-sm text-gray-500">速度</span>
            <input type="range" min="0.5" max="4" step="0.1" :value="speed" @input="handleSpeedChange" class="w-32">
            <span class="text-sm text-gray-700">{{ speed.toFixed(1) }}×</span>
          </div>

          <div class="ml-auto flex items-center space-x-2">
            <span :class="['inline-block w-3 h-3 rounded-full', status_color]" :title="status_text"></span>
            <span class="text-sm text-gray-500">{{ status_text }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧可视化区 -->
    <div class="w-full md:w-1/3 border-l border-gray-200 flex flex-col">
        <!-- 标签页 -->
        <div class="bg-white border-b border-gray-200 flex">
          <button 
            class="flex-1 py-2 px-4 text-center font-medium" 
            :class="activeTab === 'variables' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'"
            @click="activeTab = 'variables'"
          >
            变量
          </button>
          <button 
            class="flex-1 py-2 px-4 text-center font-medium" 
            :class="activeTab === 'callstack' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'"
            @click="activeTab = 'callstack'"
          >
            调用栈
          </button>
          <button 
            class="flex-1 py-2 px-4 text-center font-medium" 
            :class="activeTab === 'memory' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'"
            @click="activeTab = 'memory'"
          >
            内存
          </button>
          <button 
            class="flex-1 py-2 px-4 text-center font-medium" 
            :class="activeTab === 'algorithm' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'"
            @click="activeTab = 'algorithm'"
          >
            算法
          </button>
        </div>

        <!-- 面板内容 -->
        <div class="flex-1 overflow-hidden">
          <VariablePanel v-if="activeTab === 'variables'" :variables="store.variables" />
          <CallStackPanel v-else-if="activeTab === 'callstack'" :callStack="store.call_stack" />
          <MemoryModelPanel v-else-if="activeTab === 'memory'" />
          <AlgorithmAnimationPanel v-else-if="activeTab === 'algorithm'" />

        </div>

      </div>
    </main>

    <!-- 底部状态栏 -->
    <footer class="bg-white border-t border-gray-200 px-4 py-2 text-sm text-gray-500">
      <div class="container mx-auto flex justify-between items-center">
        <div>Python 3.9</div>
        <div>行数: 10, 字符数: 200</div>
        <div>快捷键: F9 运行/暂停 | F10 上步 | F11 下步 | Esc 重置</div>
      </div>
    </footer>

    <!-- 代码模板对话框 -->
    <CodeTemplateDialog 
      :visible="templateDialogVisible"
      @close="closeTemplateDialog"
      @select="handleTemplateSelect"
    />

    <!-- 分享对话框 -->
    <ShareDialog 
      :visible="shareDialogVisible"
      :code="store.code"
      @close="closeShareDialog"
      @share="handleShare"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import * as monaco from 'monaco-editor'
import { useAppStore } from './stores/app'
import CodeTemplateDialog from './components/CodeTemplateDialog.vue'
import VariablePanel from './components/VariablePanel.vue'
import CallStackPanel from './components/CallStackPanel.vue'
import MemoryModelPanel from './components/MemoryModelPanel.vue'
import AlgorithmAnimationPanel from './components/AlgorithmAnimationPanel.vue'
import ShareDialog from './components/ShareDialog.vue'
import type { CodeTemplate } from './utils/codeTemplates'

const store = useAppStore()

const code = computed({
  get: () => store.code,
  set: (value) => store.setCode(value)
})

const speed = computed({
  get: () => store.speed,
  set: (value) => store.setSpeed(value)
})

const status_text = computed(() => store.status_text)
const status_color = computed(() => store.status_color)

const editorOptions = {
  theme: 'vs',
  fontSize: 14,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  minimap: {
    enabled: true
  },
  automaticLayout: true,
  glyphMargin: true, // 启用断点显示区域
  lineNumbers: 'on'
}

// 编辑器实例
const editorRef = ref<any>(null)
const editor = ref<any>(null)

// 模板对话框状态
const templateDialogVisible = ref(false)

// 标签页状态
const activeTab = ref('variables')

// 分享对话框状态
const shareDialogVisible = ref(false)

// 编辑器挂载后初始化
onMounted(() => {
  if (editorRef.value) {
    editor.value = monaco.editor.create(editorRef.value, {
      value: store.code,
      language: 'python',
      theme: 'vs',
      fontSize: 14,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      minimap: {
        enabled: true
      },
      automaticLayout: true,
      glyphMargin: true
    })

    // 监听编辑器内容变化
    editor.value.onDidChangeModelContent(() => {
      store.setCode(editor.value.getValue())
    })

    // 监听断点变化
    editor.value.onDidChangeBreakpoints((event: any) => {
      const breakpoints = event.breakpoints.map((bp: any) => bp.lineNumber)
      store.breakpoints = breakpoints
    })
  }
})

// 监听store中的代码变化
watch(() => store.code, (newCode) => {
  if (editor.value && editor.value.getValue() !== newCode) {
    editor.value.setValue(newCode)
  }
})

// 打开模板对话框
function openTemplateDialog() {
  templateDialogVisible.value = true
}

// 关闭模板对话框
function closeTemplateDialog() {
  templateDialogVisible.value = false
}

// 选择模板
function handleTemplateSelect(template: CodeTemplate) {
  store.setCode(template.code)
  closeTemplateDialog()
}

// 主题切换
function handleThemeChange() {
  if (editor.value) {
    const themeMap: Record<string, string> = {
      light: 'vs',
      dark: 'vs-dark',
      'high-contrast': 'hc-black'
    }
    monaco.editor.setTheme(themeMap[store.theme] || 'vs')
  }
}

// 打开分享对话框
function openShareDialog() {
  shareDialogVisible.value = true
}

// 关闭分享对话框
function closeShareDialog() {
  shareDialogVisible.value = false
}

// 处理分享
function handleShare(data: { code: string; permissions: string; includeCode: boolean; includeBreakpoints: boolean; includePlayback: boolean }) {
  // 实际项目中，这里应该调用后端API来分享代码
  console.log('分享数据:', data)
  // 可以添加分享成功的提示
  closeShareDialog()
}

function handleExecute() {
  store.executeCode()
}

function handlePause() {
  store.pauseExecution()
}

function handleReset() {
  store.resetExecution()
}

function handleStepFirst() {
  // 实现首步功能
  console.log('首步')
}

function handleStepPrev() {
  // 实现上步功能
  console.log('上步')
}

function handleStepNext() {
  // 实现下步功能
  console.log('下步')
}

function handleStepLast() {
  // 实现末步功能
  console.log('末步')
}

function handleSpeedChange(event: Event) {
  const target = event.target as HTMLInputElement
  store.setSpeed(parseFloat(target.value))
}

// 键盘快捷键支持
function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'F9':
      event.preventDefault()
      if (store.execution_status === 'running') {
        store.pauseExecution()
      } else {
        store.executeCode()
      }
      break
    case 'F10':
      event.preventDefault()
      handleStepPrev()
      break
    case 'F11':
      event.preventDefault()
      handleStepNext()
      break
    case 'Escape':
      event.preventDefault()
      store.resetExecution()
      break
  }
}

// 监听键盘事件
window.addEventListener('keydown', handleKeydown)
</script>

<style scoped>
/* 自定义样式 */
:deep(.breakpoint) {
  background-color: rgba(255, 0, 0, 0.1);
}

:deep(.breakpoint-glyph) {
  background-color: #ff0000;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 5px;
}
</style>
