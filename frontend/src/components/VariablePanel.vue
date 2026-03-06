<template>
  <div class="flex flex-col h-full">
    <!-- 顶部工具栏 -->
    <div class="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div class="relative">
        <input 
          type="text" 
          placeholder="搜索变量" 
          v-model="searchQuery"
          class="pl-8 pr-4 py-1.5 border border-gray-300 rounded-md w-48 text-sm"
        >
        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
      </div>
      <div class="flex space-x-2">
        <button 
          class="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          @click="collapseAll"
        >
          全部折叠
        </button>
        <button 
          class="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          @click="expandAll"
        >
          全部展开
        </button>
        <button 
          class="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          @click="exportSnapshot"
        >
          导出快照
        </button>
        <button 
          class="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          @click="toggleAnimations"
        >
          {{ animationsEnabled ? '关闭动画' : '开启动画' }}
        </button>
      </div>
    </div>

    <!-- 变量列表 -->
    <div class="flex-1 overflow-auto p-4">
      <div v-if="filteredVariables.length > 0" class="space-y-2">
        <div 
          v-for="(variable, index) in filteredVariables" 
          :key="variable.name + index"
          :class="['border rounded-md p-2 transition-all duration-300', variable.isNew ? 'bg-green-50' : variable.isChanged ? 'bg-yellow-50' : '']"
        >
          <div 
            class="flex items-center cursor-pointer"
            @click="toggleVariable(variable)"
          >
            <span class="text-gray-500 mr-2">{{ variable.expanded ? '▼' : '▶' }}</span>
            <span class="font-medium">{{ variable.name }}</span>
            <span class="text-gray-500 ml-2">=</span>
            <span class="ml-2">{{ variable.value }}</span>
            <span class="ml-2 text-xs text-gray-400">({{ variable.type }})</span>
            <span class="ml-2 text-xs" :class="getTypeIcon(variable.type)"></span>
          </div>
          <!-- 容器类型的子元素 -->
          <div 
            v-if="variable.expanded && isContainerType(variable.type) && variable.children"
            class="ml-6 mt-2 space-y-1"
          >
            <div 
              v-for="(child, childIndex) in variable.children" 
              :key="childIndex"
              class="border-l-2 border-gray-200 pl-3 py-1"
            >
              <div class="flex items-center">
                <span class="text-gray-500 mr-2">{{ child.expanded ? '▼' : '▶' }}</span>
                <span class="font-medium">{{ getChildKey(child) }}</span>
                <span class="text-gray-500 ml-2">=</span>
                <span class="ml-2">{{ child.value }}</span>
                <span class="ml-2 text-xs text-gray-400">({{ child.type }})</span>
                <span class="ml-2 text-xs" :class="getTypeIcon(child.type)"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 py-4">
        暂无变量
      </div>
    </div>

    <!-- 底部状态条 -->
    <div class="bg-gray-50 border-t border-gray-200 px-4 py-1 text-xs text-gray-500 flex items-center justify-between">
      <div>
        变量总数: {{ filteredVariables.length }}
        <span v-if="newVariablesCount > 0" class="ml-2 inline-flex items-center">
          <span class="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          新增: {{ newVariablesCount }}
        </span>
        <span v-if="changedVariablesCount > 0" class="ml-2 inline-flex items-center">
          <span class="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
          变更: {{ changedVariablesCount }}
        </span>
      </div>
      <div>
        深度: {{ maxDepth }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Variable } from '../types'

// Props
const props = defineProps<{
  variables: Variable[]
}>()

// 状态
const searchQuery = ref('')
const expandedVariables = ref<Set<string>>(new Set())
const animationsEnabled = ref(true)

// 计算属性
const filteredVariables = computed(() => {
  let variables = props.variables
  
  // 搜索过滤
  if (searchQuery.value) {
    variables = variables.filter(variable => 
      variable.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 添加展开状态和子元素
  return variables.map(variable => ({
    ...variable,
    expanded: expandedVariables.value.has(variable.name),
    children: getVariableChildren(variable),
    isNew: false, // 实际项目中需要根据状态变化判断
    isChanged: false // 实际项目中需要根据状态变化判断
  }))
})

const newVariablesCount = computed(() => {
  return props.variables.filter(v => (v as any).isNew).length
})

const changedVariablesCount = computed(() => {
  return props.variables.filter(v => (v as any).isChanged).length
})

const maxDepth = computed(() => {
  let depth = 1
  props.variables.forEach(variable => {
    const variableDepth = getVariableDepth(variable)
    if (variableDepth > depth) {
      depth = variableDepth
    }
  })
  return depth
})

// 方法
function isContainerType(type: string): boolean {
  return ['list', 'dict', 'set', 'tuple', 'object'].includes(type.toLowerCase())
}

function getTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'int': '🔢',
    'str': '📝',
    'bool': '✅',
    'float': '📊',
    'list': '📃',
    'dict': '🔑',
    'set': '🧮',
    'tuple': '📦',
    'object': '🎁'
  }
  return iconMap[type.toLowerCase()] || '📦'
}

function getVariableChildren(variable: Variable): any[] {
  if (!isContainerType(variable.type)) {
    return []
  }
  
  // 模拟子元素数据
  // 实际项目中，这里应该根据变量的实际结构生成子元素
  try {
    if (variable.type.toLowerCase() === 'list') {
      const value = JSON.parse(variable.value)
      if (Array.isArray(value)) {
        return value.map((item, index) => ({
          key: index,
          value: JSON.stringify(item),
          type: typeof item === 'object' ? 'object' : typeof item,
          expanded: false
        }))
      }
    } else if (variable.type.toLowerCase() === 'dict') {
      const value = JSON.parse(variable.value)
      if (typeof value === 'object' && value !== null) {
        return Object.entries(value).map(([key, item]) => ({
          key: key,
          value: JSON.stringify(item),
          type: typeof item === 'object' ? 'object' : typeof item,
          expanded: false
        }))
      }
    }
  } catch (e) {
    // 解析失败，返回空数组
  }
  
  return []
}

function getVariableDepth(variable: Variable, currentDepth: number = 1): number {
  if (!isContainerType(variable.type)) {
    return currentDepth
  }
  
  const children = getVariableChildren(variable)
  if (children.length === 0) {
    return currentDepth
  }
  
  let maxChildDepth = currentDepth
  children.forEach(child => {
    const childDepth = getVariableDepth(child, currentDepth + 1)
    if (childDepth > maxChildDepth) {
      maxChildDepth = childDepth
    }
  })
  
  return maxChildDepth
}

function getChildKey(child: any): string {
  return typeof child.key === 'number' ? `[${child.key}]` : `"${child.key}"`
}
</script>