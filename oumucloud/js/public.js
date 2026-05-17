/**
 * 隐私协议页面 - 主题切换功能（增强版）
 * 版本: 3.0
 */

// ============================================
// 主题切换控制器
// ============================================
(function () {
  "use strict";

  var isDarkMode = false;
  var toggleButton = null;

  /**
   * 切换到夜间模式
   */
  function enableDarkMode() {
    document.body.classList.add("dark-mode");
    updateToggleButtonIcon(true);

    // 保存用户偏好
    try {
      localStorage.setItem("theme", "dark");
    } catch (e) {
      console.warn("无法保存主题偏好");
    }
  }

  /**
   * 切换到白天模式
   */
  function enableLightMode() {
    document.body.classList.remove("dark-mode");
    updateToggleButtonIcon(false);

    // 保存用户偏好
    try {
      localStorage.setItem("theme", "light");
    } catch (e) {
      console.warn("无法保存主题偏好");
    }
  }

  /**
   * 更新切换按钮图标
   * @param {boolean} isDark - 是否为夜间模式
   */
  function updateToggleButtonIcon(isDark) {
    if (!toggleButton) return;

    if (isDark) {
      // 太阳图标（切换到白天）
      toggleButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    } else {
      // 月亮图标（切换到夜间）
      toggleButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    }
  }

  /**
   * 切换主题
   */
  function toggleTheme() {
    isDarkMode = !isDarkMode;

    if (isDarkMode) {
      enableDarkMode();
    } else {
      enableLightMode();
    }
  }

  /**
   * 检测系统主题偏好
   */
  function detectSystemTheme() {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  }

  /**
   * 初始化主题切换功能
   */
  function initThemeToggle() {
    toggleButton = document.getElementById("theme-toggle");

    if (toggleButton) {
      toggleButton.addEventListener("click", toggleTheme);

      // 检查用户之前的主题偏好
      try {
        var savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
          isDarkMode = true;
          enableDarkMode();
        } else if (savedTheme === "light") {
          isDarkMode = false;
          enableLightMode();
        } else {
          // 如果没有保存的偏好，使用系统主题
          var systemTheme = detectSystemTheme();
          if (systemTheme === "dark") {
            isDarkMode = true;
            enableDarkMode();
          }
        }
      } catch (e) {
        console.warn("无法读取主题偏好");
      }
    } else {
      console.warn("主题切换按钮未找到");
    }
  }

  // DOM 加载完成后初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle);
  } else {
    initThemeToggle();
  }
})();
