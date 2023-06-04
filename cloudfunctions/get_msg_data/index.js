// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//获取数据库实例
const db=cloud.database()
//获取数据库的操作符
const _ =db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  // return await db.collection("msg_data").where({
  //   userInfo:event.userInfo,
  //   date:event.date
  // }).get()

  // return await db.collection("msg_data").where(event).get()

  //timeType:标识符 该参数是判断是获取一天的数据，还是一段时间的数据，如果等于1则是获取一段时间的，不传值则是获取一天的数据

  if(event.timeType == 1){
    //获取去一段时间
    //startTime:开始范围
    //endTime:结束范围
    event.date=_.gte(event.startTime).and(_.lte(event.endTime))
  }
  return await db.collection("msg_data").where({
    userInfo:event.userInfo,
    date:event.date
  }).get()



  // const wxContext = cloud.getWXContext()
  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}