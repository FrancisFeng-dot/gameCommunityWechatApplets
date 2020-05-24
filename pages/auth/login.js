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
  onLoad() {
    app.globalData.loginView = true;
  },
  onUnload() {
    app.globalData.loginView = false;
  },
  // 登陆
  login(res) {
    const _this = this;

    // 同意获取用户数据
    if (res.detail.userInfo) {
      wx.login({
        success: (wxLoginRes) => {
          // 信息存入
          _this.setData({
            userInfo: res.detail.userInfo,
            code: wxLoginRes.code,
          });

          // 预登陆
          _this.loginPre();
        }
      });
    } else {
      wx.showModal({
        content: '您拒绝了登陆',
        showCancel: false,
      });
    }
  },
  // 预登陆
  loginPre() {
    // 登陆loading
    wx.showLoading({
      title: '登陆中',
      mask: true,
    });

    const _this = this;
    request.post('/pre-login', {
      code: this.data.code,
    }, {
      success: (res) => {
        if (res.code === 1) {
          // 首次登录
          // _this.setData({
          //   activeIndex: 1,
          // });
          if (res.token) {
            // 已经登录过
            console.log('again', res)
            _this.cacheData(res.token);
          } else {
            // 首次登录
            _this.loginFromSever();
          }
        } else {
          wx.showModal({
            content: res.msg,
            showCancel: false,
          });
        }
      },
      fail: () => {
        wx.showModal({
          content: '网络错误',
          showCancel: false,
        });
      },
      complete: () => {
        wx.hideLoading();
      },
    })
  },
  // 登陆粉丝圈
  loginFromSever(userCode) {
    // 登陆loading
    wx.showLoading({
      title: '登陆中',
      mask: true,
    });

    const _this = this;
    request.post('/login-v2', {
      code: _this.data.code,
      nickname: _this.data.userInfo.nickName,
      avatar: _this.data.userInfo.avatarUrl
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
  // loginWithOldUser() {
  //   if (this.data.userCode === '') {
  //     wx.showModal({
  //       content: '请输入校验码',
  //       showCancel: false,
  //     });
  //   } else {
  //     this.loginFromSever(this.data.userCode);
  //   }
  // },
  // 老用户登录
  // loginWithNewUser() {
  //   this.loginFromSever('');
  // },
  // change
  // handleInputUserCode(e) {
  //   this.setData({
  //     userCode: e.detail.value,
  //   });
  // },
  // 选择老用户
  // selectOldUser() {
  //   this.setData({
  //     activeIndex: 2
  //   });
  // },
  // 取消选择
  // cancelSelectOldUser() {
  //   this.setData({
  //     userCode: '',
  //     activeIndex: 1
  //   });
  // },
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
