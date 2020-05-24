Component({
  data: {
    name: '粉丝圈'
  },
  ready() {
    const app = getApp()
    if (app.globalData.initData.version_info && app.globalData.initData.version_info.owner_show) {
      this.setData({
        name: app.globalData.initData.version_info.owner_intro || this.data.name,
      });
    }
  },
})
