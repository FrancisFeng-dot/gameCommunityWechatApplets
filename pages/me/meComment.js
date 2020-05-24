import request from '../../utils/request';

const app = getApp()

Page({
  data: {
    page: 0,
    list: [],
    loading: false,
    loaded: false,
  },
  onLoad() {
    this.getComment();
  },
  // 上拉加载
  onReachBottom() {
    setTimeout(() => {
      if (!this.data.loading && !this.data.loaded) {
        this.getComment();
      }
    }, 300)
  },
  getComment() {
    this.setData({
      loading: true,
    });

    request.get('/post-comment', {
      my: 1,
      page: this.data.page + 1 
    }, {
      success: (res) => {
        console.log(res);
        const loaded = res.page.current_page >= res.page.last_page;

        this.setData({
          page: res.page.current_page,
          list: [...this.data.list, ...res.data],
          loading: false,
          loaded,
        });
      }
    })
  },
})
