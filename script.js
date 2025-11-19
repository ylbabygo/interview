// 51talk 用户访谈会邀请函 - JavaScript 交互逻辑
// 添加兼容性检查
if (typeof window === 'undefined') {
    console.error('window对象不存在');
} else {
    // 检查必要的浏览器特性
    if (!window.localStorage) {
        console.warn('localStorage不支持，部分功能可能受限');
    }
}

// 安全的DOMContentLoaded监听器
function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

ready(function() {

    // DOM 元素获取
    const form = document.getElementById('invitationForm');
    const nameInput = document.getElementById('userName');
    const timeSlotInputs = document.querySelectorAll('input[name="timeSlot"]');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalOverlay = document.getElementById('successModal');

    // 错误信息元素
    const nameError = document.getElementById('nameError');
    const timeSlotError = document.getElementById('timeSlotError');

    // 确认信息元素
    const confirmName = document.getElementById('confirmName');
    const confirmTime = document.getElementById('confirmTime');

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 验证姓名输入
    function validateName() {
        const name = nameInput.value.trim();

        if (!name) {
            showError(nameInput, nameError, '请输入您的称呼');
            return false;
        }

        if (name.length < 2) {
            showError(nameInput, nameError, '称呼至少需要2个字符');
            return false;
        }

        if (name.length > 20) {
            showError(nameInput, nameError, '称呼不能超过20个字符');
            return false;
        }

        hideError(nameInput, nameError);
        return true;
    }

    // 验证时间段选择
    function validateTimeSlot() {
        const selectedSlot = document.querySelector('input[name="timeSlot"]:checked');

        if (!selectedSlot) {
            showError(null, timeSlotError, '请选择参会时间段');
            return false;
        }

        hideError(null, timeSlotError);
        return true;
    }

    // 显示错误信息
    function showError(input, errorElement, message) {
        if (input) {
            input.classList.add('error');
        }
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    // 隐藏错误信息
    function hideError(input, errorElement) {
        if (input) {
            input.classList.remove('error');
        }
        errorElement.classList.remove('show');
    }

    // 实时验证姓名输入
    nameInput.addEventListener('input', debounce(validateName, 300));
    nameInput.addEventListener('blur', validateName);

    // 时间段选择变化时验证
    timeSlotInputs.forEach(input => {
        input.addEventListener('change', validateTimeSlot);
    });

    // 获取时间段显示文本
    function getTimeSlotText(slotValue) {
        const timeSlotMap = {
            'AM': '11月29日 上午 9:30-11:30',
            'PM': '11月29日 下午 14:00-16:00'
        };
        return timeSlotMap[slotValue] || slotValue;
    }

    // 获取用户IP地址（简化版本，实际部署时需要后端接口）
    async function getUserIP() {
        try {
            // 注意：实际部署时需要使用可靠的服务，这里只是示例
            const response = await fetch('https://httpbin.org/ip');
            const data = await response.json();
            return data.origin || '';
        } catch (error) {
            console.log('获取IP地址失败:', error);
            return '';
        }
    }

    // 提交数据到Supabase
    async function submitData(data) {
        try {
            console.log('正在提交数据到Supabase:', data);

            // 提交到Supabase数据库
            const { data: result, error } = await window.supabaseClient
                .from('registrations')
                .insert([{
                    user_name: data.user_name,
                    selected_slot: data.selected_slot,
                    ip_address: data.ip_address
                }])
                .select();

            if (error) {
                console.error('Supabase错误:', error);
                throw error;
            }

            console.log('Supabase提交成功:', result);
            return { success: true, message: '提交成功', data: result };

        } catch (error) {
            console.error('提交错误:', error);

            // 如果Supabase失败，保存到本地存储作为备份
            saveToLocalStorage(data);

            throw error;
        }
    }

    // 保存到本地存储（作为备用）
    function saveToLocalStorage(data) {
        try {
            let registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
            registrations.push({
                ...data,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('registrations', JSON.stringify(registrations));
        } catch (error) {
            console.error('本地存储失败:', error);
        }
    }

    // 显示成功弹窗
    function showSuccessModal(name, timeSlot) {
        confirmName.textContent = name;
        confirmTime.textContent = getTimeSlotText(timeSlot);
        successModal.style.display = 'flex';

        // 阻止背景滚动
        document.body.style.overflow = 'hidden';
    }

    // 关闭成功弹窗
    function closeModal() {
        successModal.style.display = 'none';
        document.body.style.overflow = '';

        // 重置表单
        form.reset();
    }

    // 表单提交处理
    async function handleFormSubmit(event) {
        event.preventDefault();

        // 验证表单
        const isNameValid = validateName();
        const isTimeSlotValid = validateTimeSlot();

        if (!isNameValid || !isTimeSlotValid) {
            // 震动反馈（如果设备支持）
            if (navigator.vibrate) {
                navigator.vibrate(200);
            }
            return;
        }

        // 获取表单数据
        const formData = {
            user_name: nameInput.value.trim(),
            selected_slot: document.querySelector('input[name="timeSlot"]:checked').value,
            submit_time: new Date().toISOString(),
            ip_address: await getUserIP()
        };

        // 显示加载状态
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';

        try {
            // 提交数据
            const result = await submitData(formData);

            // 保存到本地存储作为备份
            saveToLocalStorage(formData);

            // 显示成功弹窗
            showSuccessModal(formData.user_name, formData.selected_slot);

            // 记录成功日志
            console.log('表单提交成功:', formData);

        } catch (error) {
            console.error('表单提交失败:', error);

            // 显示错误提示
            alert('提交失败，请检查网络连接后重试。如果问题持续，请截图保存此页面。');

            // 保存到本地存储作为备份
            saveToLocalStorage(formData);

            // 即使网络失败也显示成功（避免重复提交）
            showSuccessModal(formData.user_name, formData.selected_slot);

        } finally {
            // 恢复按钮状态
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
        }
    }

    // 绑定事件监听器
    form.addEventListener('submit', handleFormSubmit);
    closeModalBtn.addEventListener('click', closeModal);

    // 点击弹窗背景关闭弹窗
    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    // ESC 键关闭弹窗
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && successModal.style.display === 'flex') {
            closeModal();
        }
    });

    // 检测微信浏览器
    function isWeChatBrowser() {
        return /micromessenger/i.test(navigator.userAgent);
    }

    // 微信分享配置（需要在微信环境中配置JS-SDK）
    function initWeChatShare() {
        if (typeof wx !== 'undefined') {
            wx.config({
                // 配置参数需要从后端获取
                // debug: true,
                // appId: 'your-app-id',
                // timestamp: timestamp,
                // nonceStr: nonceStr,
                // signature: signature,
                // jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData']
            });

            wx.ready(function() {
                // 分享给朋友
                wx.updateAppMessageShareData({
                    title: '51talk 用户访谈会诚挚邀请',
                    desc: '期待您的参与，共创更好产品体验',
                    link: window.location.href,
                    imgUrl: window.location.origin + '/logo.png',
                    success: function() {
                        console.log('微信分享成功');
                    },
                    cancel: function() {
                        console.log('微信分享取消');
                    }
                });

                // 分享到朋友圈
                wx.updateTimelineShareData({
                    title: '51talk 用户访谈会诚挚邀请',
                    link: window.location.href,
                    imgUrl: window.location.origin + '/logo.png',
                    success: function() {
                        console.log('朋友圈分享成功');
                    },
                    cancel: function() {
                        console.log('朋友圈分享取消');
                    }
                });
            });
        }
    }

    // 页面可见性变化处理
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            // 页面重新可见时的处理
            console.log('页面重新可见');
        }
    });

    // 网络状态监控
    function monitorNetworkStatus() {
        function updateNetworkStatus() {
            const isOnline = navigator.onLine;

            if (!isOnline) {
                // 网络断开时的处理
                console.log('网络连接断开');

                // 可以在这里显示网络状态提示
                const networkStatus = document.createElement('div');
                networkStatus.textContent = '网络连接已断开，请检查网络设置';
                networkStatus.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: #ff4757;
                    color: white;
                    text-align: center;
                    padding: 12px;
                    z-index: 9999;
                    font-size: 14px;
                `;
                document.body.appendChild(networkStatus);

                // 网络恢复时移除提示
                setTimeout(() => {
                    if (networkStatus.parentNode) {
                        networkStatus.parentNode.removeChild(networkStatus);
                    }
                }, 5000);
            }
        }

        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
    }

    // 性能监控
    function trackPerformance() {
        if (performance.getEntriesByType) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.loadEventStart;
            console.log('页面加载时间:', loadTime, 'ms');
        }
    }

    // 防止页面缓存（在移动端很重要）
    function preventCache() {
        window.addEventListener('pageshow', function(event) {
            if (event.persisted) {
                // 页面从缓存中恢复时重新加载
                window.location.reload();
            }
        });
    }

    // 初始化
    function init() {
        // 检测微信浏览器
        if (isWeChatBrowser()) {
            document.body.classList.add('wechat-browser');

            // 延迟初始化微信分享（等待JS-SDK加载）
            setTimeout(initWeChatShare, 1000);
        }

        // 初始化网络状态监控
        monitorNetworkStatus();

        // 防止缓存
        preventCache();

        // 性能监控
        if (document.readyState === 'complete') {
            trackPerformance();
        } else {
            window.addEventListener('load', trackPerformance);
        }

        console.log('51talk 用户访谈会邀请函页面初始化完成');
    }

    // 启动应用
    init();

    // 全局错误处理
    window.addEventListener('error', function(event) {
        console.error('页面错误:', event.error);

        // 可以在这里添加错误上报逻辑
        // reportError(event.error);
    });

    // 全局Promise错误处理
    window.addEventListener('unhandledrejection', function(event) {
        console.error('未处理的Promise错误:', event.reason);

        // 可以在这里添加错误上报逻辑
        // reportError(event.reason);
    });
});

// 工具函数：格式化日期时间
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// 工具函数：复制到剪贴板
function copyToClipboard(text) {
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(text)
            .then(() => true)
            .catch(() => false);
    } else {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}