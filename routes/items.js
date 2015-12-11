var express = require('express');
var router = express.Router();

var crypto = require('crypto');

router.get('/bus', function (req, res) {
	res.render('lab/items/bus', { 
				title: '深圳公交多因子评分模型',
				user: req.session.user,
				success : req.flash('success').toString(),
				error :req.flash('error').toString()
			});
});




module.exports = router;