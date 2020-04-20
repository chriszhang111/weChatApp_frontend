const app = getApp()

Page({
  data: {
    danmuList: [
      {
        text: '第 1s 出现的弹幕',
        color: '#ff0000',
        time: 1
      },
      {
        text: '第 3s 出现的弹幕',
        color: '#ff00ff',
        time: 3
      }]

  },

  onReady: function(res){
    this.videocontext = wx.createVideoContext('video');
  },
  bindplay: function () {
    console.log("播放");
  },
  bindpause: function () {
    console.log("暂停");
  },
  submitDesc:function(params){
    var me = this;
    console.log(params);
  },

  bindpause:function(e){
    var me = this;
  }

})