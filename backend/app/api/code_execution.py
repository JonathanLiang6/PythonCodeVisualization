from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import ast
import sys
import traceback

router = APIRouter()

class CodeExecutionRequest(BaseModel):
    code: str
    breakpoints: list[int] = []
    step_mode: bool = False

class Variable(BaseModel):
    name: str
    value: str
    type: str

class StackFrame(BaseModel):
    function_name: str
    line_number: int
    variables: list[Variable]

class ExecutionResult(BaseModel):
    success: bool
    output: str
    error: str = ""
    current_line: int = 0
    variables: list[Variable] = []
    call_stack: list[StackFrame] = []
    breakpoints: list[int] = []

class TraceState:
    def __init__(self, breakpoints):
        self.breakpoints = breakpoints
        self.current_line = 0
        self.variables = []
        self.call_stack = []
        self.stop = False

def trace_calls(frame, event, arg):
    if event == 'line':
        # 检查是否在断点处
        if frame.f_lineno in trace_state.breakpoints:
            trace_state.stop = True
            trace_state.current_line = frame.f_lineno
            # 收集变量信息
            trace_state.variables = collect_variables(frame)
            # 收集调用栈信息
            trace_state.call_stack = collect_call_stack()
    return trace_calls

def collect_variables(frame):
    variables = []
    # 收集局部变量
    for name, value in frame.f_locals.items():
        variables.append(Variable(
            name=name,
            value=str(value),
            type=type(value).__name__
        ))
    # 收集全局变量
    for name, value in frame.f_globals.items():
        if not name.startswith('__'):
            variables.append(Variable(
                name=name,
                value=str(value),
                type=type(value).__name__
            ))
    return variables

def collect_call_stack():
    stack_frames = []
    frame = sys._getframe(2)  # 跳过trace_calls和collect_call_stack
    while frame:
        function_name = frame.f_code.co_name
        line_number = frame.f_lineno
        variables = collect_variables(frame)
        stack_frames.append(StackFrame(
            function_name=function_name,
            line_number=line_number,
            variables=variables
        ))
        frame = frame.f_back
    return stack_frames

trace_state = None

@router.post("/execute", response_model=ExecutionResult)
async def execute_code(request: CodeExecutionRequest):
    global trace_state
    trace_state = TraceState(request.breakpoints)
    
    output = []
    error = ""
    success = True
    
    # 重定向标准输出
    original_stdout = sys.stdout
    class CaptureOutput:
        def write(self, text):
            output.append(text)
        def flush(self):
            pass
    
    sys.stdout = CaptureOutput()
    
    try:
        # 设置跟踪函数
        sys.settrace(trace_calls)
        
        # 执行代码
        exec(request.code)
        
        # 如果是单步模式且未停止，收集最后的状态
        if not trace_state.stop:
            # 获取当前帧
            frame = sys._getframe(0)
            trace_state.current_line = frame.f_lineno
            trace_state.variables = collect_variables(frame)
            trace_state.call_stack = collect_call_stack()
            
    except Exception as e:
        success = False
        error = traceback.format_exc()
    finally:
        # 恢复标准输出
        sys.stdout = original_stdout
        # 移除跟踪函数
        sys.settrace(None)
    
    return ExecutionResult(
        success=success,
        output=''.join(output),
        error=error,
        current_line=trace_state.current_line,
        variables=trace_state.variables,
        call_stack=trace_state.call_stack,
        breakpoints=request.breakpoints
    )
