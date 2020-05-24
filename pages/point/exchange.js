import request from '../../utils/request';

Page({
  data: {
    dataIndex: [],
    dataIndexPage: 1,
    dataIndexLoading: false,
    dataIndexLoaded: false,
    isShowTxt: true
  },
  onLoad() {
    this.getList();
  },
  // 上拉加载
  onReachBottom() {
    setTimeout(() => {
      if (!this.data.dataIndexLoading && !this.data.dataIndexLoaded) {
        this.getList();
      }
    }, 300)
  },
  getList() {
    // loading
    this.setData({ dataIndexLoading: true });

    // request
    request.get('/integral-order', {
      page: this.data.dataIndexPage,
    }, {
      success: (res) => {
        const dataIndex = [...this.data.dataIndex, ...res.data.data];
        const dataIndexPage = this.data.dataIndexPage + 1;

        // 全部加载完成
        let dataIndexLoaded = false;
        let isShowTxt = true;
        if (!res.data.next_page_url) {
          dataIndexLoaded = true;
          if (!dataIndex.length) {
            isShowTxt = false;
          }
        }
        dataIndex.forEach(item => {
          item.date = item.created_at.substr(0, 10);
          item.time = item.created_at.substr(11);
        });
        this.setData({
          dataIndex,
          dataIndexPage,
          dataIndexLoaded,
          isShowTxt
        });
      },
      complete: () => {
        this.setData({ dataIndexLoading: false });
      }
    })
  }
})
