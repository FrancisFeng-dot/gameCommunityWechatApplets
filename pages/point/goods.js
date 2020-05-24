import request from '../../utils/request';

Page({
  data: {
    integral: 0,
    goodsIndex: [],
    goodsIndexPage: 1,
    goodsIndexLoading: false,
    goodsIndexLoaded: false,
  },
  onLoad() {
    this.getPoint();
    this.getGoods();
  },
  // 上拉加载
  onReachBottom() {
    setTimeout(() => {
      if (!this.data.goodsIndexLoading && !this.data.goodsIndexLoaded) {
        this.getGoods();
      }
    }, 300)
  },
  getPoint() {
    request.get('/integral-get', {}, {
      success: (res) => {
        this.setData({
          integral: res.data.integral
        }); 
      }
    });
  },
  getGoods() {
    // loading
    this.setData({ goodsIndexLoading: true });

    // request
    request.get('/integral-goods', {
      page: this.data.goodsIndexPage,
    }, {
      success: (res) => {
        const goodsIndex = [...this.data.goodsIndex, ...res.data.data];
        const goodsIndexPage = this.data.goodsIndexPage + 1;

        // 全部加载完成
        let goodsIndexLoaded = false;
        if (!res.data.next_page_url) {
          goodsIndexLoaded = true;
        }

        this.setData({
          goodsIndex,
          goodsIndexPage,
          goodsIndexLoaded
        });
      },
      complete: () => {
        this.setData({ goodsIndexLoading: false });
      }
    })
  }
})
