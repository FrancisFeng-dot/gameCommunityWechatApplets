import request from '../../utils/request';

const app = getApp()

Page({
  data: {
    userInfo: {
      user_id: 0,
      nickname: '',
      avatar: '/icons/lazy.svg',
    },
    stats: {
      user_comment: 0,
      user_like: 0,
      user_post_count: 0,
      user_favorite_count: 0,
    }
  },
  onShow() {
    this.getStats();
  },
  getStats() {
    request.get('/user-profile', { my: 1 }, {
      success: (res) => {
        this.setData({
          stats: res.data,
          userInfo: res.data.user_info,
        });
      }
    })
  },
})
