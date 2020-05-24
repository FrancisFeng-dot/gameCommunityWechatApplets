import moment from './moment.min';
import WxParse from './wxParse/wxParse';

module.exports = {
  processDateline: (dateline) => {
    return moment(Number(`${dateline}000`)).format('MM/DD HH:mm');
  },
  processHtmlTag: (content) => {
    return content.replace(/<[^>]+>/g, '');
  },
  processNumber: (number) => {
    const n = Number(number);
    if (n <= 10000) {
      return n;
    }

    return (n / 10000).toFixed(1) + '万';
  },
  processRichContent: (content, page) => {
    return WxParse.wxParse('richContent', 'html', content, page);
  },
  processBehavior: (status, behaviors) => {
    let txt = '';
    behaviors.forEach(item => {
      if (item.key === status) {
        txt = item.behavior;
      }
    });
    return txt;
  },
}
