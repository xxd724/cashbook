// miniprogram/pages/chart/chart.js
var wxCharts = require('../../js/wxcharts.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    yearList:[], //年列表
    isYear:false, //是否显示年列表
    monthList:[
      {
        month:1,
        isAct:false
      },
      {
        month:2,
        isAct:false
      },
      {
        month:3,
        isAct:false
      },
      {
        month:4,
        isAct:false
      },
      {
        month:5,
        isAct:false
      },
      {
        month:6,
        isAct:false
      },
      {
        month:7,
        isAct:false
      },
      {
        month:8,
        isAct:false
      },
      {
        month:9,
        isAct:false
      },
      {
        month:10,
        isAct:false
      },
      {
        month:11,
        isAct:false
      },
      {
        month:12,
        isAct:false
      }
    ],
    isDay:false, //是否显示日列表
    dayList:[], //日列表
    currentYear:'', //当前选中的年份 
    currentMonth:'',   //当前选中的月份 
    titleData:[    //标题数据
      {
        name:"年收入",
        type:"add",
        money:"0",
        isAct:true
      },
      {
        name:"年支出",
        type:"reduce",
        money:"0",
        isAct:false
      }
    ],
    typeData:{},  //收入支出分类的数据
    isHasData:true, //判断当前是否有数据
    screenW:0,   //屏幕宽度
    //判断用户是否是数次加载
    isFirstLoad:true,
    isAuth:false //判断用户是否授权
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取屏幕宽度
    this.data.screenW = wx.getSystemInfoSync().screenWidth;
    //获取年列表
    this.getYearList(),
    //获取用户授权状态，授权成功，获取数据
    wx.getSetting({
      success:res =>{
        //授权成功
        if(res.authSetting["scope.userInfo"]){
          //获取今年的数据，绘制图表
          this.getMsgData(this.data.currentYear,1)
          this.setData({
            isAuth:true
          })
        }
      }
    })
  },
  onShow:function(){
    if(this.data.isFirstLoad){
      this.data.isFirstLoad=false;
    }else{
      //获取用户授权状态，授权成功，获取数据
    wx.getSetting({
      success:res =>{
        //授权成功
        if(res.authSetting["scope.userInfo"]){
          //获取今年的数据，绘制图表
          this.getMsgData(this.data.currentYear,1)
          this.setData({
            isAuth:true
          })
        }
      }
    })
      
    }
  },
  //获取年份列表
  getYearList(){
    //开始年份
    var startYear=2010;
    //结束年份 今年
    var endYear=new Date().getFullYear();
    while(startYear <= endYear){
      //unshift()在数组头部添加  push()在数组尾部添加
      this.data.yearList.unshift(startYear);
      startYear++;
    }
    //数据响应
    this.setData({
      yearList:this.data.yearList,
      currentYear:endYear
    })
  },
  //下拉列表显示隐藏的点击事件
  showList(e){
    //判断用户是否授权成功，如果没有授权则不提交数据
    if(!this.data.isAuth){
      wx.showToast({
        title: '请先登录',
        icon:"none",
        duration:2000,
        mask:true
      })
      return;
    }
    // 获取当前修改的数据名称
    var name=e.currentTarget.dataset.name;
    // 年列表与日列表可以同时显示
    // this.setData({
    //   [name]:!this.data[name]
    // })
    // 年列表与日列表不可以同时显示
    if(name == 'isYear'){
      this.setData({
        isYear: !this.data.isYear,
        isDay:false
      })
    }else if(name == 'isDay'){
      var isMonth=false;//判断月份是否有激活
      //如果月份没有激活的状态则日列表不显示
      for(var i=0;i<this.data.monthList.length;i++){
        if(this.data.monthList[i].isAct){
          isMonth=true;//有激活的月份
          break;
        }
      }
      //没有激活的月份
      if(!isMonth){
        wx.showToast({
          title: '请选择月份',
          icon:'none',
          duration:2000,
          mask:true
        })
        return;
      }
      this.setData({
        isDay: !this.data.isDay,
        isYear:false
      })
    }
    
  },
  //年列表的点击事件
  yearTap(e){
    //获取当前点击的月份
    var year=e.currentTarget.dataset.year;
    //取消月份激活
    for(var i= 0;i<this.data.monthList.length;i++){
      if(this.data.monthList[i].isAct){
        this.data.monthList[i].isAct=false;
        break;
      }
    }
    //数据响应
    this.setData({
      currentYear:year,
      monthList:this.data.monthList
    })

    //根据选中的年份获取对应的数据，绘制图表
    this.getMsgData(year,1);
  },
  // 月列表点击事件
  monthTap(e){
    //判断用户是否授权成功，如果没有授权则不提交数据
    if(!this.data.isAuth){
      wx.showToast({
        title: '请先登录',
        icon:"none",
        duration:2000,
        mask:true
      })
      return;
    }
    //获取当前点击数据下标
    var index=e.currentTarget.dataset.index;
    //当前点击的月份是激活状态，则取消激活
    if(this.data.monthList[index].isAct){
      this.data.monthList[index].isAct = false;
    }else{
      //取消上一个激活的月份
      for(var i =0;i < this.data.monthList.length; i++){
        if(this.data.monthList[i].isAct){
          this.data.monthList[i].isAct=false;
        }
      }
      //设置当前点击的月份为激活状态
      this.data.monthList[index].isAct=true;
      //记录当前选中的月份
      this.data.currentMonth=this.data.monthList[index].month;

      //清空日列表
      this.data.dayList=[];
      //获取当前月份对应的日列表数据
      var dayNum=new Date(this.data.currentYear,this.data.monthList[index].month,0).getDate();
      for(var i=1;i <= dayNum;i++){
        var dayObj={};
        dayObj.day=i;
        dayObj.isAct =false;
        this.data.dayList.push(dayObj);
      }
    }
    //数据响应
    this.setData({
      monthList:this.data.monthList,
      dayList:this.data.dayList
    })

    //根据年月获取数据，绘制图表
    var time =this.data.currentYear + "-" + this.addZero(this.data.monthList[index].month)
    this.getMsgData(time,2)
  },
  //获取数据，绘制图表
  getMsgData(time,dateType){
    //time时间
    //dateType:1==年数据  2==月数据  3==日数据
    //显示加载框
    wx.showLoading({
      title: '正在加载',
      mask:false,
      duration:1000
    })
    var dataObj ={}
    if(dateType ==1){
      //年数据参数
      this.data.titleData[0].name ="年收入";
      this.data.titleData[1].name ="年支出";
      //开始时间
      dataObj.startTime = time + "-01-01";
      //结束时间
      dataObj.endTime = time + "-12-31"; 
      dataObj.timeType=1;
    }else if(dateType == 2){
      //月数据参数
      this.data.titleData[0].name ="月收入";
      this.data.titleData[1].name ="月支出";
      dataObj.timeType=1;
      //开始时间
      dataObj.startTime = time + "-01";
      var monArr=time.split("-");
      //获取当月多少天
      var dayNum =new Date(monArr[0],monArr[1],0).getDate();
      //结束时间
      dataObj.endTime = time + "-" + dayNum; 
    }else if(dateType ==3){
      //日数据参数
      this.data.titleData[0].name ="日收入";
      this.data.titleData[1].name ="日支出";
      //选中的日期 年月日
      dataObj.date=time;
    }
    
    //调用云函数
    wx.cloud.callFunction({
      name: "get_msg_data",
      data:dataObj,
      success: res=>{
        // console.log("成功",res)
        //根据收入与支出分类
        var typeData={
          shouru:[],
          zhichu:[]
        }
        //清空金额
        this.data.titleData[0].money=0;
        this.data.titleData[1].money=0;
        res.result.data.forEach(v=>{
          //console.log(v.costType);
          
          if(v.costType == "shouru"){
            typeData.shouru.push(v)
            this.data.titleData[0].money += Number(v.money)
          }else{
            typeData.zhichu.push(v)
            this.data.titleData[1].money += Number(v.money)
          }
        })
        //存放给全局变量
        // this.data.typeData = typeData;

        //强制保留两位小数
        this.data.titleData[0].money = Number(this.data.titleData[0].money).toFixed(2)
        this.data.titleData[1].money = Number(this.data.titleData[1].money).toFixed(2)

        //强制激活收入标题框
        this.data.titleData[0].isAct =true;
        this.data.titleData[1].isAct =false;

        //数据响应
        this.setData({
          titleData:this.data.titleData,
          typeData
        })

        //计算金额，绘制图表 默认绘制收入数据
        this.formatTypeData(typeData.shouru);
      },
      fail:err=>{
        // console.log("失败",err)
      }
    })
  },
  //计算各类金额
  formatTypeData(data){
    //关闭加载框
    wx.hideLoading({
      success: (res) => {},
      fail:err=>{}
    })

    //判断是否有数据传入，如果没有则不绘制图表
    if(data.length == 0){
      //没有数据，显示暂无数据
      this.setData({
        isHasData:false
      })
      return;
    }else{
      //有数据显示图表
      this.setData({
        isHasData:true
      })
    }

    //存放数据有什么类型
    var type=[]
    //图表数据
    var series =[];

    data.forEach(v => {
      if(type.indexOf(v.iconTitle) == -1){
        type.push(v.iconTitle)
      }
    })
    //根据类型累加相关金额
    type.forEach(v =>{
      var seriesData ={
        name: v,
        data: 0,
        format: function(num){
          return v + Number(num * 100).toFixed(2) + "%"
        }
      }
      data.forEach(item =>{
        if(v == item.iconTitle){
          seriesData.data += Number(item.money)
        }
      })
      series.push(seriesData);
      
    })
    //绘制图表
    this.drawRing(series)
  },
  //绘制图表
  drawRing(series){
    new wxCharts({
      canvasId:'pieCanvas', //canvas组件中的canvas-id
      type:'pie', //图表的类型
      series,
      width:this.data.screenW,//图表的宽
      height:300, //图表的高
      dataLabel:true
    });
  },
  //收入 支出切换事件
  titleSelect(e){
    //判断用户是否授权成功，如果没有授权则不提交数据
    if(!this.data.isAuth){
      wx.showToast({
        title: '请先登录',
        icon:"none",
        duration:2000,
        mask:true
      })
      return;
    }
    var index=e.currentTarget.dataset.index;
    if(this.data.titleData[index].isAct){
      //当前已激活
      return;
    }

    //取消上一个激活
    for(var i =0;i < this.data.titleData.length;i++){
      if(this.data.titleData[i].isAct){
        this.data.titleData[i].isAct =false;
        break;
      }
    }
    //设置当前的为激活状态
    this.data.titleData[index].isAct=true;

    //数据响应
    this.setData({
      titleData:this.data.titleData
    })
    //切换图表
    if(index == 0){
      //收入图表
      this.formatTypeData(this.data.typeData.shouru);
    }else{
      //支出图表
      this.formatTypeData(this.data.typeData.zhichu);
    }
  },
  //补零函数
  addZero(num){
    return num < 10 ? "0"+num : num;
  },
  dayTap(e){
    var index=e.currentTarget.dataset.index;
    if(this.data.dayList[index].isAct){
      //当前激活
      return;
    }
    //取消上一个激活
    for(var i =0;i<this.data.dayList.length;i++){
      if(this.data.dayList[i].isAct){
        this.data.dayList[i].isAct=false;
        break;
      }
    }
    //设置当前的为激活状态
    this.data.dayList[index].isAct=true;

    //数据响应
    this.setData({
      dayList:this.data.dayList
    })
    //获取数据，绘制图表
    var time =this.data.currentYear + "-" + this.addZero(this.data.currentMonth) + "-" + this.addZero(this.data.dayList[index].day);
    this.getMsgData(time,3)
  }
  // 

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