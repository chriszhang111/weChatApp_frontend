//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    totalPage: 1,
    page: 1,
    videoList: [],
    screenWidth: 350,
    serverUrl: "",
    search: ""
  },
  onLoad:function(params){
      var me = this;
      var screenWidth = wx.getSystemInfoSync().screenWidth
      me.setData({
        screenWidth: screenWidth,
      });

      //current page
      var search = params.search;
      var isSaveRecord = params.isSaveRecord;
      if(isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined){
      isSaveRecord = 0;
      }
      me.setData({
        search: search,
      })
      var page = me.data.page;
      me.getAllVideoList(page, isSaveRecord);
  },

  getAllVideoList: function(page, saveRecord){
    var me = this;
    var serverUrl = app.serverUrl;
    var search = me.data.search;
    wx.showLoading({
      title: 'Loading...',
    })
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page+"&isSaveRecord=" + saveRecord,
      method: 'POST',
      data:{
        videoDesc: search,
      },
      success: function (res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        console.log(res.data);
        if (page === 1) {
          me.setData({
            videoList: []
          });
        }
        var videoList = res.data.data.rows;
        var newList = me.data.videoList;
        me.setData({
          videoList: newList.concat(videoList),
          page: page,
          totalPage: res.data.data.totalPage,
          serverUrl: serverUrl
        })
      }
    })
  },
  onReachBottom:function(param){
    console.log("bottom");
    var me = this;
    var currentPage = me.data.page;
    var totalPage = me.data.totalPage;
    if(currentPage === totalPage){
      wx.showToast({
        title: '没有视频了',
        icon:'none'
      })
      return;
    }
    var page = currentPage + 1;
    me.getAllVideoList(page,0);
  },
  onPullDownRefresh:function(){
    wx.showNavigationBarLoading();
     this.getAllVideoList(1,0);
  },
  showVideoInfo:function(res){
    var me = this;
    var url = app.serverUrl;
    var videoList = me.data.videoList; 
    var arrindex = res.target.dataset.arrindex
    var video = JSON.stringify(videoList[arrindex]);
    wx.redirectTo({
      url: '../videoinfo/videoinfo?videoInfo=' + video,
    })

  }
})
