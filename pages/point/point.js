import request from '../../utils/request';
import { processBehavior } from '../../utils/help';
const userBehavior = [
  {
    key: 0,
    behavior: '圈主操作',
  },
  {
    key: 4,
    behavior: '发帖',
  },
  {
    key: 5,
    behavior: '分享',
  },
  {
    key: 10,
    behavior: '签到',
  },
  {
    key: 1,
    behavior: '回复',
  },
  {
    key: 52,
    behavior: '删除帖子',
  },
  {
    key: 50,
    behavior: '删除回复',
  },
  {
    key: 3,
    behavior: '点赞',
  },
  {
    key: 51,
    behavior: '取消点赞',
  },
  {
    key: 12,
    behavior: '打赏',
  },
  {
    key: 13,
    behavior: '购买',
  },
  {
    key: 100,
    behavior: '兑换商品',
  },
  {
    key: 101,
    behavior: '被回复',
  },
  {
    key: 111,
    behavior: '被置顶',
  },
  {
    key: 103,
    behavior: '被点赞',
  },
  {
    key: 115,
    behavior: '被加精',
  },
  {
    key: 200,
    behavior: '兑换有赞积分',
  },
];
Page({
  data: {
    integral: 0,
    pointsIndex: [],
    pointsIndexPage: 1,
    pointsIndexLoading: false,
    pointsIndexLoaded: false,
  },
  onLoad() {
    this.getPoint();
    this.getPointList();
  },
  // 上拉加载
  onReachBottom() {
    setTimeout(() => {
      if (!this.data.pointsIndexLoading && !this.data.pointsIndexLoaded) {
        this.getPointList();
      }
    }, 300);
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
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  getPointList() {
    // loading
    this.setData({ pointsIndexLoading: true });

    // request
    request.get('/integral-flows', {
      page: this.data.pointsIndexPage,
    }, {
      success: (res) => {
        const pointsIndex = [...this.data.pointsIndex, ...res.data.data];
        const pointsIndexPage = this.data.pointsIndexPage + 1;

        // 全部加载完成
        let pointsIndexLoaded = false;
        if (!res.data.next_page_url) {
          pointsIndexLoaded = true;
        }

        pointsIndex.forEach(item => {
          item.behaviorMsg = processBehavior(item.behavior, userBehavior); 
        });
        this.setData({
          pointsIndex,
          pointsIndexPage,
          pointsIndexLoaded
        });
      },
      complete: () => {
        this.setData({ pointsIndexLoading: false });
      }
    })
  }
})
