import request from '../../utils/request';
import help from '../../utils/help';

Component({
  properties: {
    loading: {
      type: Boolean,
      value: false,
    },
    loaded: {
      type: Boolean,
      value: false,
    },
    postList: {
      type: Array,
      value: []
    },
    bannerList: {
      type: Array,
      value: []
    },
  },
  data: {
    tagActive: 0,
    topicList: [],
    topPostListFull: [],
    topPostList: [],
    topPostShowAll: false,
    isOpenAd: 0,
    playVideoId: null
  },
  attached() {
    const app = getApp();

    this.setData({
      topicList: app.globalData.initData.topic_list || null,
      isOpenAd: app.globalData.initData.is_open_ad || 0,
    });

    this.getTopPost();
  },
  methods: {
    postTapTag(e) {
      if (e.detail.topicId === this.data.tagActive) return;
      // 置顶帖筛选
      const topPostList = [];
      this.data.topPostListFull.forEach((item) => {
        if (e.detail.topicId === 0) {
          topPostList.push(item);
        } else if(item.topic_id === e.detail.topicId) {
          topPostList.push(item);
        }
      });

      this.setData({
        tagActive: e.detail.topicId,
        tagActiveId: `topic_${e.detail.topicId}`,
        topPostList,
      });
      this.triggerEvent('tapTag', { topicId: e.detail.topicId })
    },
    // 话题切换
    tapTag(e) {
      // 置顶帖筛选
      const topPostList = [];
      this.data.topPostListFull.forEach((item) => {
        if (e.currentTarget.dataset.id === 0) {
          topPostList.push(item);
        } else if(item.topic_id === e.currentTarget.dataset.id) {
          topPostList.push(item);
        }
      });

      this.setData({
        tagActive: e.currentTarget.dataset.id,
        topPostList,
      });

      this.triggerEvent('tapTag', { topicId: e.currentTarget.dataset.id })
    },
    handleTopPostShowAll() {
      this.setData({
        topPostShowAll: !this.data.topPostShowAll
      });
    },
    // 搜索微帖
  selectVideo(e) {
    this.setData({
      playVideoId: e.detail.value,
    })
  },
    // /post-stick
    getTopPost() {
      request.get('/post-stick', {}, {
        success: (res) => {
          const topPostList = [];
          if (res.data) {
            res.data.forEach((item) => {
              topPostList.push({
                ...item,
                message: help.processHtmlTag(item.message),
              });
            });
          }

          this.setData({
            topPostListFull: topPostList,
            topPostList,
          });
        }
      });
    },
    adView(e) {
      const appId = e.currentTarget.dataset.appid;
      if (appId) {
        wx.navigateToMiniProgram({
          appId,
          path: e.currentTarget.dataset.link,
        });
      }
    },
  },
})
