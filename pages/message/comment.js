import request from '../../utils/request';

Page({
  data:{
    comments: [],
    page: 1,
    loading: false,
    loaded: false,
    isShowTxt: true
  },
  onLoad() {
    this.fetch()
  },
  fetch() {
    // loading
    this.setData({ loading: true });
    // request
    request.get('/message-comments', {
      page: this.data.page,
    }, {
      success: (res) => {
        const comments = [...this.data.comments, ...res.data];
        const page = this.data.page + 1;
        // 全部加载完成
        let loaded = false;
        let isShowTxt = true;
        if (res.page.last_page <= this.data.page) {
          loaded = true;
          if (!comments.length) {
            isShowTxt = false;
          }
        }
        this.setData({
          comments,
          page,
          loaded,
          isShowTxt,
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
      comments: [],
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