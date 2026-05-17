/**
 * 欧穆云官网 - 主脚本文件
 * 版本: 2.0
 * 功能: 处理表单上传、日期选择器、固定工具栏等交互
 */

// ============================================
// 初始化 Layui 模块
// ============================================
layui.use(['upload', 'element', 'form', 'layer', 'jquery', 'laydate', 'util'], function () {
  var $ = layui.jquery;
  var form = layui.form;
  var upload = layui.upload;
  var element = layui.element;
  var layer = layui.layer;
  var laydate = layui.laydate;
  var util = layui.util;

  // ------------------------------------------
  // 1. 文件上传功能
  // ------------------------------------------
  initFileUpload();

  // ------------------------------------------
  // 2. 日期范围选择器
  // ------------------------------------------
  initDateRange();

  // ------------------------------------------
  // 3. 右侧固定工具栏
  // ------------------------------------------
  initFixBar();

  /**
   * 初始化文件上传功能
   */
  function initFileUpload() {
    upload.render({
      elem: '#upload',
      url: '/upload', // 改成您自己的上传接口
      accept: 'images',
      done: function (res) {
        var img = res.data;
        // 将返回的信息设置到隐藏域
        $('#img').val(img);
        layer.msg('上传成功');
      },
      error: function (res) {
        // 请求异常回调
        console.error('上传失败:', res);
      }
    });
  }

  /**
   * 初始化日期范围选择器
   */
  function initDateRange() {
    laydate.render({
      elem: '#ID-laydate-range',
      range: ['#ID-laydate-start-date', '#ID-laydate-end-date']
    });
  }

  /**
   * 初始化右侧固定工具栏
   */
  function initFixBar() {
    util.fixbar({
      bars: [
        {
          type: 'QQ：1778607946',
          icon: 'layui-icon-login-qq'
        },
        {
          type: '微信：暂不公开',
          icon: 'layui-icon-login-wechat'
        },
        {
          type: '电话：暂不公开',
          icon: 'layui-icon-cellphone'
        },
        {
          type: '邮箱：1778607946@qq.com',
          icon: 'layui-icon-release'
        }
      ],
      on: {
        // 鼠标悬停事件
        mouseenter: function (type) {
          layer.tips(type, this, {
            tips: 4,
            fixed: true
          });
        },
        mouseleave: function (type) {
          layer.closeAll('tips');
        }
      },
      // 点击事件
      click: function (type) {
        console.log('点击工具栏:', type);
      }
    });
  }
});
