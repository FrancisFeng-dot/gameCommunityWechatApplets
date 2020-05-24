import { processDateline, processHtmlTag, processRichContent } from '../../utils/help'
import request from '../../utils/request';

const app = getApp();

Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    post: {
      type: Object,
      value: {},
    },
    index: {
      type: Number,
      value: 0,
    },
    showComment: {
      type: Boolean,
      value: true
    },
    showOperate: {
      type: Boolean,
      value: true
    },
    showBehavior: {
      type: Boolean,
      value: true
    },
    navigatorType: {
      type: String,
      value: 'navigate'
    },
    playVideoId: {
      type: Number,
      value: -1
    }
  },
  data: {
    initData: null,
    dateline: null,
    imageCount: 0,
    essence: 0,
    showVideo: false,
    userIsList: {
      favorite: 0,
      likes: 0,
    },
    behaviorTotal: {
      comments: 0,
      likes: 0,
      rewards: 0,
      views: 0,
    },
    threadStatusList: {
      essence: 0,
      pay: 0,
      top: 0,
    },
    isOpenPost: 0,
    isShowUserLevel: 0,
    behaviorListsComments: [],
    isExist: true,
    canShrink: false,
    isShrink: false,
    messageShrink: '',
    topicMergeMessage: '',
    richContent: null,
    userBlack: 0
  },
  ready() {
    this.processData();
  },
  methods: {
    processData() {
      // 时间格式化
      const dateline = processDateline(this.properties.post.dateline);

      if (!!this.properties.post.topic_id && !!this.properties.post.topic_info && !!this.properties.post.topic_info.topic_name) {
        const str =`<a class="blue float-left" href="${this.properties.post.topic_info.topic_cate_id}">#${this.properties.post.topic_info.topic_name}#</a>`;
        const message = str + this.properties.post.message;
        this.setData({
          topicMergeMessage: message
        });
      } else {
        this.setData({
          topicMergeMessage: this.properties.post.message
        });
      }

      // 内容
      if (this.properties.post.message.length > 200) {
        this.setData({
          canShrink: true,
          isShrink: true,
        });
        processRichContent(this.data.topicMergeMessage.substr(0, 200) + '...', this);
      } else {
        processRichContent(this.data.topicMergeMessage, this);
      }
      
      // 图片数量
      const imageCount = (
        this.properties.post.attachment_list &&
        (this.properties.post.attachment_list instanceof Array)
      ) ? this.properties.post.attachment_list.length : 0;

      // 评论
      const behaviorListsComments = [];
      if (this.properties.post.behavior_lists.comments) {
        this.properties.post.behavior_lists.comments.forEach((item) => {
          let contentSimple = processHtmlTag(item.content);
          if (contentSimple.length > 80) {
            contentSimple = contentSimple.substr(0, 80) + '...';
          }

          behaviorListsComments.push({
            ...item,
            content: contentSimple,
          });
        });
      }

      // 数据
      this.setData({
        dateline,
        imageCount,
        userIsList: this.properties.post.user_is_list,
        behaviorTotal: this.properties.post.behavior_total,
        threadStatusList: this.properties.post.thread_status_list,
        isOpenPost: Number(app.globalData.initData.is_open_post || 0),
        isShowUserLevel: Number(app.globalData.initData.is_show_user_level || 0),
        behaviorListsComments,
        userBlack: !!this.properties.post.author_advanced_info ? this.properties.post.author_advanced_info.is_black : 1
      });
    },

    // 切换话题
    wxParseTagATap(e) {
      if (!!e.currentTarget.dataset.src) {
        this.triggerEvent('postTapTag', { topicId: Number(e.currentTarget.dataset.src) })
      }
    },

    goDetail() {
      wx.navigateTo({
        url: `/pages/post/post?id=${this.properties.post.thread_id}`
      })
    },

    // 操作列表
    postOperate(e) {
      const favoriteName = this.data.userIsList.favorite ? '取消收藏' : '收藏';
      const topName = this.data.threadStatusList.top ? '取消置顶' : '置顶';
      const essenceName = this.data.threadStatusList.essence ? '取消加精' : '加精';
      const blackName = this.data.userBlack ? '取消拉黑' : '拉黑';
      const deleteName = '删除';

      const commonList = [favoriteName];
      let powerList = [];
      if (this.properties.post.type_id === 10 || this.properties.post.type_id === 11) {
        powerList = [favoriteName, topName, essenceName, deleteName];
      } else {
        powerList = [favoriteName, topName, essenceName, deleteName, blackName];
      }
      

      wx.showActionSheet({
        itemList: app.globalData.initData.user.is_admin ? powerList : commonList,
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.doFavorite(this.data.userIsList.favorite ? 0 : 1);
              break;
            case 1:
              this.doTop(this.data.threadStatusList.top ? 0 : 1);
              break;
            case 2:
              this.doEssence(this.data.threadStatusList.essence ? 0 : 1);
              break;
            case 3:
              this.doDelete();
              break;
            case 4:
              this.blackUser(this.data.userBlack ? 0 : 1);
              break;
            default:
              break;
          }
        }
      });
    },
    // 预览图片
    previewImage(e) {
      const urls = [];
      this.properties.post.attachment_list.forEach((item) => {
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
        const post = this.properties.post;
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
          url: `/pages/post/postComment?post_id=${post.thread_id}&parent_id=${parentId}&index=${this.data.index}`,
        });
      }
    },
    // 点赞
    doLike(e) {
      request.post('/post-like', {
        like: e.target.dataset.like,
        thread_id: this.properties.post.thread_id,
      }, {
          success: (res) => {
            if (res.code === 1) {
              const changeCount = Number(e.target.dataset.like) === 1 ? 1 : -1;

              this.setData({
                userIsList: {
                  ...this.data.userIsList,
                  likes: Number(e.target.dataset.like),
                },
                behaviorTotal: {
                  ...this.data.behaviorTotal,
                  likes: this.data.behaviorTotal.likes + changeCount,
                },
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
    doFavorite(favorite) {
      request.post('/post-favorite', {
        favorite,
        thread_id: this.properties.post.thread_id,
      }, {
          success: (res) => {
            if (res.code === 1) {
              this.setData({
                userIsList: {
                  ...this.data.userIsList,
                  favorite,
                },
              });

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
    // 拉黑用户
    blackUser(state) {
      request.post('/user-black', {
        black: state,
        author_id: this.properties.post.author_id,
      }, {
          success: (res) => {
            if (res.code === 1) {
              this.setData({
                userBlack: Number(state)
              })
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
      request.post('/post-stick', {
        top: state,
        thread_id: this.properties.post.thread_id,
      }, {
          success: (res) => {
            if (res.code === 1) {
              this.setData({
                threadStatusList: {
                  ...this.data.threadStatusList,
                  top: state,
                },
              });

              // 父级数据处理
              this.triggerEvent('top', {})

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
    // 加精
    doEssence(state) {
      request.post('/post-essence', {
        essence: state,
        thread_id: this.properties.post.thread_id,
      }, {
          success: (res) => {
            if (res.code === 1) {
              this.setData({
                threadStatusList: {
                  ...this.data.threadStatusList,
                  essence: state,
                },
              });

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
    // 删除
    doDelete() {
      wx.showModal({
        title: '确认删除',
        content: '确认删除该条微帖吗？确认后，数据将无法恢复！',
        cancelText: '取消',
        confirmText: '确认',
        success: (res) => {
          if (res.confirm) {
            request.delete(`/post/${this.properties.post.thread_id}`, {}, {
              success: (res) => {
                if (res.code === 1) {
                  this.setData({
                    isExist: false,
                  });
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
          }
        }
      })
    },
    // playVideo
    playVideo() {
      const _this = this;
      _this.triggerEvent('selectvideo', { value: _this.properties.index});
      _this.setData({
        showVideo: true,
      });
    },
    // 全文
    changeShrink(data) {
      if (!!data.currentTarget.dataset.value) {
        processRichContent(this.data.topicMergeMessage.substr(0, 200) + '...', this);
      } else {
        processRichContent(this.data.topicMergeMessage, this);
      }
      this.setData({
        isShrink: data.currentTarget.dataset.value,
      });
    },
  },
})