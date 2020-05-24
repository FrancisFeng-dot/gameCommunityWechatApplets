import { processRichContent } from '../../utils/help';

Component({
  properties: {
    detail: {
      type: Object,
      value: {}
    },
    isLike: {
      type: Boolean,
      value: false
    }
  },
  data: {
    richContent: null
  },
  methods: {
    goDetail() {
      wx.navigateTo({
        url: `/pages/post/post?id=${this.properties.detail.thread_info.thread_id}`
      })
    }
  }
})