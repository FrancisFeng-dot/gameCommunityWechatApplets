import request from '../../utils/request';
const app = getApp()

const sliderWidth = 22;

Page({
  data: {
    tabs: ["全部", "精华", "活跃"],
    postIndex: [],
    postIndexPage: 1,
    postIndexLoading: false,
    postIndexLoaded: false,
    postIndexTopicId: 0,
    postEssence: [],
    postEssencePage: 1,
    postEssenceLoading: false,
    postEssenceLoaded: false,
    activeUserList: [],
    activeUserLoading: false,
    bannerList: [], // 广告
    notice: null, // 公告
    activeIndex: 0, // 标签index
    sliderOffset: 0,
    sliderLeft: 0,
    isOpenPost: 0,
    isRedPacketActivity: 0
  },
  onLoad() {
    // 标签页滑动条
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          sliderLeft: (res.windowWidth / this.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / 3 * this.data.activeIndex
        });
      }
    });

    // 公告
    this.getNotice();

    // banner
    this.getBannerList();

    // post数据
    this.getPosts();
  },
  onReady() {
    // 给获取初始信息留点时间
    setTimeout(() => {
      this.setData({
        isOpenPost: Number(app.globalData.initData.is_open_post || 0),
        isRedPacketActivity: Number(app.globalData.initData.is_red_packet_activity || 0),
      });
    }, 300);
  },
  // 转发
  onShareAppMessage() {
    return {
      title: app.globalData.initData.forum.name,
      path: '/pages/index/index'
    }
  },
  // 标签页点击
  tabClick(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });

    if (Number(e.currentTarget.id) === 1 && this.data.postEssence.length <= 0) {
      // 精华帖
      this.getPostEssence();
    } else if (Number(e.currentTarget.id) === 2 && this.data.activeUserList.length <= 0) {
      // 活跃用户
      this.getActiveUserList();
    }
  },
  // 公告
  getNotice() {
    const _this = this;

    request.get('/forum-notice', {}, {
      success: (res) => {
        app.globalData.notice = res.data;

        _this.setData({
          notice: res.data
        });
      }
    })
  },
  // 微帖列表
  getPosts(q) {
    if (this.data.isOpenPost || this.data.postIndexPage === 1) {
      // loading
      this.setData({ postIndexLoading: true });

      // request
      request.get('/post', {
        page: this.data.postIndexPage,
        topic_id: this.data.postIndexTopicId,
        q: q || '',
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
          setTimeout(() => {
            this.setData({ postIndexLoading: false });
          }, 500);
          wx.stopPullDownRefresh();
        }
      })
    } else {
      // 关闭发帖，帖子也只显示一页
      this.setData({
        postIndexLoaded: true,
      });
    }
  },
  // 搜索微帖
  handleSearch(e) {
    this.setData({
      postIndex: [],
      postIndexPage: 1,
    })

    this.getPosts(e.detail.value);
  },
  // 加精微帖列表
  getPostEssence() {
    // loading
    this.setData({ postEssenceLoading: true });

    // request
    request.get('/post-essence', {
      page: this.data.postEssencePage,
    }, {
      success: (res) => {
        const postEssence = [...this.data.postEssence, ...res.data];
        const postEssencePage = this.data.postEssencePage + 1;

        // 全部加载完成
        let postEssenceLoaded = false;
        if (res.page.last_page <= this.data.postEssencePage) {
          postEssenceLoaded = true;
        }

        this.setData({
          postEssence,
          postEssencePage,
          postEssenceLoaded
        });
      },
      complete: () => {
        setTimeout(() => {
          this.setData({ postEssenceLoading: false });
        }, 500);
        wx.stopPullDownRefresh();
      }
    })
  },
  // 活跃用户
  getActiveUserList() {
    this.setData({
      activeUserLoading: true,
    });

    request.get('/user-rank', {}, {
      success: (res) => {
        this.setData({
          activeUserList: res.data
        });
      },
      complete: () => {
        this.setData({
          activeUserLoading: false,
        });
      },
    });
  },
  // banner列表
  getBannerList() {
    request.get('/ad-windows', {
      site: 0,
    }, {
      success: (res) => {
        this.setData({
          bannerList: res.data
        });
      }
    });
  },
  // 切换话题
  handleTapTag(e) {
    this.setData({
      postIndex: [],
      postIndexPage: 1,
      postIndexTopicId: e.detail.topicId
    })

    this.getPosts();
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (Number(this.data.activeIndex) === 0) {
      this.setData({
        postIndex: [],
        postIndexPage: 1,
        postIndexLoaded: false,
      })
      this.getPosts();
    } else if (Number(this.data.activeIndex) === 1) {
      this.setData({
        postEssence: [],
        postEssencePage: 1,
        postEssenceLoaded: false,
      })
      this.getPostEssence();
    } else {
      wx.stopPullDownRefresh();
    }
  },
  // 上拉加载
  onReachBottom() {
    if (Number(this.data.activeIndex) === 0) {
      setTimeout(() => {
        if (!this.data.postIndexLoading && !this.data.postIndexLoaded) {
          this.getPosts();
        }
      }, 300)
    } else if (Number(this.data.activeIndex) === 1) {
      setTimeout(() => {
        if (!this.data.postEssenceLoading && !this.data.postEssenceLoaded) {
          this.getPostEssence();
        }
      }, 300)
    }
  },
  // handle发帖
  handlePost(data) {
    this.setData({
      postIndex: [],
      postIndexPage: 1,
      postIndexLoaded: false,
    })
    this.getPosts();
  },
  // handle评论
  handleComment(data, index) {
    console.log(data, index);
  },
})
