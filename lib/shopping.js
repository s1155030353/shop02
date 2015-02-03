// JavaScript Document
function item(name, amount, price){
	this.name = name;
	this.amount = amount;
	this.price = price;
	this.add = function(){
		this.amount = this.amount + 1;
	}
}

function makeup(length, string){
	if (string.length < length){
		var dif = length - string.length;
		var i = 1;
		for (i = 1; i <= dif; i++){
			string = string + "&nbsp";
		}
	}
	return string;
}

var product = new Array(9);
product[0] = new item("Dota2", 0, 5);
product[1] = new item("GTA3", 0, 6);
product[2] = new item("FIFA14", 0, 5);
product[3] = new item("Interstella", 0, 6);
product[4] = new item("The Mist", 0, 6);
product[5] = new item("Triangle", 0, 6);
product[6] = new item("Westlife", 0, 6);
product[7] = new item("Mayday", 0, 6);
product[8] = new item("Shin", 0, 6);
var list = new Array(9);
j = 0;
payment = 0;
for (i = 0; i<=8; i++){
	if (product[i].amount != 0){
		payment = payment + product[i].amount * product[i].price;
		list[j] = makeup(15, product[i].name) +  makeup(12, product[i].amount.toString()) + product[i].price + "<br>";
		j = j + 1;
	}
}
var output = "Product&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspQuantity&nbsp&nbsp&nbsp&nbspPrice<br>"
for (i = 0; i < j; i++){
	var output = output + list[i];
}
document.getElementById("total").innerHTML = "Shopping list&nbsp&nbsp&nbsp&nbspTotal: " +  payment;
document.getElementById("pro").innerHTML = "<p>" + output + "</p>"; 
