import { config } from './config.js';

function queryReport(reportCode) {
  const resultDiv = document.getElementById('result');
  resultDiv.style.opacity = '0';
  resultDiv.innerHTML = '<div class="loader"></div>';
  resultDiv.style.opacity = '1';

  fetch(`${config.SCRIPT_URL}?reportCode=${reportCode}`)
    .then(response => response.json())
    .then(data => {
      resultDiv.style.opacity = '0';
      setTimeout(() => {
        if (data.found) {
          // Format the timestamp to be more readable
          const formattedDate = new Date(data.timestamp).toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          
          resultDiv.innerHTML = `
            <h2>回報紀錄詳情</h2>
            <div class="report-info">
              <p><strong>時間戳記：</strong> ${formattedDate}</p>
              <p><strong>回報者電子郵件：</strong> ${data.email}</p>
              <p><strong>問題類別：</strong> ${data.category}</p>
              <p><strong>問題描述：</strong> ${data.description}</p>
            </div>
            <div class="report-code">
              回報代碼: ${data.reportCode}
              <button class="copy-btn" onclick="window.copyToClipboard('${data.reportCode}')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
              </button>
            </div>
            <div class="utility-buttons">
              <button class="utility-btn" onclick="window.printReport()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                列印紀錄
              </button>
              <button class="utility-btn" onclick="window.sendEmail('${data.email}', '${data.reportCode}')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                郵件聯絡
              </button>
            </div>
          `;
        } else {
          resultDiv.innerHTML = '<p class="error-message">找不到相關回報紀錄。請確認回報代碼是否正確。</p>';
        }
        resultDiv.style.opacity = '1';
        hcaptcha.reset(); // Reset hCaptcha after form submission
      }, 300);
    })
    .catch(error => {
      console.error('Error:', error);
      resultDiv.style.opacity = '0';
      setTimeout(() => {
        resultDiv.innerHTML = '<p class="error-message">查詢時發生錯誤。請稍後再試。</p>';
        resultDiv.style.opacity = '1';
        hcaptcha.reset(); // Reset hCaptcha after error
      }, 300);
    });
}

document.addEventListener('DOMContentLoaded', function() {
  if (config.DARK_MODE_DEFAULT) {
    document.body.classList.add('dark-mode');
    updateThemeToggleIcon(true);
  }

  document.getElementById('queryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const reportCodeInput = document.getElementById('reportCode');
    const reportCode = reportCodeInput.value;
    const hcaptchaResponse = hcaptcha.getResponse();
    
    document.getElementById('reportCodeError').style.display = 'none';
    
    if (!reportCode) {
      document.getElementById('reportCodeError').style.display = 'block';
      return;
    }
    
    if (!hcaptchaResponse) {
      alert('請完成驗證碼');
      return;
    }
    
    queryReport(reportCode);
  });

  document.getElementById('themeToggle').addEventListener('click', function() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    updateThemeToggleIcon(isDarkMode);
    
    showToast(isDarkMode ? '已切換至深色模式' : '已切換至淺色模式');
  });

  document.getElementById('menuToggle').addEventListener('click', function() {
    const menuEl = document.getElementById('headerButtons');
    menuEl.classList.toggle('show');
    this.textContent = menuEl.classList.contains('show') ? '✕' : '☰';
  });

  document.querySelectorAll('.header-button').forEach(button => {
    button.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        document.getElementById('headerButtons').classList.remove('show');
        document.getElementById('menuToggle').textContent = '☰';
      }
    });
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      document.getElementById('headerButtons').classList.remove('show');
      document.getElementById('menuToggle').textContent = '☰';
    }
  });

  window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(function() {
      showToast('已複製到剪貼簿');
    }).catch(function(err) {
      showToast('複製失敗');
      console.error('Could not copy text: ', err);
    });
  };
  
  window.printReport = function() {
    window.print();
  };
  
  window.sendEmail = function(email, reportCode) {
    window.location.href = `mailto:${email}?subject=關於回報編號：${reportCode}&body=您好，我正在跟進回報編號 ${reportCode} 的問題。`;
  };

  if (config.ENABLE_COPY_PROTECTION) {
    document.addEventListener('copy', function(e) {
      e.preventDefault();
      return false;
    });

    document.addEventListener('keyup', function(e) {
      if (e.key == 'PrintScreen') {
        navigator.clipboard.writeText('');
        alert('截圖功能已被禁用');
      }
    });
  }

  if (config.ENABLE_RIGHT_CLICK_PROTECTION) {
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
  }

  if (config.ENABLE_TEXT_SELECTION_PROTECTION) {
    document.onselectstart = function() {
      return false;
    };
  }
});

function updateThemeToggleIcon(isDarkMode) {
  const themeToggle = document.getElementById('themeToggle');
  if (isDarkMode) {
    themeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"/></svg>';
  } else {
    themeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z"/></svg>';
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}