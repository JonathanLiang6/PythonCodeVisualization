<template>
  <div class="flex flex-col h-full">
    <!-- 顶部工具栏 -->
    <div class="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <h3 class="font-medium text-gray-700">内存模型</h3>
      <div class="flex space-x-2">
        <button 
          class="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          @click="toggleView"
        >
          {{ viewMode === 'logical' ? '切换到地址视图' : '切换到逻辑视图' }}
        </button>
        <button 
          class="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          @click="zoomIn"
        >
          放大
        </button>
        <button 
          class="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          @click="zoomOut"
        >
          缩小
        </button>
      </div>
    </div>

    <!-- 内存模型图 -->
    <div class="flex-1 overflow-auto p-4">
      <!-- 内存分区 -->
      <div class="relative border border-gray-200 rounded-lg overflow-hidden">
        <!-- 栈区 -->
        <div class="bg-blue-50 border-b border-gray-200 p-4">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-blue-700">栈区</h4>
            <span class="text-xs text-gray-500">地址: 0x0000 - 0x7FFF</span>
          </div>
          <div class="space-y-2">
            <div 
              v-for="(variable, index) in stackVariables" 
              :key="index"
              class="bg-white border border-gray-200 rounded-md p-2 flex items-center justify-between"
            >
              <div class="flex items-center">
                <span class="font-medium">{{ variable.name }}</span>
                <span class="text-gray-500 ml-2">:</span>
                <span class="ml-2">{{ variable.value }}</span>
              </div>
              <div class="text-xs text-gray-500">
                {{ variable.address }}
              </div>
            </div>
          </div>
        </div>

        <!-- 堆区 -->
        <div class="bg-orange-50 border-b border-gray-200 p-4">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-orange-700">堆区</h4>
            <span class="text-xs text-gray-500">地址: 0x8000 - 0xFFFF</span>
          </div>
          <div class="space-y-2">
            <div 
              v-for="(object, index) in heapObjects" 
              :key="index"
              class="bg-white border border-gray-200 rounded-md p-2 flex items-center justify-between"
              :class="{ 'border-red-500': object.isCircular }"
            >
              <div class="flex items-center">
                <span class="font-medium">{{ object.type }}</span>
                <span class="text-gray-500 ml-2">:</span>
                <span class="ml-2">{{ object.value }}</span>
                <span v-if="object.isCircular" class="ml-2 text-red-500 text-xs">
                  🔴 循环引用
                </span>
              </div>
              <div class="text-xs text-gray-500">
                {{ object.address }}
              </div>
            </div>
          </div>
        </div>

        <!-- 常量区 -->
        <div class="bg-green-50 p-4">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-green-700">常量区</h4>
            <span class="text-xs text-gray-500">地址: 0x10000 - 0x17FFF</span>
          </div>
          <div class="space-y-2">
            <div 
              v-for="(constant, index) in constants" 
              :key="index"
              class="bg-white border border-gray-200 rounded-md p-2 flex items-center justify-between"
            >
              <div class="flex items-center">
                <span class="font-medium">{{ constant.type }}</span>
                <span class="text-gray-500 ml-2">:</span>
                <span class="ml-2">{{ constant.value }}</span>
              </div>
              <div class="text-xs text-gray-500">
                {{ constant.address }}
              </div>
            </div>
          </div>
        </div>

        <!-- 引用箭头 -->
        <div class="absolute inset-0 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
              </marker>
            </defs>
            <g>
              <path 
                v-for="(ref, index) in references" 
                :key="index"
                :d="ref.path"
                stroke="#64748b"
                stroke-width="2"
                fill="none"
                marker-end="url(#arrowhead)"
              />
            </g>
          </svg>
        </div>
      </div>

      <!-- 图例 -->
      <div class="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 class="font-medium text-gray-700 mb-2">图例</h4>
        <div class="flex flex-wrap gap-4 text-sm">
          <div class="flex items-center">
            <div class="w-3 h-3 bg-blue-50 border border-blue-200 rounded mr-2"></div>
            <span>栈区</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 bg-orange-50 border border-orange-200 rounded mr-2"></div>
            <span>堆区</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 bg-green-50 border border-green-200 rounded mr-2"></div>
            <span>常量区</span>
          </div>
          <div class="flex items-center">
            <div class="w-6 h-0.5 bg-gray-500 mr-2"></div>
            <span>引用</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 border border-red-500 rounded mr-2"></div>
            <span>循环引用</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部状态条 -->
    <div class="bg-gray-50 border-t border-gray-200 px-4 py-1 text-xs text-gray-500 flex items-center justify-between">
      <div>
        栈: {{ stackVariables.length }} 变量 | 堆: {{ heapObjects.length }} 对象 | 常量: {{ constants.length }} 项
      </div>
      <div>
        视图: {{ viewMode === 'logical' ? '逻辑' : '地址' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 状态
const viewMode = ref<'logical' | 'address'>('logical')
const zoomLevel = ref(1)

// 模拟数据
const stackVariables = ref([
  { name: 'a', value: '0x8000', type: 'int', address: '0x0000' },
  { name: 'b', value: '0x8004', type: 'list', address: '0x0004' },
  { name: 'c', value: '0x10000', type: 'str', address: '0x0008' }
])

const heapObjects = ref([
  { value: '42', type: 'int', address: '0x8000', isCircular: false },
  { value: '[1, 2, 3]', type: 'list', address: '0x8004', isCircular: false },
  { value: '{"name": "Alice"}', type: 'dict', address: '0x8008', isCircular: true }
])

const constants = ref([
  { value: '"Hello"', type: 'str', address: '0x10000' },
  { value: '42', type: 'int', address: '0x10004' }
])

const references = ref([
  { path: 'M 100 80 L 100 140 L 200 140' }, // a -> 0x8000
  { path: 'M 100 100 L 100 180 L 200 180' }, // b -> 0x8004
  { path: 'M 100 120 L 100 240 L 200 240' }  // c -> 0x10000
])

// 方法
function toggleView() {
  viewMode.value = viewMode.value === 'logical' ? 'address' : 'logical'
}

function zoomIn() {
  if (zoomLevel.value < 2) {
    zoomLevel.value += 0.25
  }
}

function zoomOut() {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value -= 0.25
  }
}

// 生命周期
onMounted(() => {
  // 初始化内存模型数据
  // 实际项目中，这里应该从后端获取真实的内存数据
})
</script>

<style scoped>
/* 自定义样式 */
</style>
