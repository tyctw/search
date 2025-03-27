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
          resultDiv.innerHTML = `
            <h2>回報紀錄詳情</h2>
            <div class="report-info">
              <p><strong>時間戳記：</strong> ${data.timestamp}</p>
              <p><strong>回報者電子郵件：</strong> ${data.email}</p>
              <p><strong>問題類別：</strong> ${data.category}</p>
              <p><strong>問題描述：</strong> ${data.description}</p>
            </div>
            <div class="report-code">回報代碼: ${data.reportCode}</div>
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Form submission
  document.getElementById('queryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const reportCode = document.getElementById('reportCode').value;
    const hcaptchaResponse = hcaptcha.getResponse();
    
    if (!hcaptchaResponse) {
      alert('請完成驗證碼');
      return;
    }
    
    queryReport(reportCode);
  });

  // Menu toggle functionality
  document.getElementById('menuToggle').addEventListener('click', function() {
    const menuEl = document.getElementById('headerButtons');
    menuEl.classList.toggle('show');
    this.textContent = menuEl.classList.contains('show') ? '✕' : '☰';
  });

  // Auto-collapse menu when menu item is clicked (on mobile)
  document.querySelectorAll('.header-button').forEach(button => {
    button.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        document.getElementById('headerButtons').classList.remove('show');
        document.getElementById('menuToggle').textContent = '☰';
      }
    });
  });

  // Reset menu state when window is resized
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      document.getElementById('headerButtons').classList.remove('show');
      document.getElementById('menuToggle').textContent = '☰';
    }
  });

  // Security features based on config
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