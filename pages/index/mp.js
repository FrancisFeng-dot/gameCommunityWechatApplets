const app = getApp()

Page({
  data: {
    wxacode: null,
  },
  onLoad() {
    this.setData({
      wxacode: app.globalData.initData.mini_app_code,
    });
  },
  previewImage(e) {
    wx.previewImage({
      urls: [
        e.target.dataset.url
      ]
    })
  }
})
