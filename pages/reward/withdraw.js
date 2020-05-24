import request from '../../utils/request'

Page({
  data: {
    account: null,
    money: '',
    haveMoney: '0.00',
  },
  onShow() {
    console.log('w ready');
    this.getWalletAlipayAccount();
    this.getWalletCustomer();
  },
  // 获取支付宝账号
  getWalletAlipayAccount() {
    request.get('/wallet-alipay-account', {}, {
      success: (res) => {
        if (res.code === 1) {
          this.setData({
            account: res.data,
          });
        }
      }
    })
  },
  // 获取余额
  getWalletCustomer() {
    request.get('/wallet-customer', {}, {
      success: (res) => {
        this.setData({
          haveMoney: res.data.balance,
        });
      }
    })
  },
  // 输入金额
  handleChangeMoney(e) {
    this.setData({
      money: e.detail.value,
    });
  },
  // 提现
  withdraw() {
    request.post('/wallet-withdraws', {
      amount: this.data.money,
    }, {
      success: (res) => {
        console.log('提现结果', res);
        if (res.code === 1) {
          wx.showToast({
            title: res.msg,
          });

          this.getWalletCustomer();
          this.setData({
            money: '',
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: res.msg,
          });
        }
      }
    });
  },
});
