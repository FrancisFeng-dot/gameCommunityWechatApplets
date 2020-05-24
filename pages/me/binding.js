import request from '../../utils/request';
import config from '../../config';

const app = getApp();

Page({
  data: {
    userCode: '',
    config
  },
  // 登陆粉丝圈
  loginFromSever(userCode) {
    // 登陆loading
    wx.showLoading({
      title: '登陆中',
      mask: true,
    });

    const _this = this;
    request.post('/user-synchronize', {
      user_code: userCode
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
          console.log('first', res)
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
  // change
  handleInputUserCode(e) {
    this.setData({
      userCode: e.detail.value,
    });
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
