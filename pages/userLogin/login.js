// pages/userLogin/login.js
const app = getApp()

Page({
  goRegister: function () {
    wx.redirectTo({
      url: '../userRegist/regist',
    })
  },
  onLoad:function(params){
    var me = this;
    console.log(params);
   
    
    var redirectUrl = params.redirectUrl;
    if(redirectUrl != undefined && redirectUrl != '' && redirectUrl != null){
    redirectUrl = redirectUrl.replace(/#/g, "?");
    redirectUrl = redirectUrl.replace(/@/g, "=");
    }
    me.redirectUrl = redirectUrl;

  },
  doLogin:function(e){
    var me = this;
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;
    if (username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名或密码不能为空',
        icon: 'none',
        duration: 3000
      })
    }else{
      var url = app.serverUrl;
      wx.showLoading({
        title: '请等待...',
      });
      console.log(username+" "+password);
      wx.showLoading({
        title: '请等待...',
      });
      wx.request({
        url: url + '/login',
        method: "POST",
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json',
        },
        success: function (res) {
          console.log(res.data);
          wx.hideLoading();
          var status = res.data.status;
          if (status == 200) {
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 3000
            }),
            
          
            app.setGlobalUserInfo(res.data.data);
            var redirectUrl = me.redirectUrl;
            if(redirectUrl != null && redirectUrl != undefined && redirectUrl != ''){
              wx.redirectTo({
                url: redirectUrl,
              })
            }else{
              wx.redirectTo({
                  url: '../mine/mine',
                })
            }
          }
          else if (status == 500) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        }
        
      })
    }

  }
})