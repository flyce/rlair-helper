chrome.tabs.onActivated.addListener((info) => {
  handleListener(info.tabId);
});

chrome.tabs.onCreated.addListener((info) => {
  handleListener(info.openerTabId);
});

chrome.tabs.onUpdated.addListener((info) => {
  handleListener(info);
});

function handleListener(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (tab.url.includes('https://training.rlair.net/training/course/play')) {
      chrome.debugger.attach({ tabId: tab.id }, '1.3', () => {
        if (chrome.runtime.lastError) {
          console.log('当前用户已在处理中，不会再次启用调试器');
          return;
        }
        console.log('调试器已启动');
        chrome.debugger.sendCommand({ tabId: tab.id }, 'Network.enable', () => {
          console.log('网络调试器已启动');
          chrome.debugger.sendCommand({ tabId: tab.id }, 'Network.setCacheDisabled', { cacheDisabled: true }, () => {
            console.log('网络缓存已禁用');
          });
        });
      });
    }
  });
}

chrome.debugger.onEvent.addListener((debuggerId, messgae, params) => {
  if (messgae === 'Network.responseReceived' && params.response.url.includes('https://training.rlair.net/training/courseNew/timeRecord')) {
    // console.log('Network.responseReceived', params);
    chrome.debugger.sendCommand({ tabId: debuggerId.tabId }, 'Network.getResponseBody', { requestId: params.requestId }, (response) => {
      const data = JSON.parse(response.body);
      // console.log(data);
      if(data.data.match('%')) {
        const progress = +data.data.replace('%', '');
        if (progress === 100) {
          // console.log(debuggerId.tabId);
          chrome.scripting.executeScript({
            target: { tabId: debuggerId.tabId },
            func: moveToNext,
          });
          console.log('当前培训已完成，准备切换到下一个');
        } else {
          console.log('当前培训未完成，继续学习, 进度是', progress);
        }
      } else {
        console.log('请求无效，等待下一次请求');
      }
    });
  }
});


function moveToNext() {
  const ids = [];
  const trainingCollections = document.getElementsByClassName('chapter_info');
  for(i = 0; i < trainingCollections.length; i++) {
    ids.push(trainingCollections[i].lastElementChild.getAttribute('data-id'));
  }
  const currentId = document.getElementsByClassName('btn chapter_play_btn active')[0].getAttribute('data-id');
  const currentIndex = ids.indexOf(currentId);
  if (currentIndex === ids.length - 1) {
    document.getElementsByClassName('layui-layer-content')[0].innerHTML = '当前培训所有内容已完成，请手动切换到下一个培训';
  } else {
    const nextId = ids[currentIndex + 1];
    const nextElement = document.querySelector(`[data-id="${nextId}"]`);
    nextElement.click();
  }
}
