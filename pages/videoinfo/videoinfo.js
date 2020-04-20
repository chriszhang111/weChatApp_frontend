// pages/videoinfo/videoinfo.js
var videoUtil = require('../../utils/videoUtil.js');
const app = getApp()

Page({
  data: {
    cover:"cover",
    videoId:"",
    src:"",
    videoInfo:{},
    userLikeVideo:false,
    publisher:null,
    serverUrl:app.serverUrl,
    placeholder:'说点什么',
    commentsPage: 1,
    commentsTotalPage: 1,
    commentsList: [],
    replyFatherCommentId:null,
    replyToUserId:null

  },
  videoCtx:{},
  onLoad:function(params){
    var me = this;
    var user = app.getGlobalUserInfo();
    me.videoCtx = wx.createVideoContext("myVideo", me);
    var videoInfo = JSON.parse(params.videoInfo);
    var height = videoInfo.videoHeight
    var width = videoInfo.videoWidth;
    var cover = "cover"
    if(width >= height){
      cover = "";
    }
    me.setData({
      videoId: videoInfo.id,
      src:app.serverUrl+videoInfo.videoPath,
      videoInfo: videoInfo,
      cover: cover,
    });

    var userid = "";
    if(user != null && user != undefined && user != ''){
      userid = user.id;
    }
    wx.request({
      url: app.serverUrl + '/user/querypublisher?loginuserId=' + userid + '&videoId=' + videoInfo.id +'&publisherId='+videoInfo.userId,
      method:'POST',
      success:function(res){
        me.setData({
          publisher: res.data.data.publisher,
          userLikeVideo:res.data.data.userLikeVideo
        })
      }
    })
    me.getCommentsList(1);

  },
  onShow(){
    var me = this;
    me.videoCtx.play();
  },
  onHide(){
    var me = this;
    me.videoCtx.pause();
  },
  showSearch:function(){
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },
  upload: function(){
    var userInfo = app.getGlobalUserInfo();
    var me = this;
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;
    if (userInfo === undefined || userInfo == null || userInfo == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl='+realUrl,
      })
    }else{
    videoUtil.uploadVideo();
    }
  },

  showIndex:function(){
    wx.redirectTo({
      url: '../index/index',
    })
  },
  showMine:function(){
    var userInfo = app.getGlobalUserInfo();
    console.log(userInfo);
    if(userInfo === undefined || userInfo == null || userInfo == ''){
      wx.navigateTo({
        url: '../userLogin/login',
      })
    }
    wx.navigateTo({
      url: '../mine/mine',
    })
  },
  likeVideoOrNot:function(e){
    var me = this;
    var userInfo = app.getGlobalUserInfo();
    if (userInfo === undefined || userInfo == null || userInfo == '') {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    }
    else{
      var userLikeVideo = me.data.userLikeVideo;
      var videoInfo = me.data.videoInfo;
      var url = '/video/userlike?userId=' + userInfo.id + '&videoId=' + videoInfo.id +'&videoCreatorId='+videoInfo.userId;
      if(userLikeVideo){
        url = '/video/userunlike?userId=' + userInfo.id + '&videoId=' + videoInfo.id + '&videoCreatorId=' + videoInfo.userId
      }
      wx.showLoading({
        title: 'Waiting',
      })
      wx.request({
        url: app.serverUrl+url,
        method:"POST",
        header:{
          'content-type': 'application/json',
          'headeruserId': userInfo.id,
          'headeruserToken': userInfo.userToken
        },
        success:function(res){
            wx.hideLoading();
            me.setData({
              userLikeVideo: !userLikeVideo
            })
        }
      })
    }

  },
  showPublisher:function(){
    var userInfo = app.getGlobalUserInfo();
    var me = this;
    var videoInfo = me.data.videoInfo;
    var realUrl = '../mine/mine#publisherId@' + videoInfo.userId;
    if (userInfo === undefined || userInfo == null || userInfo == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId='+videoInfo.userId,
      })
    }
  },
  shareMe:function(e){
    var me = this;
    wx.showActionSheet({
      itemList: ['下载', '举报视频', '分享到朋友圈'],
      success:function(res){
        var index = res.tapIndex;
        var user = app.getGlobalUserInfo();
        if(index == 0){
          wx.showLoading({
            title: '下载中',
          })
          wx.downloadFile({
            url:app.serverUrl+me.data.videoInfo.videoPath,
            success:function(res){
              if(res.statusCode == 200){
                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success:function(res){
                    wx.hideLoading();
                    console.log(res.errMsg);
                  }
                })
              }
            }
          })

        }else if(index == 1){
            var videoInfo = JSON.stringify(me.data.videoInfo);
            var realUrl = '../videoinfo/videoinfo#videoInfo@'+videoInfo;
            if(user == null || user == undefined || user == ''){
              wx.navigateTo({
                url: '../userLogin/login?=redirectUrl='+realUrl,
              })
            }
            else{
              var publishUserId = me.data.videoInfo.userId;
              var videoId = me.data.videoInfo.id;
              var currentUserId = user.id;
              wx.navigateTo({
                url: '../report/report?videoId='+videoId + '&publishUserId='+publishUserId,
              })
            }
        }
        else{
          wx.showToast({
            title: '官方暂未开放',
          })
        }
      }
    })
  },
  onShareAppMessage:function(res){
    var me = this;
    return {
      'title': '短视频分享',
      'path': 'pages/videoinfo/videoinfo?videoInfo='+JSON.stringify(me.data.videoInfo)
    }
  },
  leaveComment:function(res){
    this.setData({
      commentFocus: true
    })
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
    var replyfatherid = res.currentTarget.dataset.replyfathercommentid;
    var replytouserid = res.currentTarget.dataset.replytouserid;
    wx.request({
      url: app.serverUrl+'/video/saveComment',
      method: "POST",
      header: {
        'content-type': 'application/json',
        'headeruserId': user.id,
        'headeruserToken': user.userToken
      },
      data:{
        toUserId: replytouserid,
        videoId: me.data.videoInfo.id,
        fromUserId:user.id,
        comment:content,
        fatherCommentId: replyfatherid,
      },
      success:function(res){
          console.log(res);
          me.setData({
            contentValue:"",
            commentsList:[]
          })
          me.getCommentsList(1);
      }
    })
  },
  
  getCommentsList: function(page){
      var me = this;
      var videoId = me.data.videoInfo.id;
      wx.request({
        url: app.serverUrl +'/video/getVideoComments?videoId='+videoId+'&page='+page+'&pagesize=5',
        method:'POST',
        success:function(res){
          console.log(res);
          var newList = me.data.commentsList;
          me.setData({
            commentsList:newList.concat(res.data.data.rows),
            commentsPage: page,
            commentsTotalPage: res.data.data.total
          })
        }
      })
  },
  onReachBottom:function(){
    var me = this;
    var page = me.data.commentsPage;
    var totalPage = me.data.commentsTotalPage;
    if(page == totalPage){
      return;
    }
    else{
      this.getCommentsList(page+1);
    }
  },
  showReply:function(e){
    console.log(e.currentTarget.dataset);
    var me = this;
    var index = e.currentTarget.dataset.index;
    var commentInfo = me.data.commentsList[index];
    console.log(commentInfo);
    console.log("into reply");
    wx.navigateTo({
      url: '../reply/reply?comment='+JSON.stringify(commentInfo),
    })
  },
  replyFocus:function(e){
    var me = this;
    console.log(e);
    var nickname = e.currentTarget.dataset.tonickname;
    var fatherId = e.currentTarget.dataset.fathercommentid;
    var touserid = e.currentTarget.dataset.touserid;

    this.setData({
      placeholder:"回复 " + nickname,
      replyFatherCommentId:fatherId,
      replyToUserId:touserid,
      commentFocus:true 
    });
  }

})