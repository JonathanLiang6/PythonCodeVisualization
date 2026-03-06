from fastapi import APIRouter
from pydantic import BaseModel
import ast

router = APIRouter()

class CodeAnalysisRequest(BaseModel):
    code: str

class FunctionInfo(BaseModel):
    name: str
    line_number: int
    parameters: list[str]

class ClassInfo(BaseModel):
    name: str
    line_number: int
    methods: list[FunctionInfo]

class CodeAnalysisResult(BaseModel):
    functions: list[FunctionInfo]
    classes: list[ClassInfo]
    variables: list[str]
    control_flow: dict

class CodeAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.functions = []
        self.classes = []
        self.variables = []
        self.control_flow = {
            'if_statements': [],
            'for_loops': [],
            'while_loops': [],
            'break_statements': [],
            'continue_statements': [],
            'return_statements': []
        }
    
    def visit_FunctionDef(self, node):
        # 收集函数信息
        parameters = [arg.arg for arg in node.args.args]
        function_info = FunctionInfo(
            name=node.name,
            line_number=node.lineno,
            parameters=parameters
        )
        self.functions.append(function_info)
        self.generic_visit(node)
    
    def visit_ClassDef(self, node):
        # 收集类信息
        class_info = ClassInfo(
            name=node.name,
            line_number=node.lineno,
            methods=[]
        )
        # 收集类中的方法
        for item in node.body:
            if isinstance(item, ast.FunctionDef):
                parameters = [arg.arg for arg in item.args.args]
                method_info = FunctionInfo(
                    name=item.name,
                    line_number=item.lineno,
                    parameters=parameters
                )
                class_info.methods.append(method_info)
        self.classes.append(class_info)
        self.generic_visit(node)
    
    def visit_Assign(self, node):
        # 收集变量赋值
        for target in node.targets:
            if isinstance(target, ast.Name):
                self.variables.append(target.id)
        self.generic_visit(node)
    
    def visit_If(self, node):
        # 收集if语句
        self.control_flow['if_statements'].append(node.lineno)
        self.generic_visit(node)
    
    def visit_For(self, node):
        # 收集for循环
        self.control_flow['for_loops'].append(node.lineno)
        self.generic_visit(node)
    
    def visit_While(self, node):
        # 收集while循环
        self.control_flow['while_loops'].append(node.lineno)
        self.generic_visit(node)
    
    def visit_Break(self, node):
        # 收集break语句
        self.control_flow['break_statements'].append(node.lineno)
        self.generic_visit(node)
    
    def visit_Continue(self, node):
        # 收集continue语句
        self.control_flow['continue_statements'].append(node.lineno)
        self.generic_visit(node)
    
    def visit_Return(self, node):
        # 收集return语句
        self.control_flow['return_statements'].append(node.lineno)
        self.generic_visit(node)

@router.post("/analyze", response_model=CodeAnalysisResult)
async def analyze_code(request: CodeAnalysisRequest):
    try:
        # 解析代码
        tree = ast.parse(request.code)
        
        # 创建分析器并访问AST
        analyzer = CodeAnalyzer()
        analyzer.visit(tree)
        
        # 去重变量名
        unique_variables = list(set(analyzer.variables))
        
        return CodeAnalysisResult(
            functions=analyzer.functions,
            classes=analyzer.classes,
            variables=unique_variables,
            control_flow=analyzer.control_flow
        )
    except Exception as e:
        # 如果解析失败，返回空结果
        return CodeAnalysisResult(
            functions=[],
            classes=[],
            variables=[],
            control_flow={
                'if_statements': [],
                'for_loops': [],
                'while_loops': [],
                'break_statements': [],
                'continue_statements': [],
                'return_statements': []
            }
        )
