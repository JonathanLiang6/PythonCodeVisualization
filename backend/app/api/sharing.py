from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import random
import string
import sqlite3
import json
from datetime import datetime

router = APIRouter()

class ShareRequest(BaseModel):
    code: str
    title: str = "Untitled"
    permissions: str = "read"  # read, comment, edit

class ShareResponse(BaseModel):
    share_id: str
    share_url: str

class CodeSnippet(BaseModel):
    id: str
    title: str
    code: str
    permissions: str
    created_at: str

# 初始化数据库
conn = sqlite3.connect('code_snippets.db')
cursor = conn.cursor()
cursor.execute('''
CREATE TABLE IF NOT EXISTS code_snippets (
    id TEXT PRIMARY KEY,
    title TEXT,
    code TEXT,
    permissions TEXT,
    created_at TEXT
)
''')
conn.commit()

def generate_share_id():
    """生成8位随机分享ID"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=8))

@router.post("/share", response_model=ShareResponse)
async def share_code(request: ShareRequest):
    # 生成分享ID
    share_id = generate_share_id()
    
    # 保存代码片段
    created_at = datetime.now().isoformat()
    cursor.execute('''
    INSERT INTO code_snippets (id, title, code, permissions, created_at)
    VALUES (?, ?, ?, ?, ?)
    ''', (share_id, request.title, request.code, request.permissions, created_at))
    conn.commit()
    
    # 生成分享URL
    share_url = f"/share/{share_id}"
    
    return ShareResponse(
        share_id=share_id,
        share_url=share_url
    )

@router.get("/snippet/{share_id}", response_model=CodeSnippet)
async def get_snippet(share_id: str):
    cursor.execute('''
    SELECT id, title, code, permissions, created_at
    FROM code_snippets
    WHERE id = ?
    ''', (share_id,))
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Snippet not found")
    
    return CodeSnippet(
        id=row[0],
        title=row[1],
        code=row[2],
        permissions=row[3],
        created_at=row[4]
    )
