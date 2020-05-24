import request from '../../utils/request';

Page({
  data: {
    id: 0,
    postIndex: [],
    postIndexPage: 1,
    postIndexLoading: false,
    postIndexLoaded: false,
    user: {
      avatar: '/icons/lazy.svg',
      nickname: '',
    },
    postLost: [], 
  },
  onLoad(options) {
    this.setData({
      id: options.id,
    });

    this.getUserInfo();
    this.getPostIndex();
  },
  // 上拉加载
  onReachBottom() {
    setTimeout(() => {
      if (!this.data.postIndexLoading && !this.data.postIndexLoaded) {
        this.getPostIndex();
      }
    }, 300)
  },
  getUserInfo() {
    request.get('/user-profile', {
      my: 0,
      user_id: this.data.id,
    }, {
      success: (res) => {
        this.setData({
          user: res.data
        }); 
      }
    });
  },
  getPostIndex() {
    // loading
    this.setData({ postIndexLoading: true });

    // request
    request.get('/post', {
      page: this.data.postIndexPage,
      my: 1,
      user_id: this.data.id,
    }, {
      success: (res) => {
        const postIndex = [...this.data.postIndex, ...res.data.data];
        const postIndexPage = this.data.postIndexPage + 1;

        // 全部加载完成
        let postIndexLoaded = false;
        if (res.page.last_page <= this.data.postIndexPage) {
          postIndexLoaded = true;
        }

        this.setData({
          postIndex,
          postIndexPage,
          postIndexLoaded
        });
      },
      complete: () => {
        this.setData({ postIndexLoading: false });
      }
    })
  }
})
