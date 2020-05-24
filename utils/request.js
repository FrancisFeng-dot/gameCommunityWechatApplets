import config from '../config';

function request(method, url, data, hander) {
  // token
  const app = getApp();
  const token = (app && app.globalData.token) || wx.getStorageSync('token')

  // 请求
  wx.request({
    url: `${config.host}/${config.forumCode + url}`,
    data: data || {},
    method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: {
      Authorization: token && `Bearer ${token}`,
    },
    success: function(res){
      if (res.statusCode === 200) {
        hander.success(res.data)
      } else if (res.statusCode === 401 || res.statusCode === 400) {
        console.log(url, res);
        wx.clearStorage();
        if (app.globalData.loginView === false) {
          wx.reLaunch({
            url: '/pages/auth/login'
          });
        }
      } else{
        wx.showToast({
          icon: 'none',
          title: '网络错误',
        });
      }
    },
    fail: function() {
      if (!!hander.fail) {
        hander.fail()
      }
    },
    complete: function() {
      if (!!hander.complete) {
        hander.complete()
      }
    }
  })
}

// 七牛token
function uploadToken(hander) {
  // token
  const app = getApp();
  const token = (app && app.globalData.token) || wx.getStorageSync('token')

  // 请求
  wx.request({
    url: `${config.host}/qiniu-token`,
    method: 'GET',
    header: {
      Authorization: token && `Bearer ${token}`,
    },
    success: function(res){
      if (res.statusCode === 200) {
        hander.success(res.data)
      } else if (res.statusCode === 401) {
        wx.clearStorage();
        wx.redirectTo({
          url: '/pages/auth/login'
        });
      }
    },
  })
}

// 上传文件
function uploadFile(url ,file, key, params, hander) {
  // token
  const app = getApp();
  const token = (app && app.globalData.token) || wx.getStorageSync('token')

  wx.uploadFile({
    url,
    filePath: file,
    name: key,
    header: {
      Authorization: token && `Bearer ${token}`,
    },
    formData: params,
    success: function(res){
      console.log(res);
      hander.success(JSON.parse(res.data));
    }
  })
}

// 上传视频
function uploadVideo(filePath, formData, hander) {
  wx.uploadFile({
    url: 'https://up.qiniup.com',
    filePath,
    name: 'file',
    formData,
    success: (res) => {
      hander.success(res);
    },
  });
}

module.exports = {
  get(url, data, hander, header = null) {
    return request('GET', url, data, hander);
  },
  post(url, data, hander, header = null) {
    return request('POST', url, data, hander);
  },
  put(url, data, hander, header = null) {
    return request('PUT', url, data, hander);
  },
  delete(url, data, hander) {
    return request('DELETE', url, data, hander);
  },
  uploadToken(hander) {
    return uploadToken(hander);
  },
  uploadImage(file, hander) {
    const url = `${config.host}/upload-image`;
    return uploadFile(url, file, 'image', {}, hander);
  },
  uploadAudio(file, hander) {
    const url = `${config.host}/upload-audio`;
    return uploadFile(url, file, 'audio', {}, hander);
  },
  uploadVideo(filePath, formData, hander) {
    return uploadVideo(filePath, formData, hander);
  },
}