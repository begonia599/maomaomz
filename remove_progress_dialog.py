#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

filePath = r'src/记忆_with_worldbook/components/ProjectManager.vue'

with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

print("开始处理...")

# 只删除所有 progressDialogRef.value?.setProgress() 和 progressDialogRef.value?.setMessage() 调用
print("删除 progressDialogRef 调用...")
content = re.sub(r"^\s*progressDialogRef\.value\?\.(setProgress|setMessage)\([^\)]*\);\n", "", content, flags=re.MULTILINE)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 已成功移除所有 progressDialogRef 调用")
