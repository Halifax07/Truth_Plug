console.log("内容脚本已加载。");

// --- 开始配置您的Coze API凭据 ---
const COZE_API_KEY = 'pat_Kx2r0JMkrcxBqCNOAdDchvStSFszviYEl7d0TkkgQDGn0RBt0vzbqFwweQtWcs8R'; // 请替换为您的真实Coze个人访问令牌 (API Key)
const BOT_ID = '7503536807309606923'; // 请替换为您的真实Coze智能体ID (Bot ID)
// Coze API 端点
const COZE_CHAT_API_URL = 'https://api.coze.cn/v3/chat';
// --- 结束配置 --- 

// 原来的 BACKEND_API_URL 不再直接用于Coze调用，可以注释掉或删除，除非您有其他用途
// const BACKEND_API_URL = 'https://your-coze-backend-api.com/analyze'; 

// 在页面上添加紧急错误通知功能
function showEmergencyMessage(title, message, type = 'error') {
  // 删除旧的消息（如果存在）
  const oldMsg = document.getElementById('truth-emergency-message');
  if (oldMsg) oldMsg.remove();
  
  // 创建新消息
  const msgDiv = document.createElement('div');
  msgDiv.id = 'truth-emergency-message';
  msgDiv.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 20px;
    background-color: ${type === 'error' ? 'rgba(244, 67, 54, 0.95)' : 'rgba(33, 150, 243, 0.95)'};
    color: white;
    border-radius: 4px;
    z-index: 2147483647;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    font-family: "Microsoft YaHei", Arial, sans-serif;
    text-align: center;
    max-width: 80%;
  `;
  
  const titleElem = document.createElement('div');
  titleElem.textContent = title;
  titleElem.style.cssText = `
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 16px;
  `;
  msgDiv.appendChild(titleElem);
  
  const msgElem = document.createElement('div');
  msgElem.textContent = message;
  msgElem.style.fontSize = '14px';
  msgDiv.appendChild(msgElem);
  
  // 添加关闭按钮
  const closeBtn = document.createElement('div');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 18px;
    cursor: pointer;
    color: rgba(255,255,255,0.8);
  `;
  closeBtn.onclick = function() {
    msgDiv.remove();
  };
  msgDiv.appendChild(closeBtn);
  
  document.body.appendChild(msgDiv);
  
  // 15秒后自动移除
  setTimeout(() => {
    if (msgDiv.parentNode) msgDiv.remove();
  }, 15000);
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("接收到消息:", request.action);
  
  try {
    if (request.action === "analyzePage") {
      console.log("收到分析页面请求");
      const currentPageUrl = window.location.href;
      analyzePageContent(currentPageUrl)
        .then(results => {
          console.log("分析结果: ", results);
          displayScoresOnPage(results);
          sendResponse({ status: "success", data: results });
        }) 
        .catch(error => {
          console.error("页面分析失败: ", error);
          sendResponse({ status: "error", message: error.message });
        });
      return true; // 异步响应
    }
    if (request.action === "updateVerificationResults") {
      console.log("收到验证结果");
      
      // 立即发送成功响应，防止通信超时
      sendResponse({ status: "success", message: "已收到验证请求" });
      
      // 检查结果结构
      if (!request.results) {
        showEmergencyMessage(
          "验证失败", 
          "后端返回了空结果。请检查后端服务是否正常运行。",
          "error"
        );
        console.error("验证结果为空:", request);
        return true;
      }
      
      // 记录原始响应，以便调试
      console.log("原始验证响应:", request.results);
      
      // 检查特殊错误情况
      if (request.results.output && Array.isArray(request.results.output)) {
        // 检查是否是"未找到来源"的特定错误
        if (request.results.output.length === 1 && 
            request.results.output[0].error && 
            request.results.output[0].details === "NOT_FOUND") {
          console.warn("官方新闻源未找到:", request.results.output[0].error);
          
          showEmergencyMessage(
            "来源未找到", 
            "未能从指定官方新闻源找到相关信息进行比对。",
            "warning"
          );
          
          // 在页面上显示一个提示信息给用户
          const errorDiv = document.createElement('div');
          errorDiv.id = 'truth_plugin_error_message';
          errorDiv.textContent = '未能从指定官方新闻源找到相关信息进行比对。';
          errorDiv.style.position = 'fixed';
          errorDiv.style.top = '20px';
          errorDiv.style.right = '20px';
          errorDiv.style.padding = '12px 20px';
          errorDiv.style.backgroundColor = 'rgba(255, 230, 180, 0.95)';
          errorDiv.style.color = '#333';
          errorDiv.style.border = '1px solid #FFCC80';
          errorDiv.style.borderRadius = '8px';
          errorDiv.style.zIndex = '2147483647';
          errorDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          errorDiv.style.fontFamily = '"Microsoft YaHei", Arial, sans-serif';
          errorDiv.style.fontSize = '14px';
          document.body.appendChild(errorDiv);
          
          // 10秒后自动移除提示
          setTimeout(() => {
            if (errorDiv.parentNode) {
              errorDiv.parentNode.removeChild(errorDiv);
            }
          }, 10000);
          
          return true; // 处理完毕
        }
        
        // 处理段落解析失败错误
        if (request.results.output.length === 1 && 
            request.results.output[0].error && 
            request.results.output[0].error.includes("Failed to parse")) {
          console.warn("段落解析失败:", request.results.output[0].error);
          
          showEmergencyMessage(
            "内容解析失败", 
            "无法解析当前网页内容结构。这可能是由于网页结构特殊或内容保护措施导致的。",
            "warning"
          );
          
          return true; // 处理完毕
        }
      }
      
      // 常规错误处理
      if (request.results.error) {
        showEmergencyMessage(
          "验证出错", 
          `后端返回错误: ${request.results.error}${request.results.details ? ' - ' + request.results.details : ''}`,
          "error"
        );
        console.error("验证结果包含错误:", request.results);
        return true;
      }
      
      // 检查数据解析错误
      if (request.results.parsing_error) {
        showEmergencyMessage(
          "数据解析错误", 
          "后端返回的数据无法正确解析。请查看控制台了解详情。",
          "error"
        );
        console.error("解析错误，原始数据:", request.results.output);
        return true;
      }
      
      // 正常处理验证结果
      setTimeout(() => {
        try {
          displayVerificationResults(request.results);
        } catch (displayError) {
          showEmergencyMessage(
            "显示结果失败", 
            `处理验证结果时出错: ${displayError.message}`,
            "error"
          );
          console.error("显示验证结果时出错:", displayError);
        }
      }, 100); // 稍微延迟处理，确保响应已发送
      
      return true; // 异步响应
    }
  } catch (error) {
    console.error("处理消息时出错:", error);
    showEmergencyMessage("处理错误", `处理消息时出错: ${error.message}`, "error");
    // 尝试发送响应
    try {
      sendResponse({ status: "error", message: error.message });
    } catch (e) {
      console.error("发送响应时出错:", e);
    }
  }
  
  return true; // 确保在所有情况下都返回true，表明会异步响应
});

