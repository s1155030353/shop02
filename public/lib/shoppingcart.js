// JavaScript Document
utils = { 
    setParam : function (name,value){ 
        localStorage.setItem(name,value) 
    }, 
    getParam : function(name){ 
        return localStorage.getItem(name) 
    } 
} 
  
product={ 
    pid:0, 
    name:"", 
    quan:0, 
    price:0.00
};

orderdetail={ 
    username:"", 
    phone:"", 
    address:"", 
    zipcode:"", 
    totalNumber:0, 
    totalPrice:0.00     
}

//cart = { 
    //向购物车中添加商品 
    function addproduct(pid, quan){ 
        var ShoppingCart = utils.getParam("ShoppingCart"); 
        //console.log(ShoppingCart);
        if(ShoppingCart==null||ShoppingCart==""){ 
            //第一次加入商品 
            var productlist = [{"pid":pid,"quan":quan}]; 
            utils.setParam("ShoppingCart", JSON.stringify(productlist)); 
        }
        else{ 
            var productlist = JSON.parse(ShoppingCart);
            var result=false; 
            //查找购物车中是否有该商品 
            for(var i in productlist){ 
                if(productlist[i].pid==pid){
                    productlist[i].quan=parseInt(productlist[i].quan)+parseInt(quan);
                    var amnt =  productlist[i].quan;
                    result = true; 
                }
            }
            if(!result){ 
                //没有该商品就直接加进去 
                productlist.push({"pid":pid,"quan":quan}); 
                var amnt = quan;
            } 
            //保存购物车 
            utils.setParam("ShoppingCart", JSON.stringify(productlist)); 
        } 
        //alert('商品:' + pid + ' ' + amnt + ' ');
    }
    //修改给买商品数量 
    function updateproductnum(pid,quan){ 
        var ShoppingCart = utils.getParam("ShoppingCart"); 
        var productlist = JSON.parse(ShoppingCart);
           
        for(var i in productlist){ 
            if(productlist[i].pid==pid){
                productlist[i].quan=parseInt(quan); 
                utils.setParam("ShoppingCart", JSON.stringify(productlist)); 
                return; 
            } 
        } 
    }
    //获取购物车中的所有商品 
    function getproductlist(){ 
        var ShoppingCart = utils.getParam("ShoppingCart"); 
        var productlist = JSON.parse(ShoppingCart);
        return productlist; 
    }
    //判断购物车中是否存在商品 
    function existproduct(pid){ 
        var ShoppingCart = utils.getParam("ShoppingCart"); 
        var productlist = JSON.parse(ShoppingCart); 
        var result=false; 
        for(var i in productlist){ 
            if(productlist[i].pid==pid){ 
                result = true; 
            } 
        } 
        return result; 
    }
    //删除购物车中商品 
    function deleteproduct(pid){ 
        var ShoppingCart = utils.getParam("ShoppingCart"); 
        var productlist = JSON.parse(shoppingcart); 
        var list=[]; 
        for(var i in productlist){ 
            if(productlist[i].pid != pid){ 
                list.push(productlist[i]);
            }
        } 
        productlist = list; 
        utils.setParam("ShoppingCart", JSON.stringify(productlist)); 
    } 
//};

//商品加入到购物车 
//addproduct(product); 
//var productlist=getproductlist();//取出购物车商品 
//alert('', '商品:'+productlist[0].pid+' '+productlist[0].name+' '+productlist[0].num+' '+productlist[0].price, '确定');

function quantityChanged(e) {
    var cart = JSON.parse(utils.getParam('ShoppingCart'));
    var pid = parseInt(e.target.name);
    var newQuan = parseInt(e.target.value);
    for (var i in cart){
        if(cart[i].pid == pid){
            cart[i].quan = newQuan;
            if (cart[i].quan == 0){
                cart.splice(i, 1);
            }
        }
    }
    utils.setParam("ShoppingCart", JSON.stringify(cart));
    showShoppingCart();
}

function showShoppingCart(e) {
    var shopList = $('#shop-list')
    shopList.html('');
    var cart = JSON.parse(utils.getParam('ShoppingCart'));
    //cart = [{pid:1,quan:1},{pid:2,quan:2}];
    var pids = [];
    for (var i in cart) {
        pids.push(cart[i].pid);
    }
    $.ajax('/prod-info', {
        type: 'GET',
        dataType: 'json',
        data: { pids: pids },
        success: function (prods) {
            var total = 0.0;
            for (var i in cart) {
                var item = prods[cart[i].pid]
                total += cart[i].quan * item.price;
                var quanInput = $('<input type="number" step="1" name="' + cart[i].pid + '" value="' + cart[i].quan + '"/>');
                quanInput.change(quantityChanged);
                var record = $('<li></li>');
                record.append(item.name);
                record.append(quanInput);
                record.append('$' + item.price * cart[i].quan);
                shopList.append(record);
            }
            $('a.total').html('Shopping list&nbsp;&nbsp;&nbsp;Total: $' + total);
        }
    });
}

function sendShoppingcart(e){
    var cart = JSON.parse(utils.getParam('ShoppingCart'));
    //cart = [{pid:1,quan:1},{pid:2,quan:2}];
    $.ajax('/checkout', {
        type: 'POST',
        dataType: 'json',
        data: { shoppinglist: cart },
        success: function(url){
            console.log(url);
            window.location.href=url;
        }
    });
}

$(document).ready(function () {
    $('#cart').hover(showShoppingCart);
});

$(document).ready(function(){
    $('#checkout').on("click" ,sendShoppingcart);
});
