// background/service_worker.js
console.log("Service Worker 已启动。");

// 示例：监听来自 content script 或 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "exampleBackgroundAction") {
    console.log("Background: 收到消息", request);
    // 处理逻辑...
    sendResponse({ status: "success", message: "来自Background的响应" });
  }
  return true; // 如果是异步响应
});

// 示例：当插件安装或更新时
chrome.runtime.onInstalled.addListener(() => {
  console.log("插件已安装或更新。");
  // 可以在这里设置一些初始状态，例如默认的后端API地址到 chrome.storage
});

// 更多后台逻辑可以放在这里
// 例如，如果API调用需要特殊权限或处理，可以由 service worker 发起
// content_script.js 可以将请求发送给 service worker，service worker 再调用 fetch 