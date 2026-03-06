<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
      <!-- 对话框标题 -->
      <div class="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800">选择代码模板</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-700">
          <span class="text-xl">×</span>
        </button>
      </div>

      <!-- 对话框内容 -->
      <div class="flex-1 flex overflow-hidden">
        <!-- 分类树 -->
        <div class="w-1/4 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div class="p-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">分类</h3>
            <div class="space-y-1">
              <div v-for="(subcategories, category) in groupedTemplates" :key="category" class="mb-2">
                <button 
                  @click="toggleCategory(category)"
                  class="w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 flex justify-between items-center"
                >
                  <span>{{ category }}</span>
                  <span>{{ expandedCategories.includes(category) ? '▼' : '▶' }}</span>
                </button>
                <div v-if="expandedCategories.includes(category)" class="ml-4 mt-1 space-y-1">
                  <button 
                    v-for="(templates, subcategory) in subcategories" 
                    :key="subcategory"
                    @click="selectSubcategory(category, subcategory)"
                    :class="[selectedCategory === category && selectedSubcategory === subcategory ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200']"
                    class="w-full text-left px-3 py-1.5 rounded-md text-sm"
                  >
                    {{ subcategory }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 模板预览 -->
        <div class="flex-1 p-6 overflow-y-auto">
          <h3 class="text-sm font-medium text-gray-700 mb-4">模板预览</h3>
          <div v-if="selectedTemplates.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="template in selectedTemplates" 
              :key="template.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h4 class="font-medium text-gray-800 mb-2">{{ template.title }}</h4>
              <p class="text-sm text-gray-600 mb-4">{{ template.description }}</p>
              <div class="bg-gray-50 p-3 rounded-md mb-4">
                <pre class="text-xs text-gray-700 overflow-x-auto">{{ template.code }}</pre>
              </div>
              <button 
                @click="selectTemplate(template)"
                class="w-full py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                载入
              </button>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-10">
            请选择一个分类和子分类
          </div>
        </div>
      </div>

      <!-- 对话框底部 -->
      <div class="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-end">
        <button @click="close" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors mr-2">
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { codeTemplates, groupedTemplates, CodeTemplate } from '../utils/codeTemplates'

// Props
const props = defineProps<{
  visible: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', template: CodeTemplate): void
}>()

// 状态
const expandedCategories = ref<string[]>([])
const selectedCategory = ref<string>('')
const selectedSubcategory = ref<string>('')

// 计算属性
const selectedTemplates = computed(() => {
  if (!selectedCategory.value || !selectedSubcategory.value) {
    return []
  }
  return groupedTemplates[selectedCategory.value]?.[selectedSubcategory.value] || []
})

// 方法
function toggleCategory(category: string) {
  const index = expandedCategories.value.indexOf(category)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(category)
  }
}

function selectSubcategory(category: string, subcategory: string) {
  selectedCategory.value = category
  selectedSubcategory.value = subcategory
}

function selectTemplate(template: CodeTemplate) {
  emit('select', template)
  close()
}

function close() {
  emit('close')
}

// 生命周期
onMounted(() => {
  // 默认展开第一个分类
  const firstCategory = Object.keys(groupedTemplates)[0]
  if (firstCategory) {
    expandedCategories.value.push(firstCategory)
    // 默认选择第一个子分类
    const firstSubcategory = Object.keys(groupedTemplates[firstCategory])[0]
    if (firstSubcategory) {
      selectedCategory.value = firstCategory
      selectedSubcategory.value = firstSubcategory
    }
  }
})
</script>

<style scoped>
/* 自定义样式 */
</style>
