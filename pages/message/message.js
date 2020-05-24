import request from '../../utils/request';

Page({
  data:{
    count: null
  },
  onShow() {
    this.fetch();
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      count: null
    })
    this.fetch();
  },
  fetch() {
    request.get('/message-count', {}, {
      success: (res) => {
        if (res.code === 1) {
          this.setData({
            count: res.lists
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: res.msg,
          });
        }
      },
      complete: () => {
        wx.stopPullDownRefresh();
      }
    });
  }
})