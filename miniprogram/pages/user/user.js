// miniprogram/pages/user/user.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{}, //存放用户信息
    isAuth:false  //判断用户是否授权成功
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取用户授权状态
    wx.getSetting({
      success:res =>{
        if(res.authSetting["scope.userInfo"]){
          //获取用户信息
          wx.getUserInfo({
            success:e =>{
              this.setData({
                userInfo:e.userInfo,
                isAuth:true
              })
            }
          })
        }
      },
      fail:err=>{

      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  //获取授权，用户信息
  getUserInfo(e){
    //授权成功，获取用户信息
    if(e.detail.userInfo){
      this.setData({
        userInfo:e.detail.userInfo,
        isAuth:true
      })
    }
  }
})