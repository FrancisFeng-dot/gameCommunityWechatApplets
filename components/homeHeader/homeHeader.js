import request from '../../utils/request';
import config from '../../config';
import { processNumber } from '../../utils/help';
const app = getApp();

Component({
  data: {
    searchInputShowed: false,
    searchInputValue: "",
    searchInputPlaceholder: "搜索微帖",
    initData: {
      topic_list: [],
      forum: {
        name: config.forumName,
        logo: config.forumLogo,
      },
      forum_background: '/icons/lazy.svg',
      is_show_user_count: 0,
      is_show_user_level: 0
    },
  },
  attached() {
    this.setData({
      initData: { 
        ...app.globalData.initData,
        forum_user_count: processNumber(app.globalData.initData.forum_user_count),
        forum_view_count: processNumber(app.globalData.initData.forum_view_count),
      },
    });
  },
  methods: {
    showSearchInput() {
      this.setData({
        searchInputShowed: true
      });
    },
    hideInput() {
      this.setData({
        searchInputShowed: false
      });
    },
    clearInput() {
      this.setData({
        searchInputValue: ""
      });
    },
    inputTyping(e) {
      this.setData({
        searchInputValue: e.detail.value
      });
    },
    // searchPost
    searchPost() {
      this.triggerEvent('search', { value: this.data.searchInputValue })

      this.setData({
        searchInputPlaceholder: this.data.searchInputValue ?
          `「${this.data.searchInputValue}」相关微帖` : '搜索微帖',
      });
    },
    // 签到
    sign() {
      if (this.data.initData.is_sign === 0) {
        request.post('/user-sign', {}, {
          success: (res) => {
            if (res.code === 1) {
              wx.showToast({
                icon: 'success',
                title: res.msg,
              });
              app.globalData.initData.is_sign = 1;

              this.setData({
                initData: {
                  ...this.data.initData,
                  is_sign: 1
                },
              });
            } else {
              wx.showToast({
                icon: 'none',
                title: res.msg,
              });
            }
          }
        });
      } else {
        wx.navigateTo({
          url: '/pages/sign/sign'
        })
      }
    }
  }
})