import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppState, Variable, StackFrame, ExecutionResult } from '../types'

// 模拟数据
const mockVariables: Variable[] = [
  { name: 'n', value: '5', type: 'int' },
  { name: 'lst', value: '[1, 2, 3]', type: 'list' },
  { name: 'student', value: '{"name": "Alice", "age": 20}', type: 'dict' }
]

const mockCallStack: StackFrame[] = [
  {
    function_name: 'fib',
    line_number: 6,
    variables: [
      { name: 'n', value: '5', type: 'int' },
      { name: 'memo', value: '{0: 0, 1: 1}', type: 'dict' }
    ]
  },
  {
    function_name: 'fib',
    line_number: 6,
    variables: [
      { name: 'n', value: '4', type: 'int' },
      { name: 'memo', value: '{0: 0, 1: 1}', type: 'dict' }
    ]
  }
]

export const useAppStore = defineStore('app', () => {
  // 状态
  const code = ref(`def fib(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]

print(fib(10))`)
  
  const breakpoints = ref<number[]>([])
  const current_line = ref(0)
  const execution_status = ref<'ready' | 'running' | 'paused' | 'finished' | 'error'>('ready')
  const variables = ref<Variable[]>(mockVariables)
  const call_stack = ref<StackFrame[]>(mockCallStack)
  const output = ref('')
  const error = ref('')
  const speed = ref(1.0)
  const theme = ref<'light' | 'dark' | 'high-contrast'>('light')

  // 计算属性
  const status_text = computed(() => {
    switch (execution_status.value) {
      case 'ready': return '就绪'
      case 'running': return '运行中'
      case 'paused': return '暂停中'
      case 'finished': return '已结束'
      case 'error': return '错误'
      default: return '就绪'
    }
  })

  const status_color = computed(() => {
    switch (execution_status.value) {
      case 'ready': return 'bg-green-500'
      case 'running': return 'bg-blue-500'
      case 'paused': return 'bg-yellow-500'
      case 'finished': return 'bg-purple-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-green-500'
    }
  })

  // 方法
  function setCode(newCode: string) {
    code.value = newCode
  }

  function toggleBreakpoint(line: number) {
    const index = breakpoints.value.indexOf(line)
    if (index > -1) {
      breakpoints.value.splice(index, 1)
    } else {
      breakpoints.value.push(line)
    }
  }

  function setSpeed(newSpeed: number) {
    speed.value = newSpeed
  }

  function setTheme(newTheme: 'light' | 'dark' | 'high-contrast') {
    theme.value = newTheme
  }

  async function executeCode() {
    execution_status.value = 'running'
    // 模拟API调用
    try {
      // 实际项目中，这里应该调用后端API
      // const response = await fetch('/api/execution/execute', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     code: code.value,
      //     breakpoints: breakpoints.value,
      //     step_mode: false
      //   })
      // })
      // const result: ExecutionResult = await response.json()
      
      // 模拟执行结果
      setTimeout(() => {
        execution_status.value = 'finished'
        current_line.value = 10
        output.value = '55'
        error.value = ''
      }, 1000)
    } catch (err) {
      execution_status.value = 'error'
      error.value = '执行错误'
    }
  }

  function pauseExecution() {
    execution_status.value = 'paused'
  }

  function resetExecution() {
    execution_status.value = 'ready'
    current_line.value = 0
    output.value = ''
    error.value = ''
  }

  return {
    // 状态
    code,
    breakpoints,
    current_line,
    execution_status,
    variables,
    call_stack,
    output,
    error,
    speed,
    theme,
    // 计算属性
    status_text,
    status_color,
    // 方法
    setCode,
    toggleBreakpoint,
    setSpeed,
    setTheme,
    executeCode,
    pauseExecution,
    resetExecution
  }
})
