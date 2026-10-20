/* ═══ Aily 智能客服悬浮窗（匿名模式）+ 转人工表单 ═══
 * APP_KEY：Aily「应用管理 → 应用渠道管理 → SDK 渠道」复制的 APP Key
 * WEBHOOK_URL：Aily「工作流 → 任务 → 自定义触发」生成的 webhook 地址
 * WEBHOOK_TOKEN：该 webhook 的 Bearer Token（不要带 "Bearer " 前缀）
 * 表单字段（name / contact / category / content）
 * 与 webhook 触发任务中「技能入参」配置的参数名一一对应。
 */
(function () {
  var APP_KEY = 'a_f26b834dade24ff7af50617cc73f4522';

  /* ↓↓↓ 转人工 webhook 配置（URL 指向 Cloudflare Worker 转发层，token 由 Worker 持有，前端不留密）↓↓↓ */
  var WEBHOOK_URL = 'https://shiny-band-6cb8.zfdf4690.workers.dev';
  var WEBHOOK_TOKEN = '';
  /* ↑↑↑ 转人工 webhook 配置 ↑↑↑ */

  // ---- 初始化 CUI 会话组件（匿名模式）----
  var params = {
    common: {
      channelType: 'ANONYMOUS_CUI_SDK',
      resourceType: 'AILY_CUI_SDK'
    },
    conversation: {
      needAvatar: true,
      needWelcomeMessage: true,
      needCache: false
    },
    editor: {
      display: true,
      needFileUpload: true,
      needImageUpload: true
    }
  };

  // 兼容中文的 base64 编码，再 URL 编码后拼进 hash
  var configValue = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(params)))));
  var iframeSrc = 'https://aily.feishu.cn/cui#appkey=' + encodeURIComponent(APP_KEY) + '&config=' + configValue;

  var btn = document.getElementById('aily-chat-btn');
  var panel = document.getElementById('aily-chat-panel');
  var body = document.getElementById('aily-chat-body');
  if (!btn || !panel || !body) return;

  var iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.setAttribute('aria-label', '智能客服对话窗口');
  body.appendChild(iframe);

  btn.addEventListener('click', function () {
    panel.classList.toggle('open');
  });
  document.getElementById('aily-chat-close').addEventListener('click', function () {
    panel.classList.remove('open');
    closeForm();
  });

  // ---- 转人工：按钮 + 表单 + webhook 提交 ----
  var humanBtn = document.getElementById('aily-human-btn');
  var formView = document.getElementById('aily-form-view');
  var form = document.getElementById('aily-form');
  var formStatus = document.getElementById('aily-form-status');
  var submitBtn = form ? form.querySelector('.aily-form-submit') : null;
  if (!humanBtn || !formView || !form || !formStatus || !submitBtn) return;

  function openForm() {
    formView.hidden = false;
  }
  function closeForm() {
    formView.hidden = true;
    formStatus.hidden = true;
    formStatus.classList.remove('error');
    submitBtn.disabled = false;
    form.reset();
  }

  humanBtn.addEventListener('click', openForm);
  document.getElementById('aily-form-back').addEventListener('click', closeForm);

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var payload = {
      name: form.name.value.trim(),
      contact: form.contact.value.trim(),
      category: form.category.value,
      content: form.message.value.trim()
    };

    formStatus.hidden = false;
    formStatus.classList.remove('error');
    formStatus.textContent = '提交中，请稍候…';
    submitBtn.disabled = true;

    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + WEBHOOK_TOKEN
      },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.text().then(function (bodyText) {
          var bizOk = false, bizMsg = '';
          try {
            var body = JSON.parse(bodyText);
            if (body && body.data) {
              if (body.data.code === '0') { bizOk = true; }
              else if (body.data.message) { bizMsg = body.data.message; }
            }
          } catch (err) { /* 非 JSON 响应 */ }
          return { httpOk: res.ok, status: res.status, bizOk: bizOk, bizMsg: bizMsg };
        });
      })
      .then(function (result) {
        if (result.httpOk && result.bizOk) {
          formStatus.textContent = '✅ 已提交，人工客服会尽快联系您';
          setTimeout(function () { closeForm(); }, 2500);
        } else {
          formStatus.classList.add('error');
          formStatus.textContent = result.bizMsg
            ? '提交未成功（' + result.bizMsg + '），请稍后重试或拨打客服电话（待补充）'
            : '提交失败（HTTP ' + result.status + '），请稍后重试';
          submitBtn.disabled = false;
        }
      })
      .catch(function () {
        formStatus.classList.add('error');
        formStatus.textContent = '提交失败：可能受跨域限制，请直接拨打客服电话（待补充）';
        submitBtn.disabled = false;
      });
  });
})();
