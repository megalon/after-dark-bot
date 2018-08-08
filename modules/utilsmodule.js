// JavaScript source code
// Utils file
var methods = {};

methods.getRandomInt = function(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

methods.listArrayItems = function(a){
	var output = "";
	for(var i = 0; i < a.length; i++){
		output = output + "    `" + a[i] + '`\n';
	}
	return output;
}

methods.isZip = function(filepath){
	if (typeof filepath === "undefined") {
		return false;
	}
	if(filepath.indexOf(".zip") > -1 || filepath.indexOf(".7zip") > -1)
		return true;
	return false;
}

methods.getTime = function(){
	var date = new Date();
	var year = date.getUTCFullYear();
	var month = date.getUTCMonth();
	var day = date.getUTCDate();
	var hour = date.getUTCHours();
	var minute = date.getUTCMinutes();
	var second = date.getUTCSeconds();
	var mili = date.getUTCMilliseconds();
	return (year + "-" + month + "-" + day + "-" + hour + ":" + minute + ":" + second + ":" + mili);
}

methods.logMsg = function(msg){
	console.log(methods.getTime() + " " + msg);
}

methods.unescapeSpecial = function(string){
	string = methods.replaceAll(string, "&lbrack;", "[")
	string = methods.replaceAll(string, "&rsqb;", "]")
	string = methods.replaceAll(string, "&period;", ".")
	string = methods.replaceAll(string, "&NewLine;", "\n")
	string = methods.replaceAll(string, "&comma;", ",")
	string = methods.replaceAll(string, "&lpar;", "(")
	string = methods.replaceAll(string, "&rpar;", ")")
	string = methods.replaceAll(string, "&colon;", ":")
	string = methods.replaceAll(string, "&excl;", "!")
	string = methods.replaceAll(string, "&quest;", "?")
	string = methods.replaceAll(string, "&amp;", "&")
	string = methods.replaceAll(string, "&apos;", "'")
	string = methods.replaceAll(string, "&plus;", "+")
	string = methods.replaceAll(string, "&sol;", "/")
	string = methods.replaceAll(string, "&equals;", "=")
	string = methods.replaceAll(string, "&vert;", "|")
	string = methods.replaceAll(string, "&lowbar;", "_")
	string = methods.replaceAll(string, "&num;", "#")
	return string;
}

methods.escapeRegExp = function(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

methods.replaceAll = function(str, find, replace) {
	return str.replace(new RegExp(methods.escapeRegExp(find), 'g'), replace);
}

module.exports = methods;