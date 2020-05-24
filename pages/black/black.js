import request from '../../utils/request';
import config from '../../config';

const app = getApp();

Page({
  data: {
    code: null,
    userInfo: null,
    activeIndex: 0,
    userCode: '',
    config,
  },
  // 登陆粉丝圈
  loginFromSever() {
    // 登陆loading
    wx.showLoading({
      title: '登陆中',
      mask: true,
    });

    const _this = this;
    request.post('/login', {
      user_code: _this.data.userCode
    }, {
      success: (res) => {
        if (res.code === 1) {
          if (res.token) {
            _this.cacheData(res.token);
          } else {
            wx.showModal({
              content: res.msg,
              showCancel: false,
            });
          }
        } else {
          wx.showModal({
            content: res.msg,
            showCancel: false,
          });
        }
      },
      complete: () => {
        wx.hideLoading();
      },
    })
  },
  // 老用户登录
  loginWithOldUser() {
    if (this.data.userCode === '') {
      wx.showModal({
        content: '请输入校验码',
        showCancel: false,
      });
    } else {
      this.loginFromSever(this.data.userCode);
    }
  },
  // 老用户登录
  loginWithNewUser() {
    this.loginFromSever('');
  },
  // 相关数据放入缓存
  cacheData(token) {
    // token放入全局数据
    app.globalData.token = token;

    // token放入缓存
    wx.setStorage({
      key: 'token',
      data: token,
    });

    // 登陆loading
    wx.showLoading({
      title: '初始化',
      mask: true,
    });

    // 初始化数据
    request.get('/', null, {
      success: (res) => {
        console.log('粉丝圈基础数据', res)

        // 粉丝圈基本数据放入全局
        app.globalData.initData = res.data;
        
        // 粉丝圈基本数据放入缓存
        wx.setStorage({
          key: 'initData',
          data: res.data
        });

        if (!!res.data.user.is_black) {
          wx.reLaunch({
            url: '/pages/black/black'
          }); 
          return;
        }

        // 跳到首页
        const to = app.globalData.to || '/pages/index/index'
        console.log('登陆前页面', to);
        wx.reLaunch({
          url: to,
        });
      },
      complete: () => {
        wx.hideLoading();
      },
    });
  }
});
