import request from '../../utils/request';
import config from '../../config';

const app = getApp()
const assetReset = {
  postType: 0,
  imageList: [],
  videoImage: null,
  videoUrl: '',
  audioFilename: null,
  audioFullFilename: null,
  audioTime: 0,
  audioPoster: null,
  audioAuthor: null,
};

Page({
  data: {
    topicList: [],
    isForceTopic: false,
    imageList: [],
    videoImage: null,
    videoUrl: null,
    videoLoading: false,
    audioFilename: null,
    audioFullFilename: null,
    audioTimes: 0,
    audioPoster: null,
    audioAuthor: null,
    postType: 0,
    postData: {
      topic_id: 0,
      message: '',
      post_type: 0,
      file_list: [],
      filename: '',
      times: 0,
      video_url: '',
      is_mini_app: 1,
      form_id: '',
    },
  },
  onLoad() {
    this.setData({
      topicList: app.globalData.initData.topic_list || [],
      isForceTopic: app.globalData.initData.is_force_topic,
    });
  },
  // 上传图片
  chooseImage() {
    wx.chooseImage({
      count: 9 - this.data.imageList.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 选择的图片
        const files = [];
        res.tempFilePaths.forEach((item) => {
          files.push({
            preview: item,
            filename: '',
            loading: false,
          });
        });

        // 准备上传
        this.setData({
          ...assetReset,
          postType: 1,
          imageList: [...this.data.imageList, ...files]
        });

        // 上传到服务器
        this.data.imageList.forEach((item, index) => {
          // 忽略已上传和正在上传的
          if (!item.filename && item.loading === false) {
            // 上传loading效果
            const imageList = this.data.imageList;
            imageList[index] = {
              ...imageList[index],
              loading: true,
            };
            this.setData({
              imageList,
            });

            // 执行上传, 解决卡顿问题，延迟200ms执行
            setTimeout(() => {
              request.uploadImage(item.preview, {
                success: (uploadResponse) => {
                  const imageList = this.data.imageList;
                  imageList[index] = {
                    ...imageList[index],
                    filename: uploadResponse.data.filename,
                    loading: false,
                  };

                  this.setData({
                    imageList,
                  });
                }
              })
            }, 200 * index);
          }
        })
      },
    })
  },
  // 移除图片
  removeImage(e) {
    const imageList = this.data.imageList;

    // 图片上传中不能移除
    if (imageList.some(item => item.loading === true)) {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请等待图片全部上传完成',
      })
    } else {
      // 执行
      imageList.splice(e.currentTarget.dataset.index, 1);
      this.setData({
        imageList,
        postType: imageList.length > 0 ? 1 : 0,
      });
    }
  },
  // 选择视频
  chooseVideo() {
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      compressed: true,
      maxDuration: 60,
      success: (res) => {
        console.log(res);

        // loading
        this.setData({
          ...assetReset,
          videoImage: '/icons/lazy.svg',
          videoLoading: true,
        });

        // 请求 token 
        request.uploadToken({
          success: (responseToken) => {
            console.log('uploadToken', responseToken);

            // 上传
            request.uploadVideo(res.tempFilePath, {
              key: responseToken.data.key,
              token: responseToken.data.token,
              fileName: responseToken.data.upload_name,
            }, {
                success: (res) => {
                  if (res.statusCode === 200) {
                    const resData = JSON.parse(res.data);
                    this.setData({
                      videoLoading: false,
                      videoImage: `${config.asset + resData.key}?vframe/jpg/offset/0/rotate/auto`,
                      videoUrl: resData.key,
                      postType: 7, // 视频
                    });
                  } else {
                    this.setData({
                      ...assetReset,
                      videoLoading: false,
                    });

                    wx.showToast({
                      icon: 'none',
                      title: '视频上传失败',
                    });
                  }
                },
                fail: (e) => {
                  wx.showModal({
                    title: '视频上传失败',
                    content: e,
                  });

                  this.setData({
                    ...assetReset,
                    videoLoading: false,
                  });
                },
              });
          }
        });
      }
    });
  },
  // 移除视频
  removeVideo() {
    this.setData({
      videoImage: '',
      videoUrl: '',
      postType: 0,
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
    console.log(audioData);
    this.setData({
      ...assetReset,
      audioFilename: audioData.filename,
      audioFullFilename: config.asset + audioData.filename,
      audioTime: audioData.time,
      audioPoster: audioData.poster,
      audioAuthor: audioData.author,
      postType: 3, // 语音
    });
  },
  // handle input content
  handleInputContent(e) {
    this.setData({
      postData: { ...this.data.postData, message: e.detail.value }
    });
  },
  // 话题切换
  tapTag(e) {
    this.setData({
      postData: { ...this.data.postData, topic_id: e.currentTarget.dataset.id }
    });
  },
  // 取消返回
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },
  // 发帖
  sendPost(res) {
    request.post('/user-form-id', { form_id: res.detail.formId }, {
      success: () => {
        console.log(res.detail.formId);
      }
    });

    if (this.data.isForceTopic && this.data.postData.topic_id === 0) {
      wx.showToast({
        icon: 'none',
        title: '请选择话题',
      });
    } else {
      // loading
      wx.showLoading({
        title: '发帖中...',
        mask: true
      });

      // 内容
      let defaultMessage = '';
      if (this.data.postType === 1 || this.data.postType === 2) {
        defaultMessage = '分享图片';
      } else if (this.data.postType === 7) {
        defaultMessage = '分享视频';
      } else if (this.data.postType === 3) {
        defaultMessage = '分享语音';
      }
      const message = this.data.postData.message || defaultMessage;

      // 图片数据处理
      const fileList = [];
      this.data.imageList.forEach((item) => {
        fileList.push(item.filename);
      });

      // post数据
      const postData = {
        ...this.data.postData,
        message,
        post_type: this.data.postType,
        file_list: fileList,
        video_url: this.data.videoUrl,
        filename: this.data.audioFilename,
        times: this.data.audioTime,
      };

      // 执行
      request.post('/post', postData, {
        success: (res) => {
          if (res.code === 1) {
            // 给接口一点处理时间
            setTimeout(() => {
              // 前一页处理数据
              const pages = getCurrentPages();
              const prePage = pages[pages.length - 2];
              if (prePage) {
                prePage.handlePost();
              }

              // 界面
              wx.hideLoading();
              wx.navigateBack();
            }, 800);
          } else {
            wx.showToast({
              icon: 'none',
              mask: true,
              title: res.msg,
            });
          }
        }
      });
    }
  },
})
