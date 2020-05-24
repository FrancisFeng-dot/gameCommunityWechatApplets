import request from '../../utils/request';
import config from '../../config';
const app = getApp();

Page({
  data: {
    info: null, 
    image: null,
    audio: null,
    index: 0,
    filename: '',
    time: 0,
    content: '',
    type: 0,
    post_id: 0,
    parent_id: 0,
    is_mini_app: 1,
  },
  // onload
  onLoad(options) {
    console.log(options);

    let content = app.globalData.operateInfo.content;
    if (content.length > 30) {
      content = content.substr(0, 30) + '...';
    }

    this.setData({
      info: { 
        ...app.globalData.operateInfo,
        content,
      },
      post_id: options.post_id || 0,
      parent_id: options.parent_id || 0,
      index: options.index || 0,
    });
  },
  // 选择图片
  chooseImage() {
    const _this = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        const imagePreview = res.tempFilePaths[0];
        _this.setData({
          audio: null,
          image: {
            preview: imagePreview,
            filename: '',
            loading: true,
          }
        });

        // 上传图片到服务器
        request.uploadImage(imagePreview, {
          success: (res) => {
            if (res.code === 1) {
              _this.setData({
                type: 1,
                image: {
                  preview: imagePreview,
                  filename: res.data.filename,
                  loading: false,
                }
              });
            } else {
              // 上传失败
              _this.setData({
                image: null
              });

              wx.showToast({
                icon: 'none',
                title: res.msg
              });
            }
          }
        })
      },
    })
  },
  // 删除图片
  removeClose() {
    this.setData({
      type: 0,
      image: null,
    });
  },
  // 录制语音
  chooseAudio() {
    wx.navigateTo({
      url: '/pages/post/postRecordVoice'
    });
  },
  // 完成录制
  completeAudio(audioData) {
    this.setData({
      type: 2,
      image: null,
      audio: {
        filename: audioData.filename,
        fullFilename: config.asset + audioData.filename,
        time: audioData.time,
        poster: audioData.poster,
        author: audioData.author,
      },
    });
  },
  // handle input content
  handleInputContent(e) {
    this.setData({
      content: e.detail.value
    });
  },
  // 发送
  sendComment(res) {
    // loading
    wx.showLoading({
      title: '评论中...',
      mask: true
    });

    let defaultContent = '';
    let filename = '';
    let time = 0;
    switch(this.data.type) {
      case 1:
        defaultContent = '分享图片';
        filename = this.data.image.filename;
        break;
      case 2:
        defaultContent = '分享语音';
        filename = this.data.audio.filename;
        time = this.data.audio.time;
        break;
      default:
        break;
    }

    request.post('/user-form-id', { form_id: res.detail.formId }, {
      success: () => {
        console.log(res.detail.formId);
      }
    });
    
    request.post('/post-comment', {
      thread_id: this.data.post_id,
      parent_id: this.data.parent_id,
      comment_id: this.data.parent_id,
      type: this.data.type,
      content: this.data.content || defaultContent,
      filename: filename,
      time: time,
    }, {
      success: (res) => {
        if (res.code === 1) {
          setTimeout(() => {
            // 前一页处理数据
            const pages = getCurrentPages();
            const prePage = pages[pages.length - 2];
            if (prePage) {
              setTimeout(() => {
                prePage.handleComment();
              }, 800);
            }

            wx.navigateBack();
          }, 800);
        } else {
          wx.showToast({
            icon: 'none',
            title: res.msg
          });
        }
      },
      complete: () => {
        setTimeout(() => {
          wx.hideLoading();
        }, 800);
      }
    })
  },
  // 取消返回
  goBack() {
    wx.navigateBack();
  },
})
