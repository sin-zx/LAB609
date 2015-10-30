function User(user) {
  this.username = user.username;
  this.password = user.password;
  this.level = user.level;
  
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {  
  //要存入数据库的用户文档
  //注：prototype是指实例方法，需要先new一个User对象再调用，如果不加则是类方法，可直接调用: User.get()
  var user = {
      name: this.name,
      password: this.password,
      level: this.level
  };
  //打开数据库
  var db = req.db;
  var collection = db.get('admin');


  collection.insert(
    {
        "username" : username,
        "pwd":password,
        "level":level
    }, function (err, user) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        callback(null, user[0]);  //成功！err 为 null，并返回存储后的用户文档
    });
};

//读取用户信息
// User.get = function(db,username, callback) {
//   //打开数据库
//   console.log("1");
//   var db = db;
//   console.log("2");
//   var collection = db.get('admin');
//   //查找用户名（name键）值为 name 一个文档
//   collection.findOne({
//     username: username
//   }, function (err, user) {
//     // if (err) {
//     //   return callback(err);//失败！返回 err 信息
//     // }
    
//     callback(null, user);//成功！返回查询的用户信息
//   });
// };

User.get = function(username, callback) {
  //打开数据库
  console.log("2");
 return function  (req, res) {
   console.log(req.db);
   callback("123");
 }
};