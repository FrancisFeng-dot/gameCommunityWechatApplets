import { processDateline } from '../../utils/help'
import request from '../../utils/request';

Component({
  properties: {
    mode: {
      type: String,
    },
    message: {
      type: String,
    },
    post: {
      type: Object,
      value: {},
    }
  },
})