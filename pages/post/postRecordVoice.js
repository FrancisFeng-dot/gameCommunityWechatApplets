import request from '../../utils/request';
import moment from '../../utils/moment.min'

Page({
  data: {
    initData: null,
    time: 0,
    timeShow: null,
    recording: false,
    file: null,
    playing: false,
    interval: null,
    innerAudioContext: null,
  },
  // 录制
  record() {
    if (this.data.recording) {
      // 停止
      this.stop();
    } else {
      wx.getSetting({
        success: (res) => {
          console.log(res);
          if (!res.authSetting['scope.record']) {
            wx.authorize({
              scope: 'scope.record',
              success: (res) => {
                // 开始录音
                this.start();
              },
              fail: () => {
                wx.showToast({
                  title: '录音授权失败',
                  icon: 'none',
                })
              },
            })
          } else {
            // 开始录音
            this.start();
          }
        }
      });
    }
  },
  // 开始录制
  start() {
    const recorderManager = wx.getRecorderManager();
    recorderManager.onStart(() => {
      // 开始
      this.setData({
        recording: true,
        time: 0,
        timeShow: '00:00',
        interval: setInterval(() => {
          const time = this.data.time + 1;
          const timeShow = moment(Number(`${time}000`)).format('mm:ss');

          if (time >= 60) {
            clearInterval(this.data.interval);
            this.stop();
          } else {
            this.setData({
              time,
              timeShow,
            });
          }
        }, 1000)
      });

      console.log('recorder start');
    })
    recorderManager.onStop((res) => {
      clearInterval(this.data.interval);
      const app = getApp();
      this.setData({
        initData: app.globalData.initData,
        recording: false,
        file: res.tempFilePath,
      });
      
      console.log('recorder stop', res)
    })

    recorderManager.start({})
  },
  // 停止录制
  stop() {
    const recorderManager = wx.getRecorderManager();
    recorderManager.stop();
  },
  // 重录
  reset() {
    if (this.data.recording) {
      wx.showToast({
        title: '请先停止正在进行的录音',
        icon: 'none',
      })
    } else {
      this.setData({
        time: 0,
        timeShow: null,
        recording: false,
        file: null,
      });
    }
  },
  // 完成
  complete() {
    if (this.data.file === null) {
      wx.showToast({
        title: '音频未录制完成',
        icon: 'none',
      })
    } else {
      // loading
      wx.showLoading({
        title: '上传语音',
        mask: true
      });

      request.uploadAudio(this.data.file, {
        success: (res) => {
          if (res.code === 1) {
            // 前一页处理数据
            const pages = getCurrentPages();
            const prePage = pages[pages.length - 2];
            if (prePage) {
              prePage.completeAudio({
                filename: res.data,
                time: this.data.time,
                poster: this.data.initData.avatar,
                author: this.data.initData.user.nickname,
              });
            }

            // 界面
            wx.hideLoading();
            wx.navigateBack();
          } else {
            wx.hideLoading();
            wx.showToast({
              title: res.msg,
              icon: 'none',
            });
          }
        }
      });
    }
  },
  // 取消返回
  goBack() {
    const recorderManager = wx.getRecorderManager();
    recorderManager.stop();

    wx.navigateBack();
  },
})
