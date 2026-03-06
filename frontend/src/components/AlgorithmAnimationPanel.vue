<template>
  <div class="flex flex-col h-full">
    <!-- 顶部工具栏 -->
    <div class="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <h3 class="font-medium text-gray-700">算法动画</h3>
      <div class="flex space-x-2">
        <select 
          v-model="selectedAlgorithm" 
          class="border border-gray-300 rounded px-2 py-1 text-sm"
          @change="initAlgorithm"
        >
          <option value="bubble-sort">冒泡排序</option>
          <option value="quick-sort">快速排序</option>
          <option value="binary-search">二分查找</option>
          <option value="linked-list">链表操作</option>
          <option value="binary-tree">二叉树</option>
          <option value="dynamic-programming">动态规划</option>
        </select>
        <button 
          class="px-2 py-1 text-sm bg-primary text-white rounded hover:bg-blue-600"
          @click="startAnimation"
        >
          开始动画
        </button>
        <button 
          class="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          @click="resetAnimation"
        >
          重置
        </button>
      </div>
    </div>

    <!-- 参数设置 -->
    <div class="bg-white border-b border-gray-200 p-4">
      <h4 class="font-medium text-gray-700 mb-3">参数设置</h4>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">数组长度</label>
          <input 
            type="range" 
            min="5" 
            max="20" 
            v-model.number="params.length" 
            class="w-full"
            @input="initAlgorithm"
          >
          <div class="flex justify-between text-xs text-gray-500">
            <span>5</span>
            <span>{{ params.length }}</span>
            <span>20</span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">最大值</label>
          <input 
            type="range" 
            min="10" 
            max="100" 
            v-model.number="params.maxValue" 
            class="w-full"
            @input="initAlgorithm"
          >
          <div class="flex justify-between text-xs text-gray-500">
            <span>10</span>
            <span>{{ params.maxValue }}</span>
            <span>100</span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">有序度</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            v-model.number="params.sortedness" 
            class="w-full"
            @input="initAlgorithm"
          >
          <div class="flex justify-between text-xs text-gray-500">
            <span>随机</span>
            <span>{{ params.sortedness }}%</span>
            <span>有序</span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">重复率</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            v-model.number="params.duplication" 
            class="w-full"
            @input="initAlgorithm"
          >
          <div class="flex justify-between text-xs text-gray-500">
            <span>无重复</span>
            <span>{{ params.duplication }}%</span>
            <span>全重复</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 动画展示区 -->
    <div class="flex-1 overflow-auto p-4">
      <!-- 排序算法动画 -->
      <div v-if="selectedAlgorithm.includes('sort')" class="w-full">
        <div class="flex items-end justify-center space-x-2 h-64 mb-4">
          <div 
            v-for="(item, index) in algorithmData" 
            :key="index"
            :class="['transition-all duration-300', getBarClass(index)]"
            :style="{ height: `${(item / params.maxValue) * 100}%`, width: '30px' }"
          >
            <div class="text-xs text-center mt-1">{{ item }}</div>
          </div>
        </div>
        <div class="bg-gray-50 p-3 rounded-md">
          <div class="flex justify-between text-sm">
            <div>比较次数: {{ stats.comparisons }}</div>
            <div>交换次数: {{ stats.swaps }}</div>
            <div>耗时: {{ stats.time }}ms</div>
          </div>
        </div>
      </div>

      <!-- 二分查找动画 -->
      <div v-else-if="selectedAlgorithm === 'binary-search'" class="w-full">
        <div class="flex items-center justify-center space-x-4 mb-4">
          <div 
            v-for="(item, index) in algorithmData" 
            :key="index"
            :class="['w-10 h-10 flex items-center justify-center rounded-full', getSearchBarClass(index)]"
          >
            {{ item }}
          </div>
        </div>
        <div class="bg-gray-50 p-3 rounded-md">
          <div class="flex justify-between text-sm">
            <div>目标值: {{ params.target }}</div>
            <div>查找次数: {{ stats.comparisons }}</div>
            <div>结果: {{ stats.result }}</div>
          </div>
        </div>
      </div>

      <!-- 链表操作动画 -->
      <div v-else-if="selectedAlgorithm === 'linked-list'" class="w-full">
        <div class="flex items-center justify-center space-x-2 mb-4">
          <div 
            v-for="(node, index) in algorithmData" 
            :key="index"
            class="border border-gray-300 rounded-md p-2 flex items-center"
          >
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              {{ node.value }}
            </div>
            <div v-if="index < algorithmData.length - 1" class="text-gray-500">→</div>
          </div>
        </div>
        <div class="bg-gray-50 p-3 rounded-md">
          <div class="flex justify-between text-sm">
            <div>链表长度: {{ algorithmData.length }}</div>
            <div>操作: {{ stats.operation }}</div>
            <div>状态: {{ stats.status }}</div>
          </div>
        </div>
      </div>

      <!-- 二叉树动画 -->
      <div v-else-if="selectedAlgorithm === 'binary-tree'" class="w-full">
        <div class="flex justify-center mb-4">
          <div class="tree-container">
            <div class="tree-node" v-if="algorithmData">
              {{ algorithmData.value }}
              <div class="tree-children">
                <div class="tree-node" v-if="algorithmData.left">
                  {{ algorithmData.left.value }}
                </div>
                <div class="tree-node" v-if="algorithmData.right">
                  {{ algorithmData.right.value }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 p-3 rounded-md">
          <div class="flex justify-between text-sm">
            <div>树高度: {{ stats.height }}</div>
            <div>节点数: {{ stats.nodes }}</div>
            <div>操作: {{ stats.operation }}</div>
          </div>
        </div>
      </div>

      <!-- 动态规划动画 -->
      <div v-else-if="selectedAlgorithm === 'dynamic-programming'" class="w-full">
        <div class="grid grid-cols-5 gap-2 mb-4">
          <div 
            v-for="(cell, index) in algorithmData" 
            :key="index"
            :class="['border border-gray-300 p-2 text-center', getDPCellClass(index)]"
          >
            {{ cell.value }}
          </div>
        </div>
        <div class="bg-gray-50 p-3 rounded-md">
          <div class="flex justify-between text-sm">
            <div>问题: {{ stats.problem }}</div>
            <div>最优解: {{ stats.optimal }}</div>
            <div>计算步骤: {{ stats.steps }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部状态条 -->
    <div class="bg-gray-50 border-t border-gray-200 px-4 py-1 text-xs text-gray-500">
      算法: {{ getAlgorithmName(selectedAlgorithm) }} | 状态: {{ animationStatus }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 状态
const selectedAlgorithm = ref('bubble-sort')
const animationStatus = ref('就绪')
const algorithmData = ref<any>([])
const params = ref({
  length: 10,
  maxValue: 50,
  sortedness: 0,
  duplication: 0,
  target: 25
})
const stats = ref({
  comparisons: 0,
  swaps: 0,
  time: 0,
  result: '',
  operation: '',
  status: '',
  height: 0,
  nodes: 0,
  problem: '',
  optimal: 0,
  steps: 0
})

// 方法
function getAlgorithmName(algorithm: string): string {
  const names: Record<string, string> = {
    'bubble-sort': '冒泡排序',
    'quick-sort': '快速排序',
    'binary-search': '二分查找',
    'linked-list': '链表操作',
    'binary-tree': '二叉树',
    'dynamic-programming': '动态规划'
  }
  return names[algorithm] || algorithm
}

function initAlgorithm() {
  animationStatus.value = '就绪'
  stats.value = {
    comparisons: 0,
    swaps: 0,
    time: 0,
    result: '',
    operation: '',
    status: '',
    height: 0,
    nodes: 0,
    problem: '',
    optimal: 0,
    steps: 0
  }

  if (selectedAlgorithm.value.includes('sort')) {
    // 生成随机数组
    algorithmData.value = generateRandomArray()
  } else if (selectedAlgorithm.value === 'binary-search') {
    // 生成有序数组
    algorithmData.value = generateSortedArray()
    params.value.target = Math.floor(Math.random() * params.value.maxValue)
  } else if (selectedAlgorithm.value === 'linked-list') {
    // 生成链表
    algorithmData.value = generateLinkedList()
  } else if (selectedAlgorithm.value === 'binary-tree') {
    // 生成二叉树
    algorithmData.value = generateBinaryTree()
  } else if (selectedAlgorithm.value === 'dynamic-programming') {
    // 生成动态规划数据
    algorithmData.value = generateDPData()
  }
}

function generateRandomArray(): number[] {
  const array: number[] = []
  for (let i = 0; i < params.value.length; i++) {
    let value = Math.floor(Math.random() * params.value.maxValue) + 1
    // 处理重复率
    if (params.value.duplication > 0 && array.length > 0) {
      const shouldDuplicate = Math.random() < params.value.duplication / 100
      if (shouldDuplicate) {
        value = array[Math.floor(Math.random() * array.length)]
      }
    }
    array.push(value)
  }
  // 处理有序度
  if (params.value.sortedness > 0) {
    array.sort((a, b) => a - b)
    // 随机打乱部分元素
    const shuffleCount = Math.floor(array.length * (100 - params.value.sortedness) / 100)
    for (let i = 0; i < shuffleCount; i++) {
      const idx1 = Math.floor(Math.random() * array.length)
      const idx2 = Math.floor(Math.random() * array.length)
      ;[array[idx1], array[idx2]] = [array[idx2], array[idx1]]
    }
  }
  return array
}

function generateSortedArray(): number[] {
  const array: number[] = []
  for (let i = 0; i < params.value.length; i++) {
    array.push(i * Math.floor(params.value.maxValue / params.value.length) + 1)
  }
  return array
}

function generateLinkedList(): { value: number }[] {
  const list: { value: number }[] = []
  for (let i = 0; i < params.value.length; i++) {
    list.push({ value: Math.floor(Math.random() * params.value.maxValue) + 1 })
  }
  return list
}

function generateBinaryTree(): { value: number; left?: any; right?: any } {
  const values = generateRandomArray()
  if (values.length === 0) return { value: 0 }
  
  const root = { value: values[0] }
  for (let i = 1; i < values.length; i++) {
    insertIntoTree(root, values[i])
  }
  return root
}

function insertIntoTree(node: any, value: number) {
  if (value < node.value) {
    if (!node.left) {
      node.left = { value }
    } else {
      insertIntoTree(node.left, value)
    }
  } else {
    if (!node.right) {
      node.right = { value }
    } else {
      insertIntoTree(node.right, value)
    }
  }
}

function generateDPData(): { value: number; selected?: boolean }[] {
  const data: { value: number; selected?: boolean }[] = []
  for (let i = 0; i < 25; i++) {
    data.push({ value: Math.floor(Math.random() * 10) + 1 })
  }
  return data
}

function getBarClass(index: number): string {
  // 实际项目中，这里应该根据算法的当前状态返回不同的类
  return 'bg-blue-500'
}

function getSearchBarClass(index: number): string {
  // 实际项目中，这里应该根据算法的当前状态返回不同的类
  return 'bg-blue-100'
}

function getDPCellClass(index: number): string {
  // 实际项目中，这里应该根据算法的当前状态返回不同的类
  return 'bg-gray-100'
}

function startAnimation() {
  animationStatus.value = '运行中'
  // 实际项目中，这里应该根据选择的算法开始动画
  setTimeout(() => {
    animationStatus.value = '已完成'
  }, 2000)
}

function resetAnimation() {
  initAlgorithm()
}

// 生命周期
onMounted(() => {
  initAlgorithm()
})
</script>

<style scoped>
/* 自定义样式 */
.tree-container {
  display: flex;
  justify-content: center;
}

.tree-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
}

.tree-children {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.tree-children .tree-node {
  margin: 0 20px;
}
</style>
