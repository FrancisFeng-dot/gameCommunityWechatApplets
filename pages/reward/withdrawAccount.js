import request from '../../utils/request'

Page({
  data: {
    account: null,
    form: {
      account: '',
      real_name: '',
    },
  },
  onLoad() {
    console.log('w ready');
    this.getWalletAlipayAccount();
  },
  // 获取支付宝账号
  getWalletAlipayAccount() {
    request.get('/wallet-alipay-account', {}, {
      success: (res) => {
        if (res.code === 1) {
          this.setData({
            account: res.data,
            form: {
              account: res.data.account_info.logonid,
              real_name: res.data.account_info.real_name,
            },
          });
        }
      }
    })
  },
  // bind
  bindWalletAlipayAccount() {
    if (this.data.account) {
      request.put(`/wallet-alipay-account/${this.data.account.account_id}`, this.data.form, {
        success: (res) => {
          if (res.code === 1) {
            wx.navigateBack();
          } else {
            wx.showToast({
              icon: 'none',
              title: res.msg,
            });
          }
        }
      })
    } else {
      request.post('/wallet-alipay-account', this.data.form, {
        success: (res) => {
          if (res.code === 1) {
            wx.navigateBack();
          } else {
            wx.showToast({
              icon: 'none',
              title: res.msg,
            });
          }
        }
      })
    }
  },
  // 修改账号
  changeInput(e) {
    console.log(e);
    const form = this.data.form;
    form[e.target.dataset.label] = e.detail.value;
    this.setData({
      form,
    });
  }
});
