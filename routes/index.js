var express = require('express');
var router = express.Router();

var crypto = require('crypto');
var User = require('../models/user.js');


router.get('/', function (req, res) {
	res.render('lab/main', { 
		title: 'LAB609',
		user: req.session.user,
		intro:1
	    /*
	    success: req.flash('success').toString(),
	    error: req.flash('error').toString()
	    */
	});
});


router.get('/finance', function (req, res) {
	var page = req.query.page ? parseInt(req.query.page) : 1;	//query.page是字符串，要转成数字
	var db = req.db;
    var collection = db.get('finance');
    collection.count({}, function (err, total) {	//获取document总数total
	    collection.find({},{
	    	skip: (page - 1)*2,
	        limit: 2,
	        sort : { _id: -1 }	//倒序
	    },function(e,docs){
			if(e){
				req.flash('error', '查找失败!请重试');
			}
			console.log("hello::"+docs.length);
		    res.render('lab/finance', {
		    	page : page,
		        title: '金融数据',
		        user: req.session.user,
		        datas:docs,
		        isFirstPage: (page - 1) == 0,
      			isLastPage: ((page - 1) * 2 + docs.length) >= total,	//docs.length为每次获取的条数
		        success: req.flash('success').toString(),
		        error: req.flash('error').toString()
		    });
	    });
	});
});

router.get('/login', function (req, res) {
	res.render('login', {
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});
router.get('/logout', function (req, res) {
	req.session.user = null;
	req.flash('success', '注销成功!');
	res.redirect('back');//登出成功后跳转到主页
});

router.post('/login', function (req, res) {
	//var md5 = crypto.createHash('md5');
	//var password = md5.update(req.body.password).digest('hex');	//md5加密密码
	var usernameC = req.body.username;
	var passwordC = req.body.password;

	var db = req.db;
	var collection = db.get('admin');
	//查找用户名（name键）值为 name 一个文档
	collection.findOne({
	username: usernameC
	}, function (err, user) {
		if(err){
			res.json({
			 	status:'failed',
			 	errormsg:'登陆失败，请重试'
		 	});
		}
		else if (!user) {
		    res.json({
			 	status:'failed',
			 	errormsg:'账号不存在！'
		 	});
	    }
	    //检查密码是否一致
	 	else if (user.password != passwordC) {
	      	res.json({
			 	status:'failed',
			 	errormsg:'密码错误'
		 	});
	    }
	    //用户名密码都匹配后，将用户信息存入 session
	    else
	    {
	    	req.session.user = user;
		  	res.json({
			 	status:'success',
			 	errormsg:'',
			 	level:user.level,
			 	username : usernameC
			});
	    }
	});

	//检查用户是否存在
	/*User.get(usernameC, function (err, user) {
		
	    if (!user) {
		    res.json({
			 	status:'failed',
			 	errormsg:'账号不存在！'
		 	});
		 	console.log(user);
		 	res.end();
	    }
	    //检查密码是否一致
	    else if (user.password != password) {
	      	res.json({
			 	status:'failed',
			 	errormsg:'密码错误'
		 	});
		 	console.log(user);
		 	res.end();
	    }
	    //用户名密码都匹配后，将用户信息存入 session
	    else
	    {
	    	req.session.user = user;
		  	res.json({
			 	status:'success',
			 	errormsg:'',
			 	level:user.level
			});
	    }
	});*/
});


/* test begin */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('test');
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
});

//向数据库添加数据
router.post('/addUser', function (req, res){
	// Set our internal DB variable
    var db = req.db;
    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var Email = req.body.email;
 
    // Set our collection
    var collection = db.get('test');
 
    // Submit to the DB
    collection.insert(
    {
        "username" : userName,
        "email" : Email
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("数据插入失败");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            res.location("userlist");
            // And forward to success page
            res.redirect("userlist");
        }
    });
});


router.post('/testajax',function (req,res){
	// res.send("hello");

	 res.json({
	 	msg:1,
	 	name:req.body.txtName,
	 	pwd:req.body.txtPass,
	 });
});
router.get('/testajax',function (req,res){
	res.render('post');
});

/* test end */


module.exports = router;