async function analyzePageContent(url) {
  console.log(`发送URL到后端进行分析: ${url}`);
  // 从 manifest.json 或其他配置中获取的 BOT_ID 和 API_KEY
  // 确保这些常量已在文件顶部定义或从安全存储中获取
  // const COZE_API_KEY = 'pat_YOUR_COZE_API_KEY'; // 已替换
  // const BOT_ID = 'YOUR_BOT_ID'; // 已替换

  const requestBody = {
    bot_id: BOT_ID,
    user_id: "edge_extension_user_123", // 可以是一个固定的字符串或动态生成
    stream: false,
    auto_save_history: true, // 修改: 将 auto_save_history 设置为 true
    additional_messages: [
      {
        role: "user",
        content: url, // 将页面URL作为输入内容
        content_type: "text"
      }
    ]
  };

  try {
    const response = await fetch(COZE_CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + COZE_API_KEY,
        'Content-Type': 'application/json',
        'Accept': '*/*'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API请求失败:", response.status, errorBody);
      throw new Error('API请求失败，状态码: ' + response.status + ', ' + errorBody);
    }

    const apiResponse = await response.json();
    console.log("原始API响应: ", apiResponse);

    if (apiResponse.code !== 0 || !apiResponse.data || !apiResponse.data.messages) {
      console.error("后端API返回错误或无效数据结构:", apiResponse);
      throw new Error('后端API返回错误: ' + (apiResponse.msg || apiResponse.message || '未知错误'));
    }

    // 从 messages 数组中找到 assistant 的回复，并获取其 content
    const assistantMessage = apiResponse.data.messages.find(m => m.role === 'assistant' && m.type === 'answer');
    if (!assistantMessage || !assistantMessage.content) {
      console.error("未找到有效的 assistant 回复内容:", apiResponse.data.messages);
      throw new Error("后端未返回有效的分析结果。");
    }

    const rawOutputStr = assistantMessage.content; // 这是Coze Bot的实际输出内容
    console.log("Coze Bot的原始输出 (assistantMessage.content):", rawOutputStr);

    let scoredParagraphs;

    // --- 开始新的解析逻辑 ---
    const resultsMarker = '[{"paragraph_identifier":'; // 我们期望的实际数据JSON数组的起始特征
    let jsonStringToParse;

    const startIndex = rawOutputStr.indexOf(resultsMarker);

    if (startIndex !== -1) {
      // 找到了我们期望的数据的起始特征
      // 假设我们的数据是这个特征开始到字符串末尾的部分
      jsonStringToParse = rawOutputStr.substring(startIndex);
    } else {
      // 未找到期望数据的起始特征
      // 检查是否以已知的工具日志前缀开始
      const toolLogPrefix = '[{"name":"调用wenbenchuligongju-TextCleaner';
      if (rawOutputStr.startsWith(toolLogPrefix)) {
        // 如果以工具日志前缀开始，但没有找到我们的数据特征，说明数据部分可能缺失或格式不对
        console.error("检测到工具日志，但未找到有效的段落评分数据。原始输出:", rawOutputStr);
        throw new Error("后端返回的数据格式不完整，缺少评分详情。");
      } else {
        // 如果既没有找到数据特征，也不以工具日志前缀开始，
        // 尝试将整个原始输出作为JSON来解析（可能是直接的错误JSON或我们期望的格式但没有工具日志）
        jsonStringToParse = rawOutputStr;
      }
    }

    try {
      scoredParagraphs = JSON.parse(jsonStringToParse);
    } catch (e) {
      console.error("JSON解析失败:", e, "尝试解析的字符串:", jsonStringToParse, "原始Coze输出:", rawOutputStr);
      throw new Error('无法解析后端返回的评分数据，格式可能不是有效的JSON。原始错误: ' + e.message);
    }

    // 对解析结果进行基本验证
    if (!Array.isArray(scoredParagraphs)) {
      console.error("解析后的数据不是一个数组:", scoredParagraphs);
      // 检查它是否是一个包含错误信息的对象
      if (typeof scoredParagraphs === 'object' && scoredParagraphs !== null && (scoredParagraphs.error || scoredParagraphs.message || scoredParagraphs.err_msg || scoredParagraphs.code)) {
        throw new Error('后端服务处理时可能发生错误: ' + (scoredParagraphs.error || scoredParagraphs.message || scoredParagraphs.err_msg || '内容解析错误'));
      }
      throw new Error("后端返回的评分数据格式错误，预期为一个数组。");
    }

    if (scoredParagraphs.length > 0 && typeof scoredParagraphs[0].score === 'undefined') {
      // 如果解析的是一个数组，但第一个元素没有 'score' 字段，
      // 可能是错误地解析了工具日志（如果它也是数组格式）
      if (scoredParagraphs[0].name && scoredParagraphs[0].name.includes("wenbenchuligongju-TextCleaner")) {
        console.error("错误地解析了工具日志，而不是实际的评分数据。");
        throw new Error("未能从后端响应中提取有效的评分数据。");
      }
      console.warn("解析后的数组可能不是评分数据，第一个元素缺少 'score' 字段。", scoredParagraphs);
      // 可以选择抛出错误或尝试继续，取决于业务逻辑的严格程度
    }
    // --- 结束新的解析逻辑 ---

    console.log("成功解析后的段落评分数据: ", scoredParagraphs);
    return scoredParagraphs; // 返回解析后的评分数组

  } catch (error) {
    console.error('与后端通信或处理数据时发生错误:', error);
    // 向用户显示错误或记录错误
    // 为了让 popup.js 能够接收到错误状态，这里可以 re-throw 或者返回一个带错误标记的对象
    throw error; // 将错误继续向上传播，由调用者处理
  }
}

