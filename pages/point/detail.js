import request from '../../utils/request';
import { processRichContent } from '../../utils/help';

Page({
  data: {
    detail: {}
  },
  onLoad(option) {
    this.getPointInfo(option.id);
  },
  getPointInfo(id) {
    request.get(`/integral-goods/${id}`, {}, {
      success: (res) => {
        processRichContent(res.data.goods_details, this);
        this.setData({
          detail: res.data
        }); 
      }
    });
  },
})
