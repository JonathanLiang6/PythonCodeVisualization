from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import code_execution, code_analysis, sharing

app = FastAPI(title="Python Code Visualization API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(code_execution.router, prefix="/api/execution", tags=["execution"])
app.include_router(code_analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(sharing.router, prefix="/api/sharing", tags=["sharing"])

@app.get("/")
async def root():
    return {"message": "Python Code Visualization API"}
