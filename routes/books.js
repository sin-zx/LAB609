var express = require('express');
var router = express.Router();

var crypto = require('crypto');


function trim(str){ //删除左右两端的空格
    return str.replace(/(^\s*)|(\s*$)/g, "");
}

function checkLogin(req, res, next) {
    if (!req.session.user) {
		req.flash('error', '未登录'); 
		return res.redirect('/books');
    }
    next();
}



  
router.get('/', function (req, res) {
	var page = req.query.page ? parseInt(req.query.page) : 1;
	var whichTag = req.query.tag ? req.query.tag : "大数据";

	// if(!req.query.tag){	tag = "语言代码";	}
	// if(!req.query.page){	page = 1;	}		这个无法判断！！！！！！！！！
	var db = req.db;
    var collection = db.get('booksTag');
    
    collection.find({},{tag:1},function(e,docs){
    	if(e){
    		req.flash('error', '查找失败!请重试');
    		return res.redirect('/books');
    	}
        tags = docs;
    });
    collection.count({ tag:whichTag }, function (err, total) {
	    collection.find({ tag:whichTag },{	
	    	skip: (page - 1)*8,
	        limit: 8,
	        tag : { _id: 1 }	//关键字sort会不会冲突？
	    },function(e,docs){
	    	if(e){
	    		req.flash('error', '查找失败!请重试');
	    		return res.redirect('/books');
	    	}
	    	if(docs=="")	{	books="";}
	    	else	{	books=docs[0].books;	}
	        res.render('lab/books', { 
	        	page : page,
				title: '609书架',
				user: req.session.user,
				books:books,
				tags:tags,
				currentTag:whichTag,
				isFirstPage: (page - 1) == 0,
      			isLastPage: ((page - 1) * 8 + docs.length) >= total,	//docs.length为每次获取的条数
				success : req.flash('success').toString(),
				error :req.flash('error').toString()
			});
	    });
	});
});


router.get('/add', checkLogin);
router.get('/add',function(req,res){
	var tags;
	var db = req.db;
    var collection = db.get('booksTag');
    collection.find({},{tag:1},function(e,docs){
    	if(e){
    		req.flash('error', '分类显示失败');
    	}
        tags = docs;
        res.render('lab/addbook', { 
			title: '添加图书',
			user: req.session.user,
			success : req.flash('success').toString(),
			error :req.flash('error').toString(),
			tags:tags
		});
    });
	
});

router.post('/add',function(req,res){
	//对class进行判断，若已有则选择，没有则新建 
	//同时存进两张表，一张为全部图书信息，一张为按tag分类的图书
	var newBook = {
		bookname : trim(req.body.bookname),
		author : trim(req.body.author),
		intro : req.body.intro,
		imgUrl : trim(req.body.imgUrl),
		status : 0,
		lendTo : "",
		lendTime : ""
	}; 
	var	tag = trim(req.body.tag);

	var db = req.db;
	var collection = db.get('booksTag');

	collection.findOne({tag:tag},function(err,doc){
		if(err){
			req.flash("error","系统出错，请重试");
			res.redirect("/books/add");
		}
		else if(doc){	//分类存在,则插入
			collection.update(
				{	tag:tag },
				{
					"$push":{
						"books":newBook
					}
				},function (err) {
			        if (err) {
			            req.flash("error","添加失败，请重试");
			            res.redirect("/books/add");
			        }
			        else {
			        	//插入到总表
			        	collection = db.get('booksAll');
			        	newBook.tag = tag;
			            collection.insert(newBook, function (err) {
					        if (err) {
					            req.flash("error","添加失败，请重试");
					        }else{
					        	req.flash("success","添加成功");
					        }
					        res.redirect("/books/add")
;					    });
		        	}

		    });
		}
		else{	//分类不存在，则新建
			collection.insert({
				tag:tag,
				books:[newBook]
			}, function (err) {
		        if (err) {
		            req.flash("error","添加失败，请重试");
		            res.redirect("/books/add");
		        }
		        else {
		        	//插入到总表
		        	collection = db.get('booksAll');
		        	newBook.tag = tag;
		            collection.insert(newBook, function (err) {
				        if (err) {
				            req.flash("error","添加失败，请重试");
				        }else{
				        	req.flash("success","添加成功");
				        }
				        res.redirect("/books/add");
				    });
		        }
		    });
		}
	});
});


