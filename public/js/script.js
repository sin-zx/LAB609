/*	首页登陆模块的ajax提交
 * 	页面按钮效果
 * 	表单提交
 *	by zixin 2015.10
 */

$(document).ready(function(){


    $(".lendBtn").click(function () { 
      $(this).next("div").css('display', 'block');    //选择下一个同胞元素 即被隐藏的输入框
    });  

    $(".lendsubBtn").click(function () { 
      var lendname = $(this).prev("form").children(".lendname").val();
      if(lendname==null || lendname==""){
            alert("借阅人不能为空!");
      }else{
        $(this).prev("form").submit();
      }
    }); 

	// 登陆框调用ajax代码：
        $("#password").keydown(function (event) {
            if (event.which == "13") {//回车键，用.ajax提交表单
                $("#btnLogin").trigger("click");
            }
        });
        $("#btnLogin").click(function () { //“登录”按钮单击事件
            //获取用户名称
            var usernameC = $("#username").val();
            //获取输入密码
            var passwordC = $("#password").val();
            /*$("#errmsg").text(Cpassword+Cusername);
            $("#loginDone").show();
            $("#loginFail").show();*/
            //开始发送数据
            $.ajax
            ({ //请求登录处理页
                url: "login", //登录处理页
                dataType: 'html', //这里的html是指什么？~！！！！！！！！！
                //传送请求数据
                type:'post',
                data: { username: usernameC, password: passwordC },
                success: function(data){
                    var data = $.parseJSON(data);
                      if(data.status=="success")
                      {
                        $("#loginDone").text("欢迎回来，"+data.username);
                        $("#loginDone").show();
                        window.location.href="/";
                      }
                      else
                      {
                        $("#errmsg").text(data.errormsg);
                        $("#loginFail").show();
                      } 
                }
            });
        });
	/*登陆部分结束*/

/*表单检查*/
	/*$("#addbtn").click(function () {
		var bookname=$("#bookname").val();  
		var sort=$("#sort").val();
		if(bookname==null || bookname==""){  
		    $("#addbook_warning").text("书名不能为空！");
	        $("#addFail").show();
		    $("#bookname").focus();  
		}
		else if(sort==null || sort==""){  
		    $("#addbook_warning").text("请添加分类！");
	        $("#addFail").show();
		    $("#sort").focus();  
		}
		else{  
		   $("#addForm").submit(); 
		}   
	});*/

/*表单部分结束*/
});

function checkForm(){  
	var bookname=$("#bookname").val();  
	var tag=$("#tag").val();
	if(bookname==null || bookname==""){  
	    $("#addbook_warning").text("书名不能为空！");
	    $("#addFail").show();
	    $("#bookname").focus();  
	    return false;
	}
	else if(tag==null || tag==""){  
	    $("#addbook_warning").text("请添加分类！");
	    $("#addFail").show();
	    $("#tag").focus();  
	    return false;
	}
	else{  
	   $("#addForm").submit(); 
	} 
}  