function displayScoresOnPage(scoredParagraphs) {
  // 清除可能存在的旧错误消息
  const oldErrorMsgElement = document.getElementById('truth_plugin_error_message');
  if (oldErrorMsgElement) oldErrorMsgElement.remove();

  if (!scoredParagraphs || scoredParagraphs.length === 0) {
    console.log("没有从后端获取到评分段落。");
    // 可以在此添加一个通用的"无分析结果"的页面提示
    return;
  }

  // 检查是否是"未找到来源"的特定错误
  if (scoredParagraphs.length === 1 && scoredParagraphs[0].error && scoredParagraphs[0].details === "NOT_FOUND") {
    console.warn("官方新闻源未找到:", scoredParagraphs[0].error);
    // 在页面上显示一个提示信息给用户
    const errorDiv = document.createElement('div');
    errorDiv.id = 'truth_plugin_error_message'; // 为元素设置ID，方便将来移除或更新
    errorDiv.textContent = '未能从指定官方新闻源找到相关信息进行比对。';
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.right = '20px'; // 调整到右上角
    errorDiv.style.padding = '12px 20px';
    errorDiv.style.backgroundColor = 'rgba(255, 230, 180, 0.95)'; // 浅橙黄色背景
    errorDiv.style.color = '#333'; // 深灰色文字
    errorDiv.style.border = '1px solid #FFCC80'; // 边框颜色
    errorDiv.style.borderRadius = '8px';
    errorDiv.style.zIndex = '2147483647'; // 确保在最顶层
    errorDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    errorDiv.style.fontFamily = '"Microsoft YaHei", Arial, sans-serif';
    errorDiv.style.fontSize = '14px';
    document.body.appendChild(errorDiv);
    
    // 10秒后自动移除提示
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 10000); // 延长显示时间到10秒
    return; // 不再尝试显示分数
  }

  console.log("开始在页面上标注分数: ", scoredParagraphs);

  // 清除旧的标注 (如果存在)
  const oldAnnotations = document.querySelectorAll('.score-annotation');
  oldAnnotations.forEach(ann => ann.remove());

  // 创建一个映射，用于存储已处理过的段落
  const processedElements = new Set();

  scoredParagraphs.forEach(item => {
    const { paragraph_text, score } = item;
    if (!paragraph_text || typeof score !== 'number') {
      console.log('跳过无效段落项:', item);
      return;
    }

    // 使用更严格的内容匹配策略
    const cleanText = paragraph_text.trim().replace(/\s+/g, ' ');
    if (cleanText.length < 10) {
      console.log('跳过过短的段落:', cleanText);
      return; // 跳过过短的段落文本
    }

    // 创建一个更精准的选择器
    const possibleElements = [
      ...document.querySelectorAll('p'), 
      ...document.querySelectorAll('div:not(:has(*))'), // 无子元素的div通常是文本容器
      ...document.querySelectorAll('span:not(:has(*))'),
      ...document.querySelectorAll('li'),
      ...document.querySelectorAll('article'),
      ...document.querySelectorAll('section')
    ];
    
    // 按文本长度排序，找到最符合的元素
    const matchingElements = possibleElements
      .filter(el => {
        // 已处理过的元素跳过
        if (processedElements.has(el)) return false;
        
        // 忽略不可见或太小的元素
        const rect = el.getBoundingClientRect();
        if (rect.width < 50 || rect.height < 20 || !el.offsetParent) return false;
        
        // 清理和比较文本
        const elText = el.innerText.trim().replace(/\s+/g, ' ');
        return elText.includes(cleanText) || cleanText.includes(elText);
      })
      .sort((a, b) => {
        // 按内容长度匹配度排序
        const aText = a.innerText.trim();
        const bText = b.innerText.trim();
        const aDiff = Math.abs(aText.length - cleanText.length);
        const bDiff = Math.abs(bText.length - cleanText.length);
        return aDiff - bDiff; // 长度差异小的排前面
      });
    
    if (matchingElements.length > 0) {
      const bestMatch = matchingElements[0];
      
      // 标记为已处理
      processedElements.add(bestMatch);
      
      // 创建一个更显眼的分数标签
      const scoreClass = score >= 75 ? 'high-score' : (score >= 50 ? 'medium-score' : 'low-score');
      const scoreBadge = document.createElement('span');
      scoreBadge.className = `score-annotation ${scoreClass}`;
      scoreBadge.textContent = `${score}/100`;
      scoreBadge.title = '段落真实性评分';
      
      // 确保插入位置不破坏原有文本
      if (bestMatch.tagName.toLowerCase() === 'p' || 
          bestMatch.tagName.toLowerCase() === 'div' || 
          bestMatch.tagName.toLowerCase() === 'span') {
        // 在段落末尾添加标注
        bestMatch.appendChild(document.createTextNode(' '));
        bestMatch.appendChild(scoreBadge);
      } else {
        // 对于其他元素，我们可以试着在内部末尾添加
        bestMatch.appendChild(document.createTextNode(' '));
        bestMatch.appendChild(scoreBadge);
      }
      
      // 添加高亮效果让用户注意这个段落
      const originalBackground = window.getComputedStyle(bestMatch).backgroundColor;
      const originalTransition = window.getComputedStyle(bestMatch).transition;
      
      bestMatch.style.transition = 'background-color 0.3s ease';
      bestMatch.style.backgroundColor = score >= 75 ? 'rgba(220, 255, 220, 0.3)' : 
                                       (score >= 50 ? 'rgba(255, 250, 205, 0.3)' : 'rgba(255, 220, 220, 0.3)');
      
      // 3秒后恢复原来的背景色
      setTimeout(() => {
        bestMatch.style.backgroundColor = originalBackground;
        bestMatch.style.transition = originalTransition;
      }, 3000);
      
      console.log(`为段落添加了分数: ${score}, 文本: "${paragraph_text.substring(0, 30)}..."`);
    } else {
      console.log(`未找到匹配段落: "${paragraph_text.substring(0, 30)}..."`);
    }
  });
}

