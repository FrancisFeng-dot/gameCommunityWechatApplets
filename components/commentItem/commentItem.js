import { processDateline, processHtmlTag } from '../../utils/help'

const app = getApp();

Component({
  properties: {
    comment: {
      type: Object,
      value: {},
    },
    post: {
      type: Object,
      value: {},
    },
    isOpenPost: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    dateline: null,
    commentSon: [],
    content: '',
  },
  attached() {
    this.processData();
  },
  methods: {
    processData() {
      // 时间格式化
      const dateline = processDateline(this.properties.comment.created_at);

      // 评论内容处理
      const content = processHtmlTag(this.properties.comment.content);

      // 子评论数据处理
      const commentSon = [];
      if (this.properties.comment.son) {
        this.properties.comment.son.forEach((item) => {
          commentSon.push({
            ...item,
            created_at: processDateline(item.created_at),
            content: processHtmlTag(item.content),
          }); 
        })
      }

      // 数据
      this.setData({
        dateline,
        commentSon,
        content,
      });
    },
    // 预览图片
    previewImage(e) {
      console.log(e);

      wx.previewImage({
        urls: [e.target.dataset.url], // 需要预览的图片http链接列表
      })
    },
    // 评论
  goCommentView(e) {
    if (this.properties.isOpenPost) {
      // 父级id
      const parentId = e.currentTarget.dataset.parentid;

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
        url: `/pages/post/postComment?post_id=${post.thread_id}&parent_id=${parentId}&index=0`,
      });
    }
  },
  },
})