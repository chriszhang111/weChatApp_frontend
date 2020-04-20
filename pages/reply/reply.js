// pages/reply/reply.js
var app = getApp();
Page({
  data:{
    main:null,
    serverUrl: app.serverUrl,
    childrenList:[],
    replyFatherCommentId:null,
    replyToUserId:null,
    placeholder: "留言",
    contentValue:"",
      },
  onLoad: function (options) {
    var me = this;
    var comment = JSON.parse(options.comment);
    console.log(comment);
    me.setData({
      main:comment,
      replyFatherCommentId:comment.id
    });

    wx.request({
      url: app.serverUrl +'/video/getVideoByFather?fatherId='+comment.id,
      method:'POST',
      success:function(res){
        var list = me.data.childrenList;
        me.setData({
          childrenList: list.concat(res.data.data)
        })
      }
    })

  },
  replyFocus: function (e) {
    var me = this;
    console.log(e);
    var nickname = e.currentTarget.dataset.tonickname;
    var fatherId = e.currentTarget.dataset.fathercommentid;
    var touserid = e.currentTarget.dataset.touserid;

    this.setData({
      placeholder: "回复 " + nickname,
      replyToUserId: touserid
    });
  },
  saveComment:function(res){
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?=redirectUrl=' + realUrl,
      })
    }

    var me = this;
    var content = res.detail.value;
    var replyfatherid = me.data.replyFatherCommentId;
    var replytouserid = res.currentTarget.dataset.replytouserid;
    wx.request({
      url: app.serverUrl + '/video/saveComment',
      method: "POST",
      header: {
        'content-type': 'application/json',
        'headeruserId': user.id,
        'headeruserToken': user.userToken
      },
      data: {
        toUserId: replytouserid,
        videoId: me.data.main.id,
        fromUserId: user.id,
        comment: content,
        fatherCommentId: replyfatherid,
      },
      success: function (res) {
        console.log(res);
        me.setData({
          contentValue: "",
          childrenList: []
        });
        wx.request({
          url: app.serverUrl + '/video/getVideoByFather?fatherId=' + me.data.main.id,
          method: 'POST',
          success: function (res) {
            var list = me.data.childrenList;
            me.setData({
              childrenList: list.concat(res.data.data)
            })
          }
        })
        
      }
    })
  }
})