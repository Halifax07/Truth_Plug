# 真实性验证插件后端服务

## 关于Coze API认证错误

如果您看到以下错误信息：

```
"Your token does not have permission to access workflow_id = 7506442800905568306. Please verify whether the resource ID or token is correct, and ensure that the necessary permissions are enabled at https://coze.cn/open/oauth/pats."
```

这表示您的Coze API令牌无权访问指定的工作流。

## 解决步骤

1. 访问 [Coze API令牌页面](https://coze.cn/open/oauth/pats)
2. 登录您的Coze账户
3. 创建新的个人访问令牌(PAT)，确保其有权访问工作流ID: 7506442800905568306
4. 复制生成的令牌
5. 在`index.js`文件中，找到并修改以下行：
   ```javascript
   const COZE_API_TOKEN = process.env.COZE_TOKEN || '请替换为您的有效Coze API令牌';
   ```
   将'请替换为您的有效Coze API令牌'替换为您刚刚复制的令牌

6. 保存文件并重新启动服务

## 启动服务

在Windows系统上，双击`start.bat`文件启动服务。
或者使用命令行：

```
node index.js
```

服务将在 http://localhost:3000 上运行。

## 工作流ID和应用ID

如果您需要使用不同的Coze工作流，请修改`index.js`文件中的以下变量：

```javascript
const WORKFLOW_ID = "7506442800905568306";
const APP_ID = "7496080914184421416";
```

将这些值更改为您自己的工作流ID和应用ID。 