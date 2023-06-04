// miniprogram/pages/record/record.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 消费类型的标题数据
    typeData:[
      {
        title:"支出",
        type:"zhichu",
        isAct:true
      },
      {
        title:"收入",
        type:"shouru",
        isAct:false
      }
    ],
    // 账户选择数据
    accountData:[
      {
        title:"现金",
        type:"xianjin",
        isAct:true
      },
      {
        title:"微信钱包",
        type:"weixinqianbao",
        isAct:false
      },
      {
        title:"支付宝",
        type:"zhifubao",
        isAct:false
      },
      {
        title:"储蓄卡",
        type:"chuxuka",
        isAct:false
      },
      {
        title:"信用卡",
        type:"xinyingka",
        isAct:false
      }
    ],
    //轮播图标分类数据
    // bannerData:{
    //   zhichu:[],
    //   shouru:[]
    // },
    //轮播渲染数据
    bannerTypeData:[],
    //结束时间，当天日期
    end:"",
    //用户填写的数据
    info:{
      date:"", //时间
      money:"", //金额
      comment:"" //备注
    },
    // 当前选中的时间
    currentDate:'',
    // date:'2020-10-15'
    isAuth:false //判断用户是否授权
  },
    /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取当天日期
    this.getToday();
    //获取轮播图片数据
    this.getTypeData("zhichu");
    //获取用户授权状态，授权成功，获取数据
    wx.getSetting({
      success:res =>{
        //授权成功
        if(res.authSetting["scope.userInfo"]){
          this.setData({
            isAuth:true
          })
        }
      }
    })
  },
  onShow:function(){
    //获取用户授权状态，授权成功，获取数据
    wx.getSetting({
      success:res =>{
        //授权成功
        if(res.authSetting["scope.userInfo"]){
          this.setData({
            isAuth:true
          })
        }
      }
    })
  },
  //消费类型点击事件
  tapChange(e){
    //获取当前点击得下标
    var index=e.currentTarget.dataset.index;
    //获取当前修改的数据名称
    var name=e.currentTarget.dataset.name;
    //判断当前数据是否是高亮状态，如果是则不做任何处理
    if(this.data[name][index].isAct){
      return;//终止代码
    }
    //设置之前，先清除上一个高亮数据的状态
    for(var i = 0 ;i < this.data[name].length;i++){
      if(this.data[name][i].isAct){
        this.data[name][i].isAct=false;
        break;//找到上一个高亮就可以停止循环查找
      }
    }
    //设置当前点击的数据为高亮状态
    this.data[name][index].isAct=true;
    //切换轮播图标数据
    if(name == 'typeData'){
      //获取当前点击的消费类型是收入还是支出
      var type=this.data[name][index].type;
      // this.setBanner(this.data.bannerData[type]);  
      this.getTypeData(type);
    }
    //如果需要页面上的数据进行更新，则需要再次用setData
    this.setData({
      [name]:this.data[name]
    })
  
  },
  //获取当天日期
  getToday(){
    //实例化时间
    var time =new Date();
    //获取年份
    var years=time.getFullYear();
    //获取月份
    var months=time.getMonth() + 1;  //getMonth()从零开始所以需要加1
    //获取日
    var day=time.getDate();

    this.setData({
      end:years + '-' + this.addZero(months) + "-" + this.addZero(day),
      // currentDate:years + '-' + this.addZero(months) + "-" + this.addZero(day)
      "info.date":years + '-' + this.addZero(months) + "-" + this.addZero(day)
    })
  },
  //补零函数
  addZero(num){
    return num < 10 ? "0"+num : num;
  },
  //获取轮播图图标数据
  getTypeData(type){
    //type当前获取的数据类型
    //显示加载框
    wx.showLoading({
      title:'加载中',
      duration:2000,
      mask:true
    })
    //调用云函数get_type_data
    wx.cloud.callFunction({
      name:"get_type_data",
      data:{
        type
      },
      success:(res)=>{
        // console.log(res)
        //获取所有数据
        var data=res.result.data;
        //根据收入支出将图标进行分类
        // data.forEach(v=>{
        //   if(v.sort == 'zhichu'){
        //     this.data.bannerData.zhichu.push(v)
        //   }else{
        //     this.data.bannerData.shouru.push(v)
        //   }
        // })
        // console.log(this.data.bannerData)
        //默认处理支出数据，转化为二维数组，渲染页面
        // this.setBanner(this.data.bannerData.zhichu);

        //处理数据之前，先添加一个激活字段给数据
        data.forEach(v=>{
          v.isAct=false;
        })
        wx.hideLoading({
          success: (res) => {},
          fail:err=>{}
        })
        //默认处理支出数据，转化为二维数组，渲染页面
        this.setBanner(data);
      },
      fail:(err)=>{
        console.log(err)
      }
    })
  },
  setBanner(data){
    //清除数据
    this.data.bannerTypeData=[];
    //开始截取下标
    var beginIndex=0;
    //while 条件循环语句，先判断条件是否成立，如果成立则再次执行代码，不成立则不执行
    while(beginIndex < data.length){
      //slice(开始截取下标，结束截取下标) ，返回一个新数组，不改变原数组数据
      var tmp=data.slice(beginIndex,beginIndex+8);
      this.data.bannerTypeData.push(tmp);
      //重新定义开始截取的位置
      beginIndex += 8;
      //响应数据
      this.setData({
        bannerTypeData:this.data.bannerTypeData
      })
    }
  },
  imgLoad(e){
    //图片加载完成，关闭加载框
    // wx.hideLoading();
    setTimeout(()=>{
      wx.hideLoading();
    },500)
  },
  bannerTap(e){
    //获取第一层数组数据下标
    var index = e.currentTarget.dataset.index;
    //获取第二层的数组数据下标
    var id = e.currentTarget.dataset.id;
    //判断当前点击的数据是否是激活状态，如果是则取消激活，不是则激活数据
    if(this.data.bannerTypeData[index][id].isAct){
      this.data.bannerTypeData[index][id].isAct=false;
    }else{
      //取消上一个激活状态的数据
      for(var i = 0; i < this.data.bannerTypeData.length; i++){
        for(var j =0;j<this.data.bannerTypeData[i].length;j++){
          if(this.data.bannerTypeData[i][j].isAct){
            this.data.bannerTypeData[i][j].isAct=false;//取消激活
            break;//找到激活数据则终止循环，不再查找
          }
        }
      }
      //激活当前点击的数据
      this.data.bannerTypeData[index][id].isAct=true;
    }
    //数据响应
    this.setData({
      bannerTypeData:this.data.bannerTypeData
    })
  },
  //获取用户填写的数据
  getInfo(e){
    //获取要修改的数据名称
    var type = e.currentTarget.dataset.type;
    //设置值
    this.data.info[type]= e.detail.value;
    //响应数据
    this.setData({
      info:this.data.info
    })
  },
  //添加一条记账信息到数据库上
  addMsgData(){
    //判断用户是否授权成功，如果没有授权则不提交数据
    if(!this.data.isAuth){
      wx.showToast({
        title: '请先登录',
        icon:"none",
        duration:2000,
        mask:true
      })
      this.resetPage(); 
      return;
    }
    //存放用户选择的数据对象
    var msgData={};
    //获取用户数据选择的消费类型是收入还是支出
    for(var i=0;i<this.data.typeData.length;i++){
      if(this.data.typeData[i].isAct){
        msgData.cost=this.data.typeData[i].title;
        msgData.costType=this.data.typeData[i].type;
        break;
      }
    }
    //判断轮播图标是否有选择，如果没有则不能添加数据
    var isBanner=false; //默认轮播图标没有激活

    //获取轮播激活的图标类型
    for(var i = 0; i < this.data.bannerTypeData.length; i++){
      for(var j =0;j<this.data.bannerTypeData[i].length;j++){
        if(this.data.bannerTypeData[i][j].isAct){
         msgData.iconUrl=this.data.bannerTypeData[i][j].icon_url;
         msgData.iconTitle=this.data.bannerTypeData[i][j].title;
         msgData.iconType=this.data.bannerTypeData[i][j].type;
         msgData.iconSort=this.data.bannerTypeData[i][j].sort;
         isBanner=true; //条件成立，则有激活的轮播图标
          break;//找到激活数据则终止循环，不再查找
        }
      }
    }
    //如果没有激活的轮播图标则提醒用户选择
    if(!isBanner){
      wx.showToast({
        title: '请选择记账类型',
        icon:"success",
        duration:2000,
        mask:true
      })
      return;
    }
    //获取账户选择数据
    for(var i = 0; i< this.data.accountData.length;i++){
      if(this.data.accountData[i].isAct){
        msgData.account=this.data.accountData[i].title;
        msgData.accountType=this.data.accountData[i].type;
        break;
      }
    }
    //判断用户是否有填写金额，如果没有则不提交数据，且提醒用户
    if(this.data.info.money ==""){
      wx.showToast({
        title: '请输入记账金额',
        icon:"success",
        duration:2000,
        mask:true
      })
    }

    //获取用户输入的信息
    for(var key in this.data.info){
      msgData[key]=this.data.info[key]
    }
    wx.showLoading({
      title:"正在保存",
      duration:2000,
      mask:true
    })
    //调用云函数 add_msg_data
    wx.cloud.callFunction({
      name:"add_msg_data",
      data:msgData,
      success:(res)=>{
        //重置页面
        this.resetPage();
        //关闭加载框
        wx.hideLoading();
        wx.showToast({
          title: '保存成功',
          icon:"success",
          duration:2000,
          mask:true
        })
      },
      fail:(err)=>{

      }
    })
  },
  //重置页面，回复数据
  resetPage(){
    //重置支出收入区域
    this.data.typeData[0].isAct=true;
    this.data.typeData[1].isAct=false;
    //重新获取支出图标数据
    this.getTypeData("zhichu");
    //重置账户选择
    this.data.accountData[0].isAct=true;
    for(var i =1 ;i<this.data.accountData.length;i++){
      this.data.accountData[i].isAct=false;
    }
    //数据响应
    this.setData({
      typeData:this.data.typeData,
      accountData:this.data.accountData,
      info:{
        date:this.data.end,
        money:'',
        comment:''
      }
    })
  }
  



  // /**
  //  * 生命周期函数--监听页面初次渲染完成
  //  */
  // onReady: function () {

  // },

  // /**
  //  * 生命周期函数--监听页面显示
  //  */
  // onShow: function () {

  // },

  // /**
  //  * 生命周期函数--监听页面隐藏
  //  */
  // onHide: function () {

  // },

  // /**
  //  * 生命周期函数--监听页面卸载
  //  */
  // onUnload: function () {

  // },

  // /**
  //  * 页面相关事件处理函数--监听用户下拉动作
  //  */
  // onPullDownRefresh: function () {

  // },

  // /**
  //  * 页面上拉触底事件的处理函数
  //  */
  // onReachBottom: function () {

  // },

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function () {

  // }
})