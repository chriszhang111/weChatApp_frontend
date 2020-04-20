// pages/report/report.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reasonType: "请选择原因",
    reportReasonArray: app.reportReasonArray,
    publishUserId: "",
    videoId: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var me = this;
      me.setData({
        publishUserId: options.publishUserId,
        videoId: options.videoId
      });
  },

  changeMe:function(res){
    var me = this;
    var index = res.detail.value;
    var content = app.reportReasonArray[index];
    me.setData({
      reasonType: content
    })
  },

  submitReport:function(res){
    var user = app.getGlobalUserInfo();
    var me = this;
    var index = res.detail.value.reasonIndex;
    var content = res.detail.value.reasonContent;
    if(index == null || index == '' || index == undefined){
      wx.showToast({
        title: '请选择理由',
        icon:'none'
      });
      return;
    }else{
      var url = app.serverUrl;
      wx.request({
        url: url + '/user/reportUser',
        method:'POST',
        header: {
          'content-type': 'application/json',
          'headeruserId': user.id,
          'headeruserToken': user.userToken
        },
        data:{
          dealUserId:me.data.publishUserId,
          dealVideoId:me.data.videoId,
          userid:user.id,
          title:me.data.reportReasonArray[index],
          content:content
        },
        success:function(e){
          console.log(e);
          wx.showToast({
            title: e.data.data,
            duration:10000,
            icon:'none',
            success:function(){
              wx.navigateBack({});
            }
          });
          
        }
      })
    }
  }
})