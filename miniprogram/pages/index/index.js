// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //当天日期，结束范围
    end:"",
    //某天的记账数据
    dayMsgData:[],
    //当前选中的日期
    currentDate:[],
    //某天的总收入总支出
    dayCost:{
      shouru:0,
      zhichu:0
    },
    //判断当前选中的日期是否是当前
    isToday:true,
    //某月总收入总支出
    monCost:{
      shouru:0,
      zhichu:0
    },
    //某月的结余
    surplus:{
      num:0,
      decimal:"00"
    },
    //当前查找数据的月份
    currentMonth:'',
    //判断用户是否是数次加载
    isFirstLoad:true,
    isAuth:false //判断用户是否授权
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取当天日期
    this.getToday();
    //获取用户授权状态，授权成功，获取数据
    wx.getSetting({
      success:res =>{
        //授权成功
        if(res.authSetting["scope.userInfo"]){
          //获取当天的记账记录
          this.getDayMsgData(this.data.end);
          //记录当前查找的月份数据
          this.data.currentMonth =this.data.end.substring(0,7);
          //获取某月数据
          this.getMonMsgData(this.data.end.substring(0,7));
          this.setData({
            isAuth:true
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(this.data.isFirstLoad){
      this.data.isFirstLoad=false;
    }else{
      //获取用户授权状态，授权成功，获取数据
      wx.getSetting({
        success:res =>{
          //授权成功
          if(res.authSetting["scope.userInfo"]){
            //获取当天的记账记录
            this.getDayMsgData(this.data.end);
            //记录当前查找的月份数据
            this.data.currentMonth =this.data.end.substring(0,7);
            //获取某月数据
            this.getMonMsgData(this.data.end.substring(0,7));
            this.setData({
              isAuth:true
            })
          }
        }
      })
    }
  },
  isAuthTap(){
    if(!this.data.isAuth){
      wx.showToast({
        title: '请先登录',
        icon:"none",
        duration:2000,
        mask:true
      })
    }
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
      currentDate:months + "月" + day + "日"
    })
  },
  //补零函数
  addZero(num){
    return num < 10 ? "0"+num : num;
  },
  //获取某天的记账记录
  getDayMsgData(time){
    //time :日期 ，获取该日期的数据
    //清空总收入总支出
    this.data.dayCost.shouru=0;
    this.data.dayCost.zhichu=0;
    //显示加载框
    wx.showLoading({
      title:"加载中",
      mask:false,
      duration:1000
    })
    //调用云函数 get_msg_data
    wx.cloud.callFunction({
      name:"get_msg_data",
      data:{
        date:time
      },
      success:(res)=>{
        // console.log("天",res)
        //获取返回的数据
        var data=res.result.data;
        //将数据倒序排列
        data.reverse();
        data.forEach(v=>{
          // if(v.costType == 'shouru'){
          //   this.data.dayCost.shouru += Number(v.money)
          // }else{
          //   this.data.dayCost.zhichu  += Number(v.money)
          // }
          this.data.dayCost[v.costType] += Number(v.money);

          //toFixed() 保留小数位方法，调用者必须是数值类型
          v.money=Number(v.money).toFixed(2);
        })

        //判断当前选中的日期是否是今天
        if(time == this.data.end){
          this.data.isToday=true;
        }else{
          this.data.isToday=false;
        }
        this.data.dayCost.shouru=Number(this.data.dayCost.shouru).toFixed(2);
        this.data.dayCost.zhichu=Number(this.data.dayCost.zhichu).toFixed(2);
        //数据响应
        this.setData({
          dayMsgData:data,
          dayCost:this.data.dayCost,
          isToday:this.data.isToday
        })
        //关闭加载框
        wx.hideLoading({
          success: (res) => {},
          fail:(err)=>{}
        });
        wx.showToast({
          title: '加载完成',
          icon:"success",
          duration:2000,
          mask:true
        })
      },
      fail:(err)=>{

      }
    })
  },
  //选择日期
  selectDate(e){
    //获取今年年份
    var year=new Date().getFullYear();
    //分割选中的日期
    var timeArr=e.detail.value.split("-");
    //判断当前选中的日期是否是今年，如果是则显示月日，反之显示年月日
    if(year==timeArr[0]){
      this.data.currentDate=`${Number(timeArr[1])}月${Number(timeArr[2])}日`
    }else{
      this.data.currentDate=`${timeArr[0]}年${Number(timeArr[1])}月${Number(timeArr[2])}日`
    }
    //数据响应
    this.setData({
      currentDate:this.data.currentDate
    })
    //调用函数，获取当天数据
    this.getDayMsgData(e.detail.value);
    //如果切换的日期月份相同则不重复获取月份的数据，月份不同则获取月份数据
    if(e.detail.value.substring(0,7) != this.data.currentMonth){
      this.getMonMsgData(e.detail.value.substring(0,7));
      //修改当前获取的月份数据
      this.data.currentMonth =e.detail.value.substring(0,7);
    }
  },
  //获取某月记账数据
  getMonMsgData(month){
    //获取月份第一天日期
    var start=month + "-01";
    
    var monArr=month.split("-");
    //获取当月有多少天
    var dayNum=new Date(monArr[0], monArr[1], 0).getDate();
    //获取月份最后一天的日期
    var end=month + "-" +dayNum;
    //总收入 总支出清零
    this.data.monCost.shouru=0;
    this.data.monCost.zhichu=0;
    // 调用云函数
    wx.cloud.callFunction({
      name:"get_msg_data",
      data:{
        timeType:1,
        startTime:start,
        endTime:end
      },
      success:(res)=>{
        // console.log("月",res)
        //获取返回的数据
        var data=res.result.data;
        data.forEach(v=>{
          this.data.monCost[v.costType] +=Number(v.money);
        })
        //强制保留两位小数
        this.data.monCost.shouru = Number(this.data.monCost.shouru).toFixed(2);
        this.data.monCost.zhichu = Number(this.data.monCost.zhichu).toFixed(2);

        //结余计算 收入-支出
        var surNum =(Number(this.data.monCost.shouru) - Number(this.data.monCost.zhichu)).toFixed(2).split(".");
        //数据响应
        this.setData({
          monCost:this.data.monCost,
          surplus:{
            num:surNum[0],
            decimal:surNum[1]
          }
        })
      },
      fail:err=>{

      }
    })
  },
  //跳转到详情页面
  navToDetail(e){
    //获取单个数据id
    var id =e.currentTarget.dataset.id;
    //跳转
    wx.navigateTo({
      url: `../detail/detail?id=${id}`,
    })
  }
  // /**
  //  * 生命周期函数--监听页面初次渲染完成
  //  */
  // onReady: function () {

  // },

  // 

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