function displayVerificationResults(results) {
  console.log("开始显示验证结果");
  
  // 创建一个全局警告，确保显示结果
  showEmergencyMessage(
    "验证处理开始", 
    "正在处理验证结果，请耐心等待...",
    "info"
  );
  
  try {
    // 创建一个全局悬浮面板，显示处理状态和调试信息
    const statusPanel = document.createElement('div');
    statusPanel.id = 'truth-verification-status-panel';
    statusPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 12px 16px;
      background-color: rgba(255, 255, 255, 0.95);
      border: 1px solid #4CAF50;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
      z-index: 2147483647;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      font-family: "Microsoft YaHei", Arial, sans-serif;
      max-width: 300px;
    `;
    document.body.appendChild(statusPanel);
    statusPanel.textContent = '正在处理验证结果...';
    
    // 清除旧的标注和错误消息
    const oldAnnotations = document.querySelectorAll('.truth-verification-annotation');
    console.log(`清除 ${oldAnnotations.length} 个旧标注`);
    oldAnnotations.forEach(ann => ann.remove());
     
    const oldErrorMsg = document.getElementById('truth-verification-error');
    if (oldErrorMsg) {
      console.log("清除旧错误消息");
      oldErrorMsg.remove();
    }

    // 清除旧的悬浮面板
    const oldPanel = document.getElementById('truth-verification-results-panel');
    if (oldPanel) oldPanel.remove();

    // 检查结果是否有效
    if (!results) {
      updateStatus(statusPanel, '错误：结果对象为空', 'error');
      showEmergencyMessage("验证失败", "结果对象为空", "error");
      throw new Error('结果对象为空');
    }
    
    // 显示原始结果，便于调试
    console.log("处理的原始结果:", results);
    
    // 尝试从各种可能的属性获取输出数据
    let outputData = null;
    
    if (typeof results.output !== 'undefined') {
      updateStatus(statusPanel, '从results.output获取数据', 'info');
      outputData = results.output;
    } else if (results.data && typeof results.data.output !== 'undefined') {
      updateStatus(statusPanel, '从results.data.output获取数据', 'info');
      outputData = results.data.output;
    } else if (results.data) {
      updateStatus(statusPanel, '使用results.data作为数据', 'info');
      outputData = results.data;
    } else {
      updateStatus(statusPanel, '尝试使用整个results对象作为数据', 'info');
      outputData = results;
    }
    
    if (!outputData) {
      updateStatus(statusPanel, '错误：找不到有效的输出数据', 'error');
      showEmergencyMessage("数据缺失", "找不到有效的输出数据", "error");
      throw new Error('找不到有效的输出数据');
    }
    
    updateStatus(statusPanel, '解析验证数据...', 'info');
    console.log("输出数据类型:", typeof outputData);
    console.log("输出数据预览:", 
                typeof outputData === 'string' 
                ? outputData.substring(0, 500) 
                : JSON.stringify(outputData).substring(0, 500));

    // 检查outputData是否已经是对象数组
    let verificationData;
    if (Array.isArray(outputData)) {
      updateStatus(statusPanel, '输出数据已经是数组格式', 'info');
      verificationData = outputData;
    } else if (typeof outputData === 'object' && !Array.isArray(outputData)) {
      updateStatus(statusPanel, '输出数据是对象，尝试提取数组', 'info');
      // 尝试找到对象中的数组属性
      const arrayProps = Object.keys(outputData).filter(
        key => Array.isArray(outputData[key])
      );
      
      if (arrayProps.length > 0) {
        verificationData = outputData[arrayProps[0]];
        updateStatus(statusPanel, `从属性 ${arrayProps[0]} 中提取数组`, 'info');
      } else {
        // 如果没有数组属性，可能是单个条目，尝试包装成数组
        verificationData = [outputData];
        updateStatus(statusPanel, '将单个对象包装为数组', 'info');
      }
    } else if (typeof outputData === 'string') {
      updateStatus(statusPanel, '输出数据是字符串，尝试解析', 'info');
      // 尝试解析字符串
      try {
        verificationData = JSON.parse(outputData);
        updateStatus(statusPanel, '成功解析字符串为JSON', 'info');
        
        // 如果解析结果不是数组，尝试在对象中查找数组
        if (!Array.isArray(verificationData) && typeof verificationData === 'object') {
          const arrayProps = Object.keys(verificationData).filter(
            key => Array.isArray(verificationData[key])
          );
          
          if (arrayProps.length > 0) {
            verificationData = verificationData[arrayProps[0]];
            updateStatus(statusPanel, `从解析结果的属性 ${arrayProps[0]} 中提取数组`, 'info');
          }
        }
      } catch (parseError) {
        console.error("JSON解析失败:", parseError);
        updateStatus(statusPanel, `JSON解析失败: ${parseError.message}`, 'error');
        
        // 尝试修复JSON字符串中的转义问题
        try {
          // 有时API返回的是双重编码的JSON
          const unescaped = outputData
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '\n');
            
          updateStatus(statusPanel, '尝试解析转义后的字符串', 'info');
          verificationData = JSON.parse(unescaped);
          
          // 处理嵌套JSON字符串的情况
          if (typeof verificationData === 'string') {
            updateStatus(statusPanel, '解析结果仍然是字符串，尝试二次解析', 'info');
            verificationData = JSON.parse(verificationData);
          }
          
          // 如果解析结果不是数组，尝试在对象中查找数组
          if (!Array.isArray(verificationData) && typeof verificationData === 'object') {
            const arrayProps = Object.keys(verificationData).filter(
              key => Array.isArray(verificationData[key])
            );
            
            if (arrayProps.length > 0) {
              verificationData = verificationData[arrayProps[0]];
              updateStatus(statusPanel, `从解析结果的属性 ${arrayProps[0]} 中提取数组`, 'info');
            }
          }
        } catch (retryError) {
          updateStatus(statusPanel, '错误：无法解析数据格式', 'error');
          showEmergencyMessage(
            "解析失败", 
            `无法解析数据格式: ${retryError.message}。请查看控制台获取更多信息。`,
            "error"
          );
          console.error("二次解析尝试失败:", retryError);
          console.error("原始数据:", outputData);
          throw new Error('数据格式错误: ' + parseError.message);
        }
      }
    } else {
      updateStatus(statusPanel, '错误：输出数据格式不支持', 'error');
      showEmergencyMessage("格式错误", `不支持的输出数据类型: ${typeof outputData}`, "error");
      throw new Error(`不支持的输出数据类型: ${typeof outputData}`);
    }
    
    // 确保verificationData是数组
    if (!Array.isArray(verificationData)) {
      verificationData = [verificationData]; // 如果不是数组，转换为数组
      updateStatus(statusPanel, '将非数组数据转换为单元素数组', 'info');
    }
    
    console.log("解析后的验证数据:", verificationData);
    updateStatus(statusPanel, `成功解析 ${verificationData.length} 条段落数据`, 'info');
    
    if (verificationData.length === 0) {
      console.warn("验证数据为空数组");
      updateStatus(statusPanel, '页面没有可验证的内容', 'warning');
      setTimeout(() => statusPanel.remove(), 3000);
      showEmergencyMessage("空结果", "验证结果为空，没有找到任何段落", "info");
      return;
    }

    // 显示刚解析出的数据
    showEmergencyMessage(
      "成功解析数据", 
      `已解析 ${verificationData.length} 条段落数据，正在创建显示面板`,
      "info"
    );

    // 创建一个悬浮结果面板，即使找不到匹配段落也能显示结果
    createResultsPanel(verificationData);

    // 标记是否成功标注了至少一个段落
    let annotationAdded = 0;

    // 为每个段落添加标注
    verificationData.forEach((item, index) => {
      // 处理各种可能的字段名称
      const paragraphText = item.original_paragraph_text || item.paragraph_text || item.text || item.content;
      
      if (!paragraphText) {
        console.warn("段落没有文本内容:", item);
        return;
      }
      
      const score = item.score || item.confidence || item.reliability || 0;
      const justification = item.justification || item.explanation || item.reason || item.comparison_details || '无说明';
      
      updateStatus(statusPanel, `处理第 ${index+1}/${verificationData.length} 段...`, 'info');
      console.log(`尝试为文本 "${paragraphText.substring(0, 30)}..." 添加标注，分数: ${score}`);
      
      // 查找包含该段落文本的元素 - 扩大匹配范围
      const elements = document.querySelectorAll('p, div, article, section, span, li, td, th');
      let matched = false;
      
      // 清理段落文本，便于匹配
      const cleanParagraphText = paragraphText
        .replace(/\s+/g, ' ')
        .replace(/[\n\r\t]/g, ' ')
        .trim();
        
      // 如果段落太长，只取前50个字符用于匹配
      const matchText = cleanParagraphText.length > 50 
        ? cleanParagraphText.substring(0, 50) 
        : cleanParagraphText;
      
      elements.forEach(element => {
        // 避免已经处理过的元素
        if (element.classList.contains('truth-verified')) {
          return;
        }
        
        // 避免处理非常小的元素
        if (element.offsetWidth < 30 || element.offsetHeight < 15 || !element.offsetParent) {
          return;
        }
        
        // 清理元素文本内容
        const cleanElementText = element.textContent
          .replace(/\s+/g, ' ')
          .replace(/[\n\r\t]/g, ' ')
          .trim();
          
        if (!cleanElementText) return;
        
        // 使用更宽松的匹配策略
        let isMatch = false;
        
        // 1. 直接包含关系
        if (cleanElementText.includes(matchText) || matchText.includes(cleanElementText)) {
          isMatch = true;
        } 
        // 2. 如果段落很长，检查开头部分是否匹配
        else if (cleanElementText.length > 100 && matchText.length > 20) {
          const elementStart = cleanElementText.substring(0, 30);
          const paragraphStart = matchText.substring(0, 30);
          if (elementStart.includes(paragraphStart) || paragraphStart.includes(elementStart)) {
            isMatch = true;
          }
        }
        // 3. 关键词匹配（针对短段落）
        else if (matchText.length < 50) {
          // 提取关键词
          const keywords = matchText.split(' ').filter(w => w.length > 3);
          if (keywords.length > 0) {
            // 如果50%以上的关键词匹配，认为是匹配
            const matchCount = keywords.filter(k => cleanElementText.includes(k)).length;
            if (matchCount / keywords.length > 0.5) {
              isMatch = true;
            }
          }
        }
        
        if (isMatch) {
          console.log("找到匹配元素:", element);
          console.log("元素文本片段:", cleanElementText.substring(0, 50));
          matched = true;
          annotationAdded++;
          element.classList.add('truth-verified');
          
          // 创建标注元素
          const annotation = document.createElement('div');
          annotation.className = 'truth-verification-annotation';
          
          // 使用内联样式确保可见性
          annotation.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            transform: translateY(-100%);
            padding: 8px 12px;
            margin: 4px 0;
            background-color: rgba(255, 255, 255, 0.95);
            border-left: 4px solid ${score > 70 ? '#4CAF50' : (score > 40 ? '#FFC107' : '#F44336')};
            border-radius: 4px;
            font-size: 14px;
            color: #333;
            z-index: 2147483647;
            max-width: 90%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            pointer-events: none;
          `;

          // 添加分数和说明
          annotation.innerHTML = `
            <div style="font-weight: bold; color: ${score > 70 ? '#4CAF50' : (score > 40 ? '#FFC107' : '#F44336')};">
              可信度: ${score}/100
            </div>
            <div style="margin-top: 4px; font-size: 12px;">${justification}</div>
          `;

          // 标记段落
          element.style.position = 'relative';
          element.style.borderBottom = `2px solid ${score > 70 ? '#4CAF50' : (score > 40 ? '#FFC107' : '#F44336')}`;
          element.style.paddingBottom = '2px';
          
          // 添加标注
          element.appendChild(annotation);
          
          // 防止添加太多标注，只取前15个
          if (annotationAdded >= 15) {
            return;
          }
        }
      });
      
      if (!matched) {
        console.warn(`未找到匹配文本 "${matchText}" 的元素`);
      }
    });

    if (annotationAdded === 0) {
      console.warn("没有找到任何匹配的段落");
      updateStatus(statusPanel, '未能在页面中找到匹配的段落，已创建悬浮结果面板', 'warning');
      showEmergencyMessage(
        "无匹配段落", 
        "未能在页面中找到匹配的段落，请查看悬浮结果面板",
        "info"
      );
    } else {
      updateStatus(statusPanel, `成功添加 ${annotationAdded} 个标注`, 'success');
      console.log("成功添加标注:", annotationAdded);
      showEmergencyMessage(
        "标注成功", 
        `成功添加 ${annotationAdded} 个段落标注`,
        "info"
      );
    }

  } catch (error) {
    console.error("处理验证结果时出错:", error);
    // 显示错误消息
    const errorDiv = document.createElement('div');
    errorDiv.id = 'truth-verification-error';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background-color: rgba(255, 255, 255, 0.95);
      border-left: 3px solid #ff0000;
      border-radius: 4px;
      font-size: 14px;
      color: #ff0000;
      z-index: 2147483647;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      font-family: "Microsoft YaHei", Arial, sans-serif;
    `;
    errorDiv.textContent = '运行失败: ' + error.message;
    document.body.appendChild(errorDiv);

    showEmergencyMessage(
      "处理错误", 
      `处理验证结果时出错: ${error.message}`,
      "error"
    );

    // 5秒后自动移除错误消息
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
}

// 创建悬浮结果面板（备用显示）
function createResultsPanel(verificationData) {
  // 创建悬浮面板
  const panel = document.createElement('div');
  panel.id = 'truth-verification-results-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50px;
    right: 20px;
    width: 300px;
    max-height: 80%;
    overflow-y: auto;
    background-color: rgba(255, 255, 255, 0.97);
    border: 1px solid #4CAF50;
    border-radius: 8px;
    padding: 15px;
    font-family: "Microsoft YaHei", Arial, sans-serif;
    font-size: 14px;
    color: #333;
    z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  // 添加标题
  const title = document.createElement('h2');
  title.textContent = '页面段落真实性分析';
  title.style.cssText = `
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    text-align: center;
  `;
  panel.appendChild(title);
  
  // 添加关闭按钮
  const closeBtn = document.createElement('div');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 18px;
    color: #999;
    cursor: pointer;
  `;
  closeBtn.onclick = function() {
    panel.remove();
  };
  panel.appendChild(closeBtn);
  
  // 添加每个段落的分数
  verificationData.forEach((item, index) => {
    const score = item.score || item.confidence || item.reliability || 0;
    const justification = item.justification || item.explanation || item.reason || item.comparison_details || '无说明';
    
    const itemDiv = document.createElement('div');
    itemDiv.style.cssText = `
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 4px;
      background-color: ${score > 70 ? 'rgba(76, 175, 80, 0.1)' : (score > 40 ? 'rgba(255, 193, 7, 0.1)' : 'rgba(244, 67, 54, 0.1)')};
      border-left: 3px solid ${score > 70 ? '#4CAF50' : (score > 40 ? '#FFC107' : '#F44336')};
    `;
    
    itemDiv.innerHTML = `
      <div style="margin-bottom: 5px; font-weight: bold;">段落 ${index + 1}</div>
      <div style="font-weight: bold; color: ${score > 70 ? '#4CAF50' : (score > 40 ? '#FFC107' : '#F44336')};">
        可信度: ${score}/100
      </div>
      <div style="margin-top: 5px; font-size: 12px;">${justification}</div>
    `;
    
    panel.appendChild(itemDiv);
  });
  
  document.body.appendChild(panel);
  console.log("创建了悬浮结果面板");
}

