const app = getApp()

Page({
  data: {
    notice: {},
  },
  onLoad() {
    this.setData({
      notice: app.globalData.notice,
    });
  },
})
