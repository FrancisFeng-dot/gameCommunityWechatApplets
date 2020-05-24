import request from '../../utils/request';
const app = getApp();

Page({
  data:{
    user: app.globalData.initData.user,
    avatar: app.globalData.initData.avatar,
    nickName: null,
    is_sign: app.globalData.initData.is_sign,
    status: 1,
    continuousList: [],
    continuousLoading: false,
    continuousLoaded: false,
    insistList: [],
    insistLoading: false,
    insistLoaded: false,
    initData: app.globalData.initData
  },
  onLoad() {
    let nickName = app.globalData.initData.user.nickname;
    if (nickName.length > 6) {
      nickName = nickName.substr(0, 6) + '...'
    }
    this.setData({
      nickName
    });
    if (!this.data.continuousList.length) {
      this.fetch();
    }
  },
  changeTab(e) {
    this.setData({
      status: Number(e.target.id)
    })
    if (Number(e.target.id) === 1 && !this.data.continuousList.length) {
      this.fetch();
    }
    if (Number(e.target.id) === 0 && !this.data.insistList.length) {
      this.fetch();
    }
  },
  // 签到连续榜坚持榜
  fetch() {
    const status = this.data.status;
    if (status === 1) {
      this.setData({
        continuousLoading: true
      })
    } else {
      this.setData({
        insistLoading: true
      })
    }
    request.get('/sign-ranking', {
      status
    }, {
      success: (res) => {
        if (res.code === 1) {
          if (status === 1) {
            this.setData({
              continuousList: res.data,
              continuousLoaded: true
            })
          } else {
            this.setData({
              insistList: res.data,
              insistLoaded: true
            })
          }
        } else {
          wx.showToast({
            icon: 'none',
            title: res.msg,
          });
        }
      },
      complete: () => {
        setTimeout(() => {
          if (status === 1) {
            this.setData({
              continuousLoading: false
            })
          } else {
            this.setData({
              insistLoading: false
            })
          }
        }, 500); 
      }
    });
  }
})