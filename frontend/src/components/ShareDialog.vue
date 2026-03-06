<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
      <!-- 对话框标题 -->
      <div class="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800">分享代码</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-700">
          <span class="text-xl">×</span>
        </button>
      </div>

      <!-- 对话框内容 -->
      <div class="p-6">
        <!-- 权限设置 -->
        <div class="mb-6">
          <h3 class="font-medium text-gray-700 mb-3">权限设置</h3>
          <div class="flex space-x-4">
            <button 
              @click="selectedPermission = 'read'"
              :class="['flex-1 py-3 px-4 rounded-md border text-center transition-all', selectedPermission === 'read' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-300 hover:border-gray-400']"
            >
              <div class="text-lg mb-1">👁</div>
              <div class="text-sm">只读</div>
            </button>
            <button 
              @click="selectedPermission = 'comment'"
              :class="['flex-1 py-3 px-4 rounded-md border text-center transition-all', selectedPermission === 'comment' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-300 hover:border-gray-400']"
            >
              <div class="text-lg mb-1">✍</div>
              <div class="text-sm">可批注</div>
            </button>
            <button 
              @click="selectedPermission = 'edit'"
              :class="['flex-1 py-3 px-4 rounded-md border text-center transition-all', selectedPermission === 'edit' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-300 hover:border-gray-400']"
            >
              <div class="text-lg mb-1">🤝</div>
              <div class="text-sm">可协作</div>
            </button>
          </div>
        </div>

        <!-- 分享链接 -->
        <div class="mb-6">
          <h3 class="font-medium text-gray-700 mb-3">分享链接</h3>
          <div class="flex">
            <input 
              type="text" 
              v-model="shareUrl" 
              readonly 
              class="flex-1 border border-gray-300 rounded-l-md px-4 py-2 text-sm"
            >
            <button 
              @click="copyLink"
              class="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors"
            >
              复制
            </button>
          </div>
          <div class="mt-2 text-xs text-gray-500">
            链接有效期：7天
          </div>
        </div>

        <!-- 分享选项 -->
        <div class="mb-6">
          <h3 class="font-medium text-gray-700 mb-3">分享选项</h3>
          <div class="space-y-2">
            <label class="flex items-center">
              <input type="checkbox" v-model="includeCode" class="mr-2">
              <span class="text-sm">包含代码</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="includeBreakpoints" class="mr-2">
              <span class="text-sm">包含断点</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="includePlayback" class="mr-2">
              <span class="text-sm">包含播放位置</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 对话框底部 -->
      <div class="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-end">
        <button @click="close" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors mr-2">
          取消
        </button>
        <button @click="generateLink" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors">
          生成链接
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
const props = defineProps<{
  visible: boolean
  code: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'share', data: { code: string; permissions: string; includeCode: boolean; includeBreakpoints: boolean; includePlayback: boolean }): void
}>()

// 状态
const selectedPermission = ref('read')
const shareUrl = ref('')
const includeCode = ref(true)
const includeBreakpoints = ref(true)
const includePlayback = ref(true)

// 方法
function generateLink() {
  // 实际项目中，这里应该调用后端API生成分享链接
  // 模拟生成分享ID
  const shareId = generateShareId()
  shareUrl.value = `http://localhost:3000/share/${shareId}`
  
  // 触发分享事件
  emit('share', {
    code: props.code,
    permissions: selectedPermission.value,
    includeCode: includeCode.value,
    includeBreakpoints: includeBreakpoints.value,
    includePlayback: includePlayback.value
  })
}

function copyLink() {
  navigator.clipboard.writeText(shareUrl.value)
    .then(() => {
      // 可以添加复制成功的提示
      console.log('链接已复制到剪贴板')
    })
    .catch(err => {
      console.error('复制失败:', err)
    })
}

function generateShareId() {
  // 生成8位随机分享ID
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function close() {
  emit('close')
}
</script>

<style scoped>
/* 自定义样式 */
</style>
