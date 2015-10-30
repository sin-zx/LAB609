var express = require('express');
var router = express.Router();

var crypto = require('crypto');

router.get('/', function (req, res) {
	console.log(req.query.tag+"..."+req.query.page);

	var page = req.query.page ? parseInt(req.query.page) : 1;
	var whichTag = req.query.tag ? req.query.tag : "语言代码";

	// if(!req.query.tag){	tag = "语言代码";	}
	// if(!req.query.page){	page = 1;	}		这个无法判断！！！！！！！！！
	console.log(whichTag+"..."+page);

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
	    	if(docs==""){	books="";}
	    	else{	books=docs[0].books;	}
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

router.get('/add',function(req,res){
	res.render('lab/addbook', { 
			title: '添加图书',
			user: req.session.user,
			success : req.flash('success').toString(),
			error :req.flash('error').toString()
	});
});

router.post('/add',function(req,res){
	//对class进行判断，若已有则选择，没有则新建 
	//同时存进两张表，一张为全部图书信息，一张为按tag分类的图书
	var newBook = {
		bookname : req.body.bookname,
		author : req.body.author,
		intro : req.body.intro,
		imgUrl : req.body.imgUrl,
		status : 0,
		lendTo : "",
		lendTime : ""
	};
	var	tag = req.body.tag;

	var db = req.db;
	var collection = db.get('booksTag');

	collection.findOne({tag:tag},function(err,doc){
		if(err){
			req.flash("error","系统出错，请重试");
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
					    });
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
				    });
		        }
		    });
		}
	});

	res.redirect("/books/add");
});



module.exports = router;