router.get('/delete/:tag/:bookname', checkLogin);
router.get('/delete/:tag/:bookname',function(req,res){

	var bookname = req.params.bookname;
	var	tag = req.params.tag;
	var key = {
		bookname:bookname,
	};
	var db = req.db;
	var collection = db.get('booksTag');

	collection.findOne({tag:tag},function(err,doc){
		if(err || !doc){
			req.flash("error","系统出错，请重试");
			return res.redirect("/books");
		}
		else{	
			
			collection.update(
				{	tag:tag },
				{
					"$pull":{
						"books":key
					}
				},function (err) {
			        if (err) {
			            req.flash("error","删除失败，请重试");
			            return res.redirect("/books");
			        }
			        else {
			        	//从总表删除
			        	collection = db.get('booksAll');
			        	collection.remove({
					        "bookname": bookname,
					        "tag":tag
					      }, {
					        w: 1
					      }, function (err) {
					        if (err) {
					          	req.flash("error","删除失败！请重试");
					        }
					        else{
					        	req.flash("success","删除成功");
					        }
					        res.redirect("/books");
					    });
		        	}
		    });
		}
	});
});

router.post('/lend',function(req,res){
	var bookname = req.body.bookname;
	var	tag = req.body.tag;
	var	lendto = req.body.lendto;

	var t = new Date();
	var lendTime = String(t.getFullYear()) +"-"+ String(t.getMonth()+1) +"-"+ String(t.getDate());

	var db = req.db;
	var collection = db.get('booksTag');

	collection.findOne({tag:tag},function(err,doc){
		if(err || !doc){
			req.flash("error","系统出错，请重试");
			res.redirect("/books");
		}
		else{	
			collection.update(
				{	
					tag:tag,
					"books.bookname":bookname
				},
				{
					$set:{"books.$.lendTo":lendto,"books.$.lendTime":lendTime,"books.$.status":1}	//修改已选择的元素集合里的相关借阅信息 ; '$'用于定位已匹配的的元素，如果多个，就匹配第一个
				},function (err) {
			        if (err) {
			            req.flash("error","借出失败！请重试");
			            return res.redirect("/books");
			        }
			        else {
			        	//从总表修改
			        	collection = db.get('booksAll');
			        	collection.update({
					        "bookname": bookname,
					        "tag":tag
					      }, {
					        $set:{"lendTo":lendto,"lendTime":lendTime,"status":1}
					      }, function (err) {
					        if (err) {
					          	req.flash("error","借出失败！请重试");
					        }
					        else{
					        	req.flash("success","借出成功");
					        }
					        res.redirect("/books");
					    });
		        	}
		    });
		}
	});
	
	
});

router.get('/return/:tag/:bookname', checkLogin);
router.get('/return/:tag/:bookname',function(req,res){
	var bookname = req.params.bookname;
	var	tag = req.params.tag;

	var db = req.db;
	var collection = db.get('booksTag');

	collection.findOne({tag:tag},function(err,doc){
		if(err || !doc){
			req.flash("error","系统出错，请重试");
		}
		else{	
			collection.update(
				{	
					tag:tag,
					"books.bookname":bookname	//选择对应的tag下的books数组的一个元素集合 报错？
				},
				{
					$set:{"books.$.lendTo":"","books.$.lendTime":"","books.$.status":0}	//修改已选择的元素集合里的相关借阅信息 ; '$'用于定位已匹配的的元素，如果多个，就匹配第一个
				},function (err) {
			        if (err) {
			            req.flash("error","回收失败！请重试");
			        }
			        else {
			        	//从总表回收
			        	collection = db.get('booksAll');
			        	collection.update({
					        "bookname": bookname,
					        "tag":tag
					      }, {
					        $set:{"lendTo":"","lendTime":"","status":0}
					      }, function (err) {
					        if (err) {
					          	req.flash("error","回收失败！请重试");
					        }
					        else{
					        	req.flash("success","回收成功");
					        }
					        res.redirect("/books");
					    });
		        	}
		    });
		}
	});
});



module.exports = router;