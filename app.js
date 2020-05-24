import request from './utils/request';
import qs from './utils/qs';

App({
  globalData: {
    userInfo: null,
    token: '',
    initData: {},
    notice: null,
    operatePost: null,
    operateComment: null,
    operateUser: null,
    operateInfo: null,
    loginView: false,
    to: null,
  },
  onLaunch(options) {
    // 跳入页面记录
    console.log(options);
    const queryString = qs.stringify(options.query);
    this.globalData.to = `/${options.path}` + (queryString ? `?${queryString}` : '');

    // 维护登陆状态
    wx.checkSession({
      success: (res) => {},
      fail: () => {
        wx.login();
      }
    });

    try{
      // 从缓存中获取token
      const token = wx.getStorageSync('token') || null;
      console.log('token', token);

      if (token) {
        // token放入全局
        this.globalData.token = token;

        // 使页面流畅，先从缓存中获取初始数据
        this.globalData.initData = wx.getStorageSync('initData') || {};

        // 再从服务器中更新初始数据
        this.initData();
      } else {
        // 跳转登陆页面
        this.goLoginView();
      }
    } catch(e) {
      this.goLoginView();
    }
  },
  // 跳转登陆页面
  goLoginView() {
    wx.clearStorage();

    if (this.globalData.loginView === false) {
      wx.reLaunch({
        url: '/pages/auth/login'
      });
    }
  },
  // 初始化数据
  initData() {
    const _this = this;
    request.get('/', null, {
      success: (res) => {
        // 粉丝圈基本数据放入全局
        _this.globalData.initData = res.data;
        console.log('初始化数据完毕');
        
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
        if (!!res.data.is_pay_forum && !res.data.is_join_pay_forum) {
          wx.showModal({
            content: '请前往社区付费后获取校验码再来登录小程序',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                wx.reLaunch({
                  url: '/pages/me/binding'
                }); 
              }
            }
          });
          return;
        }
      },
    });
  }
})