// 更新状态面板
function updateStatus(panel, message, type) {
  if (!panel) return;
  
  panel.textContent = message;
  
  // 根据消息类型设置样式
  switch (type) {
    case 'error':
      panel.style.borderColor = '#F44336';
      panel.style.color = '#F44336';
      break;
    case 'warning':
      panel.style.borderColor = '#FFC107';
      panel.style.color = '#856404';
      break;
    case 'success':
      panel.style.borderColor = '#4CAF50';
      panel.style.color = '#4CAF50';
      // 成功后3秒自动移除
      setTimeout(() => panel.remove(), 3000);
      break;
    case 'info':
    default:
      panel.style.borderColor = '#2196F3';
      panel.style.color = '#333';
  }
}

// 如果需要在页面加载时自动执行分析 (而不是通过popup按钮触发)
// 可以取消以下注释，但这通常不是最佳实践，除非有明确需求且用户知晓
/*
window.addEventListener('load', () => {
  console.log("页面加载完成，自动开始分析...");
  const currentPageUrl = window.location.href;
  analyzePageContent(currentPageUrl)
    .then(results => {
      console.log("自动分析结果: ", results);
      displayScoresOnPage(results);
    })
    .catch(error => {
      console.error("页面自动分析失败: ", error);
    });
});
*/ 