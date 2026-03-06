<template>
  <div class="flex flex-col h-full">
    <!-- 顶部工具栏 -->
    <div class="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <h3 class="font-medium text-gray-700">调用栈</h3>
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
      </div>
    </div>

    <!-- 调用栈列表 -->
    <div class="flex-1 overflow-auto p-4">
      <div v-if="processedCallStack.length > 0" class="space-y-3">
        <div 
          v-for="(frame, index) in processedCallStack" 
          :key="index"
          :class="['border rounded-md overflow-hidden transition-all duration-300', index === 0 ? 'border-primary shadow-md' : 'border-gray-200']"
          :style="{ transform: `translateY(${index * 10}px)` }"
        >
          <!-- 栈帧头部 -->
          <div 
            class="bg-gray-50 px-4 py-2 flex items-center justify-between cursor-pointer"
            @click="toggleFrame(frame)"
          >
            <div class="flex items-center">
              <span class="text-gray-500 mr-2">{{ frame.expanded ? '▼' : '▶' }}</span>
              <span class="font-medium">{{ frame.function_name }}</span>
              <span class="text-gray-500 ml-2">[第{{ frame.line_number }}行]</span>
            </div>
            <div class="text-xs text-gray-500">
              帧 {{ callStack.length - index }}
            </div>
          </div>

          <!-- 栈帧内容 -->
          <div v-if="frame.expanded" class="p-4 bg-white">
            <!-- 局部变量 -->
            <div class="mb-3">
              <h4 class="text-sm font-medium text-gray-700 mb-2">局部变量</h4>
              <div class="space-y-1">
                <div 
                  v-for="(variable, varIndex) in frame.variables" 
                  :key="varIndex"
                  class="flex items-center text-sm"
                >
                  <span class="font-medium">{{ variable.name }}</span>
                  <span class="text-gray-500 ml-2">=</span>
                  <span class="ml-2">{{ variable.value }}</span>
                  <span class="ml-2 text-xs text-gray-400">({{ variable.type }})</span>
                </div>
                <div v-if="frame.variables.length === 0" class="text-sm text-gray-500">
                  无局部变量
                </div>
              </div>
            </div>

            <!-- 参数传递动画 -->
            <div v-if="index > 0" class="relative py-2">
              <div class="absolute left-1/2 top-0 h-full w-0.5 bg-gray-300"></div>
              <div class="flex justify-center">
                <div 
                  class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs"
                  :class="{ 'animate-pulse': frame.showParamAnimation }"
                >
                  参数传递
                </div>
              </div>
            </div>

            <!-- 返回状态 -->
            <div v-if="frame.return_value" class="mt-2 p-2 bg-green-50 rounded-md">
              <div class="text-sm">
                <span class="font-medium">返回值:</span>
                <span class="ml-2">{{ frame.return_value }}</span>
              </div>
            </div>
            <div v-else class="mt-2 p-2 bg-gray-50 rounded-md">
              <div class="text-sm text-gray-500">
                计算中...
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 py-4">
        调用栈为空
      </div>
    </div>

    <!-- 底部状态条 -->
    <div class="bg-gray-50 border-t border-gray-200 px-4 py-1 text-xs text-gray-500">
      栈深度: {{ processedCallStack.length }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { StackFrame } from '../types'

// Props
const props = defineProps<{
  callStack: StackFrame[]
}>()

// 状态
const expandedFrames = ref<Set<number>>(new Set())

// 计算属性
const processedCallStack = computed(() => {
  return props.callStack.map((frame, index) => ({
    ...frame,
    expanded: expandedFrames.value.has(index),
    showParamAnimation: false,
    return_value: null
  }))
})

// 方法
function toggleFrame(frame: any) {
  const index = props.callStack.indexOf(frame as StackFrame)
  if (index > -1) {
    if (expandedFrames.value.has(index)) {
      expandedFrames.value.delete(index)
    } else {
      expandedFrames.value.add(index)
    }
  }
}

function collapseAll() {
  expandedFrames.value.clear()
}

function expandAll() {
  props.callStack.forEach((_, index) => {
    expandedFrames.value.add(index)
  })
}

// 监听调用栈变化，模拟参数传递动画
watch(() => props.callStack, (newStack, oldStack) => {
  if (newStack.length > oldStack.length) {
    // 新栈帧被添加，模拟参数传递动画
    const newIndex = newStack.length - 1
    setTimeout(() => {
      const frame = processedCallStack.value[newIndex]
      if (frame) {
        frame.showParamAnimation = true
        setTimeout(() => {
          frame.showParamAnimation = false
        }, 1000)
      }
    }, 100)
  }
  // 重置展开状态
  expandedFrames.value.clear()
  if (newStack.length > 0) {
    expandedFrames.value.add(0) // 默认展开顶部栈帧
  }
}, { deep: true })
</script>

<style scoped>
/* 自定义样式 */
</style>
