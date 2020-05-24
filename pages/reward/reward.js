import request from '../../utils/request'
import config from '../../config';
import base64 from '../../utils/base64.min';

const base64Encode = base64.Base64.encode;
const app = getApp();

Page({
    data: {
        user: app.globalData.initData.user,
        shareRedWords: app.globalData.initData.version_info,
        isOpened: false,
        redEnvelope: null,
        shareList:  [],
        received: {},
        animationData: null,
        animationArray: ['fadeInRight', 'fadeInRight2'],
        qrcode: null,
        end: false,
    },
    onLoad(options) {
        this.receive(options.share_user_id || 0);
        this.getQrcode();
    },
    // 分享
    onShareAppMessage() {
        return {
            title: !!this.data.shareRedWords ? this.data.shareRedWords.share_red_words : '恭喜发财，大吉大利',
            path: `/pages/reward/reward?share_user_id=${this.data.user.user_id}`,
            imageUrl: 'https://cdn.iquliao.cn/images/201804/XdBEPUrx.png',
            success: function(res) {
                wx.showToast({
                    title: '分享成功',
                    icon: 'success',
                    duration: 2000
                });
            }
        }
    },
    // 领取红包
    receive(shareUserId) {
        request.post('/red-packet', { receive_id: shareUserId }, {
            success: (res) => {
            console.log('领取红包结果', res);
        if (res.code === 1) {
            const isOpened = wx.getStorageSync('is_opened_' + res.data.red_id) || false;
            this.setData({
                    redEnvelope: { ...res.data, share_list: null },
                shareList: res.data.share_list,
                isOpened,
        });

            if (res.data.share_list.length > 3) {
                setInterval(() => {
                    const copy = this.data.shareList;
                copy.push(copy.shift());
                this.setData({
                    shareList: copy,
                });

                this.renderReceived(copy.slice(0, 3), false);
            }, 2000);
            }

            this.renderReceived(res.data.share_list.slice(0, 3), true);
        } else {
            this.setData({
                end: true,
            });
        }
    },
    });
    },
    // 获取关注二维码
    getQrcode() {
        request.get('/red-withdraw', {}, {
            success: (res) => {
            if (res.code === 1) {
            const water =  base64Encode(config.asset + res.data.public_qrcode + '?imageView2/1/w/400/h/400', true);
            const image = 'https://ocrjl5j3c.qnssl.com/wETvYv0UjdT1524105668.jpg';
            const qrcode = `${image}?watermark/1/image/${water}/dx/175/dy/250`

            this.setData({
                qrcode,
            });
        }
    },
    });
    },
    // 展示二维码
    showQrcode() {
        wx.previewImage({
            current: '', // 当前显示图片的http链接
            urls: [this.data.qrcode] // 需要预览的图片http链接列表
        })
    },
    // 开红包动画
    setAnimation() {
        wx.setStorage({
            key: 'is_opened_' + this.data.redEnvelope.red_id,
            data: true
        });
        const animation = wx.createAnimation({
            duration:1000,
            timingFunction: 'ease',
        })
        this.animation = animation;
        animation.rotate3d(0,1,0,180).step();
        animation.rotate3d(0,1,0,-180).step();

        this.setData({
            animationData:animation.export()
        })

        setTimeout(() => {
            this.setData({
            isOpened: true
        });
    }, 2000)
    },
    // 领取人
    renderReceived(arr, a) {
        const data = [];
        arr.forEach((item, key) => {
            data.push({
            content: `${item.receive_name}领取了你的红包：${item.red_receive_multiple_fee}元`,
            animation: (a || key === 2) ? `animated ${this.data.animationArray[0]}` : '',
        });
    });

        const copy = this.data.animationArray;
        copy.push(copy.shift());

        this.setData({
            received: data,
            animationArray: copy
        });
    },
});
