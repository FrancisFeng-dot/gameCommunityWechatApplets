import request from '../../utils/request';
import { processDateline, processRichContent } from '../../utils/help';

const app = getApp();

Page({
  data: {
    id: 0,
    post: {
      thread_id: 0,
      author_base_info: {
        avatar: '/icons/lazy.svg',
        nickname: '粉丝',
      },
      behavior_total: {
        views: 0,
      },
      user_is_list: {
        favorite: 0,
        likes: 0,
      },
      message: '',
      type_id: 0,
      dateline: 0,
      floor: 1,
    },
    images: [],
    commentList: [],
    commentPage: 0,
    commentLoading: false,
    commentLoaded: false,
    commentTotal: 0,
    isOpenPost: 0,
    richContent: null,
    activeIndex: 0,
    likeList: [],
    likePage: 1,
    likeLoading: false,
    likeLoaded: false
  },
  onLoad(options) {
    this.setData({ id: options.id });
    this.getPostShow();
    this.postCommentList();
  },
  onReady() {
    this.setData({ 
      isOpenPost: Number(app.globalData.initData.is_open_post || 0),
    });
  },
  // 转发
  onShareAppMessage() {
    return {
      title: this.data.post.message,
      path: `/pages/post/post?id=${this.data.id}`,
    }
  },
  // 标签页点击
  tabClick(e) {
    if (!this.data.likeList.length && Number(e.currentTarget.id)) {
      this.fetchLikeList();
    }
    this.setData({
      activeIndex: Number(e.currentTarget.id)
    });
  },
  fetchLikeList() {
    this.setData({
      likeLoading: true,
    });
    request.get('/post-like', {thread_id: this.data.id, page: this.data.likePage}, {
      success: (res) => {
        const likeList = [...this.data.likeList, ...res.data];
        const likePage = this.data.likePage + 1;
        // 全部加载完成
        let likeLoaded = false;
        if (!res.page.next_page_url) {
          likeLoaded = true;
        }
        this.setData({
          likeList,
          likeLoading: false,
          likePage,
          likeLoaded
        });
      },
      complete: () => {
        setTimeout(() => {
          this.setData({ likeLoading: false });
        }, 500);
        wx.stopPullDownRefresh();
      }
    });
  },
  // 上拉加载
  onReachBottom() {
    setTimeout(() => {
      if (!this.data.commentLoading && !this.data.commentLoaded) {
        this.postCommentList();
      }
    }, 300)
  },
  // 帖子详情
  getPostShow() {
    const _this = this;

    request.get(`/post/${_this.data.id}`, {}, {
      success: (res) => {
        // 时间处理
        const post = {
          ...res.data,
          dateline: processDateline(res.data.dateline)
        };

        _this.setData({
          post,
        });
        
        // 富文本处理
        if (post.subject) {
          processRichContent(res.data.subject, this);
        }
      }
    });
  },
  // 点赞
  doLike() {
    const state = Number(this.data.post.user_is_list.likes) ? 0 : 1;

    request.post('/post-like', {
      like: state,
      thread_id: this.data.post.thread_id,
    }, {
      success: (res) => {
        if (res.code === 1) {
          this.getPostShow();

          // tip
          wx.showToast({
            title: res.msg
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: res.msg
          });
        }
        
      }
    });
  },
  // 收藏
  doFavorite() {
    const state = Number(this.data.post.user_is_list.favorite) ? 0 : 1;
    request.post('/post-favorite', {
      favorite: state,
      thread_id: this.data.post.thread_id,
    }, {
      success: (res) => {
        if (res.code === 1) {
          this.getPostShow();

          // tip
          wx.showToast({
            title: res.msg
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: res.msg
          });
        }
      }
    });
  },
  // 置顶
  doTop(state) {
  },
  // 加精
  doEssence(state) {
  },
  // 评论列表
  postCommentList() {
    this.setData({
      commentLoading: true,
    });

    request.get('/post-comment', {
      thread_id: this.data.id,
      page: this.data.commentPage + 1,
      sort: 1,
    }, {
      success: (res) => {
        // 楼层计算
        const commentNewList = [];
        res.data.forEach((item, index) => {
          commentNewList.push({ 
            ...item,
            floor: res.page.total - (res.page.current_page - 1 ) * res.page.per_page - index,
          });
        });

        this.setData({
          commentLoading: false,
          commentLoaded: res.page.current_page >= res.page.last_page,
          commentPage: res.page.current_page,
          commentTotal: res.page.total,
          commentList: [...this.data.commentList, ...commentNewList],
        });
      }
    })
  },
  // 预览图片
  previewImage(e) {
    const urls = [];
    this.data.post.attachment_list.forEach((item) => {
      urls.push(item.url);
    });

    wx.previewImage({
      current: e.target.dataset.url, // 当前显示图片的http链接
      urls, // 需要预览的图片http链接列表
    })
  },
  // 评论
  goCommentView(e) {
    if (this.data.isOpenPost) {
      // 父级id
      const parentId = e.target.dataset.parentid;

      // 数据中转
      const post = this.data.post;
      if (post.type_id === 10 || post.type_id === 11) {
        // B端发的帖子
        app.globalData.operateInfo = {
          nickname: post.forum_info.name,
          image: post.forum_info.logo,
          content: post.message,
        };
      } else {
        // c端发的帖子
        app.globalData.operateInfo = {
          nickname: post.author_base_info.nickname,
          image: post.author_base_info.avatar,
          content: post.message,
        };
      }

      wx.navigateTo({
        url: `/pages/post/postComment?post_id=${post.thread_id}&parent_id=${parentId}&index=0`,
      });
    }
  },
  // handle评论
  handleComment() {
    this.setData({
      commentList: [],
      commentPage: 0,
      commentLoading: false,
      commentLoaded: false,
    });
    
    this.getPostShow();
    this.postCommentList();
  },
})
