document.addEventListener('DOMContentLoaded', function() {
  const analyzeButton = document.getElementById('analyzePageButton');
  const loadingStatus = document.getElementById('loadingStatus');
  const resultsContainer = document.getElementById('resultsContainer');
  const debugInfo = document.createElement('div');
  
  // 默认超时设置(5分钟)
  let requestTimeoutMs = 5 * 60 * 1000;
  
  // 添加调试信息区域
  debugInfo.id = 'debugInfo';
  debugInfo.style.cssText = `
    display: none;
    margin-top: 10px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
    color: #333;
    font-size: 12px;
    max-height: 300px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
  `;
  document.body.appendChild(debugInfo);
  
  // 添加设置选项
  function addSettingsUI() {
    const settingsDiv = document.createElement('div');
    settingsDiv.innerHTML = `
      <div style="margin-top: 10px; font-size: 13px;">
        <details>
          <summary style="cursor: pointer; color: #666;">高级设置</summary>
          <div style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
            <div style="margin-bottom: 10px;">
              <label for="timeoutSetting">请求超时时间:</label>
              <select id="timeoutSetting" style="margin-left: 5px; padding: 3px;">
                <option value="180000">3分钟</option>
                <option value="300000" selected>5分钟</option>
                <option value="600000">10分钟</option>
                <option value="900000">15分钟</option>
              </select>
            </div>
            <div>
              <button id="testServerBtn" style="padding: 5px; font-size: 12px; width: 100%;">检测服务器状态</button>
            </div>
          </div>
        </details>
      </div>
    `;
    document.body.insertBefore(settingsDiv, resultsContainer);
    
    // 绑定超时设置变更事件
    const timeoutSetting = document.getElementById('timeoutSetting');
    if (timeoutSetting) {
      timeoutSetting.addEventListener('change', function() {
        requestTimeoutMs = parseInt(this.value);
        console.log('超时设置已更改为:', requestTimeoutMs, 'ms');
      });
    }
    
    // 绑定测试服务器按钮
    const testServerBtn = document.getElementById('testServerBtn');
    if (testServerBtn) {
      testServerBtn.addEventListener('click', async function() {
        testServerBtn.disabled = true;
        testServerBtn.textContent = '正在检测...';
        
        const isRunning = await checkServerStatus();
        
        if (isRunning) {
          addResultCard('服务器状态', '后端服务器运行正常！', 'success');
        } else {
          addResultCard('服务器状态', 
            `后端服务器未响应。请确保已启动服务器:<br>
            1. 打开命令行进入server目录<br>
            2. 运行 <code>node index.js</code> 或双击 <code>start.bat</code>`, 
            'error');
        }
        
        testServerBtn.disabled = false;
        testServerBtn.textContent = '检测服务器状态';
      });
    }
  }
  
  // 添加设置UI
  addSettingsUI();

  // 清空结果容器
  function clearResults() {
    resultsContainer.innerHTML = '';
  }

  // 添加结果卡片
  function addResultCard(title, content, type = 'info') {
    const card = document.createElement('div');
    card.className = `result-card highlight-${type}`;
    
    const titleElem = document.createElement('div');
    titleElem.className = 'result-title';
    titleElem.textContent = title;
    card.appendChild(titleElem);
    
    const contentElem = document.createElement('div');
    contentElem.innerHTML = content;
    card.appendChild(contentElem);
    
    resultsContainer.appendChild(card);
    return card;
  }
  
  // 显示段落分析结果（不显示原文）
  function displayParagraphResults(result) {
    // 清除已有结果
    clearResults();
    
    // 添加标题卡片
    addResultCard('段落真实性分析结果', '以下是对当前页面内容的真实性分析', 'info');
    
    try {
      // 尝试从各种可能的格式中提取数据
      let paragraphs = [];
      
      if (result.output && Array.isArray(result.output)) {
        paragraphs = result.output;
      } else if (result.data && result.data.output && Array.isArray(result.data.output)) {
        paragraphs = result.data.output;
      } else if (Array.isArray(result)) {
        paragraphs = result;
      }
      
      // 检查是否有错误类型的数据
      if (paragraphs.length === 1 && paragraphs[0].error) {
        addResultCard(
          '分析错误', 
          paragraphs[0].error + (paragraphs[0].details ? `<br>${paragraphs[0].details}` : ''),
          'error'
        );
        return;
      }
      
      // 显示段落分析结果（不显示原文）
      paragraphs.forEach((item, index) => {
        const score = item.score || item.confidence || item.reliability || 0;
        const justification = item.justification || item.explanation || item.reason || item.comparison_details || '无说明';
        
        // 确定评分类型
        let scoreType = score > 70 ? 'success' : (score > 40 ? 'warning' : 'error');
        
        // 避免可能的HTML内容混乱
        let sanitizedJustification = justification;
        if (typeof justification === 'string') {
          // 格式化文本，替换换行符为<br>标签
          sanitizedJustification = justification
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
        }
        
        // 添加更好的结构化显示，不包含原文
        const cardContent = `
          <div class="result-justification">
            <div style="margin-bottom: 5px;"><strong>评分依据:</strong></div>
            <div style="padding: 8px; background: #ffffff; border-radius: 4px; border: 1px solid #e0e0e0; font-size: 13px;">
              ${sanitizedJustification}
            </div>
          </div>
        `;
        
        addResultCard(
          `段落 ${index + 1} - 可信度评分: ${score}/100`, 
          cardContent,
          scoreType
        );
      });
      
      // 添加总结信息
      if (paragraphs.length > 0) {
        const averageScore = Math.round(
          paragraphs.reduce((sum, item) => sum + (item.score || 0), 0) / paragraphs.length
        );
        
        let overallType = averageScore > 70 ? 'success' : (averageScore > 40 ? 'warning' : 'error');
        let overallMessage = '';
        
        if (averageScore > 70) {
          overallMessage = '整体来看，此页面内容可信度较高。';
        } else if (averageScore > 40) {
          overallMessage = '整体来看，此页面内容可信度中等，请注意核实关键信息。';
        } else {
          overallMessage = '整体来看，此页面内容可信度较低，建议谨慎采信。';
        }
        
        addResultCard(
          `总体评价: ${averageScore}/100`, 
          overallMessage,
          overallType
        );
      } else {
        addResultCard('无结果', '未能解析到任何段落评分数据', 'warning');
      }
    } catch (error) {
      console.error('显示段落结果时出错:', error);
      addResultCard('解析错误', '无法解析分析结果: ' + error.message, 'error');
    }
  }

  function setLoading(isLoading) {
    if (isLoading) {
      analyzeButton.disabled = true;
      loadingStatus.classList.add('active');
      loadingStatus.textContent = '正在处理...';
      loadingStatus.style.color = '#666';
      clearResults(); // 清除之前的结果
    } else {
      analyzeButton.disabled = false;
      loadingStatus.classList.remove('active');
    }
  }

  function showError(message) {
    addResultCard('分析失败', message, 'error');
    loadingStatus.textContent = '处理出错';
    loadingStatus.style.color = 'red';
    loadingStatus.classList.add('active');
    setTimeout(() => {
      loadingStatus.classList.remove('active');
    }, 5000);
  }

  function logDebug(message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    let logMessage = `[${timestamp}] ${message}`;
    
    if (data) {
      try {
        // 如果是对象，格式化为JSON字符串
        if (typeof data === 'object') {
          logMessage += '\n' + JSON.stringify(data, null, 2);
        } else {
          logMessage += '\n' + data;
        }
      } catch (e) {
        logMessage += '\n[无法格式化数据]';
      }
    }
    
    console.log(logMessage);
    
    // 添加到调试区域
    debugInfo.style.display = 'block';
    const logEntry = document.createElement('div');
    logEntry.style.borderBottom = '1px solid #eee';
    logEntry.style.paddingBottom = '5px';
    logEntry.style.marginBottom = '5px';
    logEntry.textContent = logMessage;
    debugInfo.appendChild(logEntry);
    
    // 滚动到底部
    debugInfo.scrollTop = debugInfo.scrollHeight;
  }

  // 检查服务器状态
  async function checkServerStatus() {
    try {
      const response = await fetch('http://localhost:3000/', { 
        method: 'GET',
        signal: AbortSignal.timeout(3000) // 3秒超时
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // 创建后台请求
  async function createBackgroundRequest(url) {
    try {
      // 通过后台脚本发送请求，这样即使popup关闭也能继续执行
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { 
            action: 'backgroundVerify', 
            url: url,
            timeout: requestTimeoutMs 
          }, 
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.data);
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  if (analyzeButton) {
    analyzeButton.addEventListener('click', async function() {
      let timeoutId = null;
      let progressReminder = null;
      let longWaitReminder = null;
      
      try {
        debugInfo.innerHTML = ''; // 清除之前的日志
        debugInfo.style.display = 'block';
        setLoading(true);
        logDebug('开始验证处理');

        // 先检查服务器状态
        logDebug('检查服务器状态');
        const isServerRunning = await checkServerStatus();
        if (!isServerRunning) {
          logDebug('服务器检测失败');
          addResultCard(
            '服务器未运行', 
            `后端服务器(localhost:3000)似乎未启动或无响应。<br><br>
            <strong>解决方法:</strong><br>
            1. 确保已运行 <code>node server/index.js</code> 或双击 <code>server/start.bat</code><br>
            2. 检查服务器控制台是否有错误信息<br>
            3. 确保端口3000未被其他程序占用`,
            'error'
          );
          throw new Error('服务器未运行，请启动本地服务器(localhost:3000)');
        }
        
        // 获取当前活动的标签页
        logDebug('正在获取当前标签页');
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs.length > 0) {
          const activeTab = tabs[0];
          logDebug('获取到标签页', {url: activeTab.url, id: activeTab.id});
          
          // 检查URL是否有效
          if (!activeTab.url || !activeTab.url.startsWith('http')) {
            throw new Error('无效的页面URL');
          }

          // 设置超时（使用设置中的值）
          logDebug(`设置请求超时: ${requestTimeoutMs}ms`);
          const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(new Error('请求超时，请检查服务器是否正常运行'));
            }, requestTimeoutMs);
          });
          
          // 调用后端 API 并处理超时
          logDebug('正在发送请求到后端服务', {url: 'http://localhost:3000/api/verify'});
          
          // 在请求发起后30秒添加进度提醒
          progressReminder = setTimeout(() => {
            addResultCard(
              '请求处理中', 
              '后端服务正在处理您的请求，可能需要较长时间。请耐心等待...',
              'warning'
            );
          }, 30000); // 30秒后显示提醒
          
          // 在请求发起后90秒添加较长等待提醒
          longWaitReminder = setTimeout(() => {
            addResultCard(
              '请求处理时间较长', 
              `后端服务处理时间超过90秒。这可能是因为：<br>
              1. 网络连接问题<br>
              2. 目标网页内容较多<br>
              3. Coze API响应缓慢<br><br>
              您可以继续等待或取消操作后重试。<br>
              <strong>提示:</strong> 在高级设置中可以增加超时时间。`,
              'warning'
            );
          }, 90000); // 90秒后显示提醒
          
          // 使用 fetch API 发送请求
          const fetchPromise = fetch('http://localhost:3000/api/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: activeTab.url })
          });

          // 使用 Promise.race 处理超时
          logDebug('等待响应或超时');
          try {
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            // 清除提醒计时器
            clearTimeout(progressReminder);
            clearTimeout(longWaitReminder);
            
            logDebug('收到响应', {status: response.status, ok: response.ok});
            
            if (!response.ok) {
              const errorText = await response.text();
              logDebug('服务器返回错误', {status: response.status, error: errorText});
              throw new Error(`服务器错误: ${response.status}, ${errorText}`);
            }

            const responseText = await response.text();
            logDebug('服务器响应原始文本', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
            
            let result;
            try {
              result = JSON.parse(responseText);
              logDebug('成功解析JSON响应');
            } catch (parseError) {
              logDebug('JSON解析失败', {error: parseError.message});
              throw new Error('无法解析服务器响应: ' + parseError.message);
            }
            
            if (!result) {
              logDebug('响应为空');
              throw new Error('服务器返回空响应');
            }
            
            logDebug('解析后的响应数据', result);

            // 清除超时定时器
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            
            // 首先检查是否有特定的"NOT_FOUND"错误，如果有则直接在popup中显示
            if (result.output && Array.isArray(result.output) && 
                result.output.length === 1 && 
                result.output[0].error && 
                result.output[0].details && 
                (result.output[0].details.includes("NOT_FOUND") || 
                 result.output[0].error.includes("news source URL was invalid"))) {
              
              // 在popup中显示结果
              logDebug('检测到NOT_FOUND错误，在popup中显示');
              addResultCard(
                '未找到官方新闻源', 
                result.output[0].details, 
                'warning'
              );
              
              // 成功处理，不需要抛出错误
              setLoading(false);
              return;
            }
            
            // 无论响应是否有效，都尝试发送到内容脚本
            logDebug('尝试发送结果到内容脚本');
            try {
              // 正常尝试发送到内容脚本
              await new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(
                  activeTab.id, 
                  { action: "updateVerificationResults", results: result }, 
                  (response) => {
                    if (chrome.runtime.lastError) {
                      logDebug('发送消息失败', {error: chrome.runtime.lastError.message});
                      
                      // 当内容脚本连接失败时，检查是否是常见错误
                      if (chrome.runtime.lastError.message.includes("Receiving end does not exist")) {
                        // 创建一个友好的结果卡片
                        logDebug('内容脚本连接失败，在popup中显示结果');
                        
                        // 显示无法连接的消息
                        addResultCard(
                          '无法连接到页面', 
                          `当前页面可能限制了插件运行或内容脚本未能正确加载。结果将在此处显示。`,
                          'warning'
                        );
                        
                        // 直接在popup中显示段落分析结果
                        displayParagraphResults(result);
                        
                        // 不将这种情况视为错误
                        resolve();
                        return;
                      }
                      
                      reject(new Error(chrome.runtime.lastError.message));
                    } else {
                      logDebug('验证结果已发送到页面', response);
                      
                      // 成功发送到内容脚本，显示成功消息
                      addResultCard(
                        '分析完成', 
                        '验证结果已成功发送到页面并显示',
                        'success'
                      );
                      
                      resolve();
                    }
                  }
                );
                
                // 为消息响应设置超时，从10秒延长到30秒
                setTimeout(() => {
                  logDebug('内容脚本响应超时');
                  
                  // 添加超时提示
                  addResultCard(
                    '响应超时', 
                    '内容脚本响应超时，但结果可能已经显示在页面上',
                    'warning'
                  );
                  
                  resolve(); // 超时也不要拒绝，改为resolve以避免显示错误
                }, 30000); // 30秒
              });
            } catch (msgError) {
              logDebug('发送消息到内容脚本时出错', {error: msgError.message});
              
              // 在发生错误时，直接显示分析结果而不是原始JSON
              addResultCard(
                '通信错误', 
                `${msgError.message}<br>结果将在此显示。`,
                'error'
              );
              
              // 直接在popup中显示段落分析结果
              displayParagraphResults(result);
              
              throw new Error('无法更新页面内容: ' + msgError.message);
            }
          } catch (timeoutError) {
            // 清除提醒计时器
            clearTimeout(progressReminder);
            clearTimeout(longWaitReminder);
            
            if (timeoutError.message.includes('请求超时')) {
              logDebug('请求超时');
              addResultCard(
                '请求超时', 
                `后端处理请求超过${requestTimeoutMs/60000}分钟，可能原因：<br>
                1. 服务器响应缓慢<br>
                2. Coze API处理时间过长<br>
                3. 目标页面内容过多<br><br>
                <strong>解决方法:</strong><br>
                1. 在高级设置中增加超时时间<br>
                2. 检查服务器是否正常运行<br>
                3. 稍后重试或尝试分析更简单的页面`,
                'error'
              );
              throw new Error('请求处理超时，请检查服务器状态或稍后重试');
            } else {
              throw timeoutError;
            }
          }
        } else {
          logDebug('无法获取活动标签页');
          throw new Error('无法获取活动标签页');
        }
      } catch (error) {
        logDebug('验证过程出错', {error: error.message, stack: error.stack});
        showError(error.message);
      } finally {
        // 确保无论如何都清除超时和提醒计时器
        if (timeoutId) clearTimeout(timeoutId);
        if (progressReminder) clearTimeout(progressReminder);
        if (longWaitReminder) clearTimeout(longWaitReminder);
        
        setLoading(false);
      }
    });
  } else {
    console.error("未找到ID为 'analyzePageButton' 的按钮。");
  }
}); 