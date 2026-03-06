// 代码执行相关类型
export interface CodeExecutionRequest {
  code: string;
  breakpoints: number[];
  step_mode: boolean;
}

export interface Variable {
  name: string;
  value: string;
  type: string;
}

export interface StackFrame {
  function_name: string;
  line_number: number;
  variables: Variable[];
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  current_line: number;
  variables: Variable[];
  call_stack: StackFrame[];
  breakpoints: number[];
}

// 代码分析相关类型
export interface FunctionInfo {
  name: string;
  line_number: number;
  parameters: string[];
}

export interface ClassInfo {
  name: string;
  line_number: number;
  methods: FunctionInfo[];
}

export interface CodeAnalysisResult {
  functions: FunctionInfo[];
  classes: ClassInfo[];
  variables: string[];
  control_flow: {
    if_statements: number[];
    for_loops: number[];
    while_loops: number[];
    break_statements: number[];
    continue_statements: number[];
    return_statements: number[];
  };
}

// 分享相关类型
export interface ShareRequest {
  code: string;
  title: string;
  permissions: string;
}

export interface ShareResponse {
  share_id: string;
  share_url: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  permissions: string;
  created_at: string;
}

// 应用状态相关类型
export interface AppState {
  code: string;
  breakpoints: number[];
  current_line: number;
  execution_status: 'ready' | 'running' | 'paused' | 'finished' | 'error';
  variables: Variable[];
  call_stack: StackFrame[];
  output: string;
  error: string;
  speed: number;
  theme: 'light' | 'dark' | 'high-contrast';
}
