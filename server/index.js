require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// 您需要更新的Coze令牌 - 请替换为您的有效令牌
const COZE_API_TOKEN = process.env.COZE_TOKEN || '请替换为您的有效Coze API令牌';
// 如果需要，您也可以修改工作流ID
const WORKFLOW_ID = "7506442800905568306";
const APP_ID = "7496080914184421416";

app.use(cors());
app.use(express.json());

// 验证网页内容的路由
app.post('/api/verify', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`处理URL: ${url}`);

    const response = await axios.post('https://api.coze.cn/v1/workflow/run', {
      parameters: {
        in_url: url,
        require: "提取该页面文字内容"
      },
      workflow_id: WORKFLOW_ID,
      app_id: APP_ID
    }, {
      headers: {
        'Authorization': `Bearer ${COZE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("API响应状态: ", response.status);

    // 处理返回的数据
    const cozeResponse = response.data;
    
    // 检查API是否返回成功
    if (cozeResponse.code !== 0) {
      console.error("API错误:", cozeResponse);
      return res.status(500).json({ 
        error: 'Coze API错误',
        details: cozeResponse.msg
      });
    }
    
    // 尝试正确解析嵌套的JSON
    try {
      // 首先解析data字段（它是一个JSON字符串）
      const parsedData = JSON.parse(cozeResponse.data);
      
      // 如果我们需要解析更深层的output字段
      if (parsedData.output) {
        try {
          // 尝试解析output字段（它可能是一个JSON字符串）
          const parsedOutput = JSON.parse(parsedData.output);
          // 直接返回解析后的结果
          return res.json({ output: parsedOutput });
        } catch (innerError) {
          // 如果output不是有效的JSON，则直接返回原始字符串
          console.log("output不是有效的JSON，返回原始字符串");
          return res.json({ output: parsedData.output });
        }
      } else {
        // data字段没有output属性，返回整个解析后的data
        return res.json(parsedData);
      }
    } catch (parseError) {
      console.error("JSON解析失败:", parseError, "原始数据:", cozeResponse.data);
      // 如果解析失败，返回原始数据
      return res.json({ 
        output: cozeResponse.data,
        parsing_error: true
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

app.get('/', (req, res) => {
  res.send('Truth Verification API is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 