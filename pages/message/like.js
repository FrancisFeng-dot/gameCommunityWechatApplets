import request from '../../utils/request';

Page({
  data:{
    likes: [],
    page: 1,
    loading: false,
    loaded: false,
    isShowTxt: false
  },
  onLoad() {
    this.fetch()
  },
  fetch() {
    // loading
    this.setData({ loading: true });
    // request
    request.get('/message-likes', {
      page: this.data.page,
    }, {
      success: (res) => {
        const likes = [...this.data.likes, ...res.data];
        const page = this.data.page + 1;
        // 全部加载完成
        let loaded = false;
        let isShowTxt = true;
        if (res.page.last_page <= this.data.page) {
          loaded = true;
          if (!likes.length) {
            isShowTxt = false;
          }
        }
        setTimeout(() => {
          this.setData({ isShowTxt });
        }, 300);
        this.setData({
          likes,
          page,
          loaded,
          loading: false
        });
      },
      complete: () => {
        setTimeout(() => {
          this.setData({ loading: false });
        }, 300);
        wx.stopPullDownRefresh();
      }
    })
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      likes: [],
      page: 1,
      loaded: false,
    })
    this.fetch();
  },
  // 上拉加载
  onReachBottom() {
    setTimeout(() => {
      if (!this.data.loading && !this.data.loaded) {
        this.fetch();
      }
    }, 300)
  },
})