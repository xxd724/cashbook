// miniprogram/pages/detail/detail.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    msgArr:{},//获取到的数据
    isAbled:true, //输入框禁用 启用状态
    edit:"编辑",
    delete:"删除",
    array:["现金","微信钱包","支付宝","储蓄卡","信用卡"],
    iconTitle:true,
    account:true,
    Arr:[],  //类型
    info:{
      money:"",
      iconTitle:"",
      account:"",
      date:"",
      comment:""
    },
    end:new Date()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id:options
    })
    this.obtainMsg();
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
  //获取数据
  obtainMsg(){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.cloud.callFunction({
      name: "obtain_msg_data",
      data:this.data.id,
      success: res=>{
        res.result.data[0].money = Number(res.result.data[0].money).toFixed(2)
        this.setData({
          msgArr:res.result.data[0]
        })
        wx.hideLoading({
          success: (res) => {},
          fail:err=>{}
        })
        this.getType();
      },
      fail:err=>{}
    })
  },
  //获取类型
  getType(){
    var type =this.data.msgArr.costType;
    wx.cloud.callFunction({
      name:"get_type_data",
      data:{
        type
      },
      success:res=>{
        console.log("res",res)
        var data=res.result.data;
        data.forEach(v=>{
          this.data.Arr.push(v.title)
        })
        this.setData({
          Arr:this.data.Arr
        })
      },
      fail:err=>{

      }
    })
  },
  //编辑信息
  modifydetail(){
    if(this.data.edit == "编辑"){
      this.setData({
        isAbled:false,
        edit:"修改",
        delete:"取消"
      })
    }else if(this.data.edit == "修改"){
      this.setData({
        isAbled:true,
        edit:"编辑",
        delete:"删除"
      })
    }
  },
  //删除数据
  deletedetail(e){
    if(this.data.delete == "取消"){
      this.setData({
        isAbled:true,
        edit:"编辑",
        delete:"删除"
      })
      return;
    }
    var id=e.currentTarget.dataset.id;
    console.log(id)
    wx.cloud.callFunction({
      name: "delete_detail_msg_data",
      data:{id},
      success: res=>{
        // console.log("res",res)
        wx.navigateBack({
          delta: 1,
        })
        wx.showToast({
          title: '删除成功',
          icon:"success",
          duration:2000,
          mask:true
        })
      },
      fail:err=>{}
    })
  },
  moneyChange(e){
    this.data({
      money:false
    })
    
  },
  fenleiChange:function(e){
    this.setData({
      select:false,
      index: e.detail.value
    })
    this.data.info.iconTitle=this.data.Arr[this.data.index]
  },
  zhanghuChange:function(e){
    this.setData({
      select:false,
      index: e.detail.value
    })
    this.data.info.account=this.data.Arr[this.data.index]
  },
  dateChange(e){
    var date=e.currentTarget.dataset.date;
    this.data.info['date']=date;
    this.setData({
      info:this.data.info
    })
  }



})