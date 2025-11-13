@echo off
echo 正在启动真实性验证后端服务...
echo.
echo 如果遇到Coze API认证错误，请按以下步骤操作：
echo 1. 访问 https://coze.cn/open/oauth/pats
echo 2. 生成新的个人访问令牌(PAT)
echo 3. 确保该令牌有权限访问工作流ID: 7506442800905568306
echo 4. 编辑 index.js 文件，替换 COZE_API_TOKEN 变量值
echo.
echo 启动服务中...

node index.js

pause 