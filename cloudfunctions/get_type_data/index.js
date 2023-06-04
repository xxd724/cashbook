// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db=cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  // return await db.collection("type_data").get()
  return await db.collection("type_data").where({
    sort:event.type
  }).get()
  // const wxContext = cloud.getWXContext()
  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}