const app = getApp()

Component({
  properties: {
    loading: {
      type: Boolean,
      value: false,
    },
    loaded: {
      type: Boolean,
      value: false,
    },
    postList: {
      type: Array,
      value: []
    }
  },
  data: {},
})
