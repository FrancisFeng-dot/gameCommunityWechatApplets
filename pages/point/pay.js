import request from '../../utils/request';
const app = getApp();

Page({
  data: {
    detail: {},
    forumName: '',
    goodsNum: 1,
    adress: null,
    goodsId: 0,
  },
  onLoad(option) {
    this.getPointInfo(option.id);
  },
  getPointInfo(id) {
    request.get(`/integral-goods/${id}`, {}, {
      success: (res) => {0
        this.setData({
          detail: res.data,
          forumName: app.globalData.initData.forum.name,
          goodsId: id,
        }); 
      }
    });
  },
  changeNum(e) {
    this.setData({ goodsNum: Number(e.detail.value) });
  },
  downNum() {
    let num = this.data.goodsNum - 1;
    this.setData({ goodsNum: num > 1 ? num : 1 });
  },
  upNum() {
    this.setData({ goodsNum: this.data.goodsNum + 1 });
  },
  choseAdress() {
    const self = this;
    wx.chooseAddress({
      success: function (res) {
        console.log(res);
        self.setData({ adress: res });
      }
    })
  },
  goPay() {
    const { goodsId, goodsNum, adress, detail } = this.data;
    if (!adress) {
      wx.showToast({
        icon: 'none',
        title: '请填写收货地址',
      });
      return;
    }
    request.post('/integral-order', {
      goods_id: goodsId,
      exchange_num: goodsNum,
      consignee: adress.userName,
      receiving_address: `${adress.provinceName}${adress.cityName}${adress.countyName}${adress.detailInfo}`,
      receiving_phone: adress.telNumber,
      exchange_integrand: detail.exchange_integral,
    }, {
      success: (res) => {
        if (res.code) {
          wx.showToast({
            icon: 'success',
            title: res.msg,
          });
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/point/point'
            })
          }, 1000);
        } else {
          wx.showToast({
            icon: 'none',
            title: res.msg,
          });
        }
      }
    });
  }
})
