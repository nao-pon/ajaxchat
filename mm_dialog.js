///////////////////////////////////////////////////////////////////////////////
//
// IE と Moz/FF のモードレスダイアログのオープン・値の受け渡し・戻り値の参照
// 方法を統一するインターフェース
// モードレス・モーダルダイアログ共通版
//
// コピペで貼り付けるHTMLタグ：
//<script src="mm_dialog.js" type="text/javascript" charset="shift_jis">
//</script>
//
// 統一インターフェース（基本的にIEに倣う）:
//  ●showModelessDialog(url,param,options)
//  ●showModalDialog(url,param,options)
//  ------------------+-------------+-------------------------------------------
//    parameter name  |  type       | usage
//  ------------------+-------------+-------------------------------------------
//       url          | "string"    | url を指定する
//       param        | "object"    | 必ず DialogParam() オブジェクトを指定する
//       options      | "string"    | window.open() の指定と同じものを指定する
//                    |             | IE,Moz,FF,OP 等ブラウザによるオプション指定
//                    |             | 方法の違いを全て吸収します。
//  ------------------+-------------+-------------------------------------------
//  ●DialogParam(window_name)
//  ------------------+-------------+-------------------------------------------
//    parameter name  |  type       | usage
//  ------------------+-------------+-------------------------------------------
//       window_name  | "string"    | ダイアログウィンドウに付ける固有の名前を
//                    |             | 指定する。モードレスダイアログのときのみ
//                    |             | window.xxxDialog.xxxx.xxxx 書式でダイアロ
//                    |             | グを参照できるようにする。
//       modal        | boolean     | modal=true,modeless=false を設定する
//       modeless     | boolean     | modal=false,modeless=true を設定する
//                    |             | modal=false,modeless=false は ChildWindow
////////////////////////////////////////////////////////////////////////////////
// Dialog Style
//  IE: window.dialogArguments="object"
//  MZ: window.opener="object"
//  FF: window.opener="object"
//
// Window Style
//  IE: child Window の場合：window.opener="object",dialogArguments="undefined"
//  MZ: 同上
//  FF: 同上
////////////////////////////////////////////////////////////////////////////////
//z-index をキープするメソッドと指定オプション一覧
//            method          |o|      option      | usage
//  --------------------------+-+------------------+------------------------
//     showModalDialog        |i|        -         | メソッド名称の通り
//     showModelessDialog     |i|        -         | 　　　　〃
//     window.open            |m|     modal=yes    | 第三引数に指定でモーダル
//     window.open            |m|   dependent=yes  | 第三引数に指定でモードレス
//  ※現時点では、window.open("","","modal=yes"); はバグにより、"dependent=yes"
//    と等価。
//
////////////////////////////////////////////////////////////////////////////////
var _op_ = !!window.opener; //子窓で起動された
var _ope_ = !!window.opera; //Opera なら true
var _ie_ = !!window.dialogArguments; //IE で動いているか(showModal を実装している）
var _md_ = !!window.showModelessDialog; //showModal を実装している
var _mf_ = navigator.userAgent.match(/(gecko|firefox)/i) != null; //Moz/Firefox

////////////////////////////////////////////////////////////////////////////////
//
// Public Methods
//
////////////////////////////////////////////////////////////////////////////////
// このモジュールの公開メソッド
function DialogParam(window_name) {
	this["name"] = window_name;

	//起動時に再設定される
	this["modal"] = false;
	this["modeless"] = false;

	this.getVersion=function() { return "0.1"; }
	this.toString=function() {
		var k;
		var s="";
		for (k in this) {
			s += k + "=" + this[k] + "\n";
		}
		return s;
	}
}
var opt_mode = true; 
	//false=window.open() オプションを IE 系オプション へ変換
	//true =showModalDialog() オプションを window.open() 系オプションへ変換（デフォルト）

function useMM() { opt_mode = false;}
function useIE() { opt_mode = true; }

////////////////////////////////////////////////////////////////////////////////
//
// showModalDialog and showModelessDialog の（再）定義
//
////////////////////////////////////////////////////////////////////////////////
//IE の場合：既存の showModal/Modeless をオーバーライドする
//MZ の場合：新規の showModal/Modeless を作成する
window.showModalDialog = function(dlg) { //モーダルダイアログ
	return function(url,obj,prm) {
		//IE だけ 第四パラメータ dlg を使う
		return OpenModalDialog(url,obj,prm,dlg);
	}
}(window.showModalDialog);

window.showModelessDialog = function(dlg) { //モードレスダイアログ
	return function(url,obj,prm) {
		//IE だけ 第四パラメータ dlg を使う
		return OpenModelessDialog(url,obj,prm,dlg);
	}
}(window.showModelessDialog);

////////////////////////////////////////////////////////////////////////////////
//
// Private Methods
//
////////////////////////////////////////////////////////////////////////////////
//（絶対移動）
//IE の モードレスダイアログは通常 moveTo では移動できません。
//これを moveTo でも移動できるようにします。
var InitMoveTo = function() {
	window.moveTo = function(mvto) {
		return function(x,y) {
			if (_md_) {
				window.dialogLeft=toPX(x);
				window.dialogTop=toPX(y);
			}
			else {
				mvto(x,y);
			}
		}
	}(window.moveTo);
}
//（相対移動）
//これも
var InitMoveBy = function() {
	window.moveBy = function(mvby) {
		return function(x,y) {
			if (_md_) {
				var px = (toNum(window.dialogLeft) + toNum(x)) + "px";
				var py = (toNum(window.dialogTop) + toNum(y)) + "px";
				window.dialogLeft=px;
				window.dialogTop=py;
			}
			else {
				mvby(x,y);
			}
		}
	}(window.moveBy);
}
//リサイズ
//（絶対）
var InitResizeTo = function() {
	window.resizeTo = function(rszto) {
		return function(w,h) {
			if (_md_) {
				window.dialogWidth=toPX(w);
				window.dialogHeight=toPX(h);
			}
			else {
				rszto(w,h);
			}
		}
	}(window.resizeTo);
}
//リサイズ
//（相対）
var InitResizeBy = function() {
	window.resizeBy = function(rszby) {
		return function(w,h) {
			if (_md_) {
				var pw = (toNum(window.dialogLeft) + toNum(w)) + "px";
				var ph = (toNum(window.dialogTop) + toNum(h)) + "px";
				window.dialogWidth=pw;
				window.dialogHeight=ph;
			}
			else {
				rszby(w,h);
			}
		}
	}(window.resizeBy);
}
//
function toNum(n) {
	try {
		return parseInt(n,10);
	}
	catch ( ex ) {
		return 0;
	}
}
//数値を"px" 付き文字列に変換する
var toPX = function(n) {
	var z = n;
	if (typeof n == "string") {
		try {
			z = parseInt(n);
		}
		catch( e ) {
			return n;
		}
	}
	return z + "px";
}
//------------------------------------------------------------------------------
// 拡張ユーティリティ
// 移動系：
//		moveCenter = 親画面の中央に移動
//		moveLeftUpper = 親画面のクライアント内左上に移動。
//		moveRightUpper = 親画面のクライアント内右上に移動。
//		moveLeftLower = 親画面のクライアント内左下に移動。
//		moveRightLower = 親画面のクライアント内右下に移動。
//		formationCascade = 親画面のクライアント内でカスケード表示
//							（右下方向に左上座標を 20,20 ずつずらして重ねる）
//		formationTileLU = 親画面のクライアント内でタイル表示
//							（横長にリサイズして上から下へ敷き詰める）
//		formationTileLR = 親画面のクライアント内でタイル表示
//							（縦長にリサイズして左から右に敷き詰める）
//		formationTile = 親画面のクライアント内でタイル表示
//							（縦横をリサイズして、左→右,上→下方向へ敷き詰める）
//------------------------------------------------------------------------------
var InitExpandUtilities = function(arg) {
	if (typeof arg == "undefined") return ;
	arg.resizeTo = function(x,y) {
		var px = parseInt(x,10);
		var py = parseInt(y,10);
		arg.__stat.dialogWidth = px + "px";
		arg.__stat.dialogHeight = py + "px";
		window.resizeTo(px,py);
	}
	arg.moveCenter = function() {
		var px = (screen.width - parseInt(arg.__stat.dialogWidth,10))/2;
		var py = (screen.height - parseInt(arg.__stat.dialogHeight,10))/2;
		arg.__stat.dialogLeft = px + "px";
		arg.__stat.dialogTop = py + "px";
		window.moveTo(px,py);
		//コメントと実装が違う・・・・まぁいいか。
	}
	arg.moveLeftUpper = function() {
		alert("moveRightUpper\n（未実装です）");
	}
	arg.moveRightUpper = function() {
		alert("moveRightUpper\n（未実装です）");
	}
	arg.moveLeftLower = function() {
		alert("moveLeftLower\n（未実装です）");
	}
	arg.moveRightLower = function() {
		alert("moveRightLower\n（未実装です）");
	}
	arg.formationCascade = function() {
		alert("formationCascade\n（未実装です）");
	}
	arg.formationTileUL = function() {
		alert("formationTileUL\n（未実装です）");
	}
	arg.formationTileLR = function() {
		alert("formationTileLR\n（未実装です）");
	}
}


//------------------------------------------------------------------------------
// モーダルダイアログをオープンする
//------------------------------------------------------------------------------
var OpenModalDialog = function(url,dialogParam,options,modalDialog) {

	var force_load = "?" + (new Date()).getTime();

	if (url.lastIndexOf("?") < 0)
		url += "?" + force_load;

	if (_md_) {
		dialogParam.modeless = false;
		dialogParam.modal = true;

		var opts = !opt_mode ? OptionConverter_ie(options) : options;

		opts = setOptions_ie(dialogParam,opts);

		var w = modalDialog(url,dialogParam,opts);
		window[dialogParam.name] = w; 
		//w.returnValue = null;//戻り値は returnValue を見てね。
		return w;
	}
	else if (_mf_) {
		dialogParam.modal = false;
		dialogParam.modeless = true;

		if (opt_mode)
			options = OptionConverter_mm(options);

		options = setOptions_mm(dialogParam,options);

		var modal = "modal=yes"; //バグに付き、モードレスと同じ動作をしてしまう
		if (options.length > 0) modal+=",";
		options = modal + options;
		var w = window.open(url,dialogParam.name,options);
		//MZ/FF 系のモーダルダイアログはバグっています。
		//モーダルなのに動きはモードレスです。
		//なので IE とは互換になりません。注意！
		window[dialogParam.name+"_arguments"] = dialogParam;
		w.returnValue = null;
		return w;
	}
	else {
		dialogParam.modeless = false;
		dialogParam.modal = false;

		if (opt_mode)
			options = OptionConverter_mm(options);

		options = setOptions_mm(dialogParam,options);

		var w = window.open(url,dialogParam.name,options);
		window[dialogParam.name+"_arguments"] = dialogParam;
		w.returnValue = null;
		return w;
	}
}
//------------------------------------------------------------------------------
// モードレスダイアログをオープンする
//------------------------------------------------------------------------------
var OpenModelessDialog = function(url,dialogParam,options,modelessDialog) {

	var force_load = ""+(new Date()).getTime();

	if (url.lastIndexOf("?") < 0)
		url += "?" + force_load;

	if (_md_) {
		dialogParam.modal = false;
		dialogParam.modeless = true;

		var opts = !opt_mode ? OptionConverter_ie(options) : options;

		opts = setOptions_ie(dialogParam,opts);

		var w = modelessDialog(url,dialogParam,opts);
		window[dialogParam.name] = w;
		w.returnValue = null; //戻り値は returnValue を見てね。
		return w;
	}
	else if (_mf_) {
		dialogParam.modal = false;
		dialogParam.modeless = true;

		if (opt_mode)
			options = OptionConverter_mm(options);

		options = setOptions_mm(dialogParam,options);

		var dependent = "dependent=yes";
		if (options.length > 0) dependent+=",";
		options = dependent + options;
		var w = window.open(url,dialogParam.name,options);
		window[dialogParam.name+"_arguments"] = dialogParam;
		w.returnValue = null;
		return w;
	}
	else {
		dialogParam.modal = false;
		dialogParam.modeless = false;

		if (opt_mode)
			options = OptionConverter_mm(options);

		options = setOptions_mm(dialogParam,options);

		var w = window.open(url,dialogParam.name,options);
		window[dialogParam.name+"_arguments"] = dialogParam;
		w.returnValue = null;
		return w;
	}
}

//------------------------------------------------------------------------------
//IE のオプションへ変換するテーブル
//------------------------------------------------------------------------------
//IE の他のオプションあれば適宜追加してください。但し、双方互換性のある
//オプションじゃないと意味がありません。
var opt_mm_to_ie = {
	"width"			:		"dialogWidth",
	"height"		:		"dialogHeight",
	"top"			:		"dialogTop",
	"left"			:		"dialogLeft",
	"status"		:		"status",
	"resizable"		:		"resizable",
	"scrollbars"	:		"scroll"
};

var opt_ie_to_mm = {
//	IE options			|		Moz/IE/FF/OP and other window.open() options
	"dialogWidth"		:		"width",
	"dialogHeight"		:		"height",
	"dialogTop"			:		"top",
	"dialogLeft"		:		"left",
	"status"			:		"status",
	"resizable"			:		"resizable",
	"scroll"			:		"scrollbars"
};
//------------------------------------------------------------------------------
// make options lists
//------------------------------------------------------------------------------
var setOptions_ie = function(prm, opts) {
	opts = opts.replace(/ /g,"");
	var op1 = opts.split(";");
	prm.__init = [];
	prm.__stat = [];
	for (var i=0;i < op1.length;i++) {
		var op2 = op1[i].split(":");
		prm.__init[op2[0]] = op2[1];
		prm.__stat[op2[0]] = op2[1];
	}
	if (!prm.__stat["dialogWidth"]) {
		prm.__init["dialogWidth"] = prm.__stat["dialogWidth"] = 640 + "px";
		op1.push("dialogWidth:640px");
	}
	if (!prm.__stat["dialogHeight"]) {
		prm.__init["dialogHeight"] = prm.__stat["dialogHeight"] = 480 + "px";
		op1.push("dialogHeight:480px");
	}
	if (!prm.__stat["dialogTop"]) {
		var top = (screen.height - parseInt(prm.__stat["dialogHeight"]))/2;
		prm.__init["dialogTop"] = prm.__stat["dialogTop"] = top + "px";
		op1.push("dialogTop:"+top+"px");
	}
	if (!prm.__stat["dialogLeft"]) {
		var left = (screen.width - parseInt(prm.__stat["dialogWidth"]))/2;
		prm.__init["dialogLeft"] = prm.__stat["dialogLeft"] = left + "px";
		op1.push("dialogLeft:"+left+"px");
	}
	
	return op1.join(";");
}
var setOptions_mm = function(prm, opts) {
	opts = opts.replace(/ /g,"");
	var op1 = opts.split(",");
	prm.__init = [];
	prm.__stat = [];
	for (var i=0;i < op1.length;i++) {
		var op2 = op1[i].split("=");
		prm.__init[opt_mm_to_ie[op2[0]]] = op2[1];
		prm.__stat[opt_mm_to_ie[op2[0]]] = op2[1];
	}
	if (!prm.__stat["dialogWidth"]) {
		prm.__init["dialogWidth"] = prm.__stat["dialogWidth"] = 640 + "px";
		op1.push("width=640px");
	}
	if (!prm.__stat["dialogHeight"]) {
		prm.__init["dialogHeight"] = prm.__stat["dialogHeight"] = 480 + "px";
		op1.push("height=480px");
	}
	if (!prm.__stat["dialogTop"]) {
		var top = (screen.height - parseInt(prm.__stat["dialogHeight"]))/2;
		prm.__init["dialogTop"] = prm.__stat["dialogTop"] = top + "px";
		op1.push("top="+top+"px");
	}
	if (!prm.__stat["dialogLeft"]) {
		var left = (screen.width - parseInt(prm.__stat["dialogWidth"]))/2;
		prm.__init["dialogLeft"] = prm.__stat["dialogLeft"] = left + "px";
		op1.push("left="+left+"px");
	}
	return op1.join(",");
}
//------------------------------------------------------------------------------
// option converter
//------------------------------------------------------------------------------
var OptionConverter = function(op, opts, dlm1, equ, dlm2) {
	var ar = op.split(dlm1);
	var ah = [];
	var an = [];
	for (var i=0;i < ar.length;i++) {
		var ss = ar[i].split(equ);
		ss[0] = ss[0].replace(/ /g,"");
		ss[1] = ss[1].replace(/ /g,"");
		ah[ss[0]] = ss[1];
	}
	for (var key in opts) {
		if (ah[key] != null) {
			var tan = key.match(/(width|height|top|left)/i) != null;
			var elm = ah[key];
			if (tan && elm.match(/^[+\-]*\d+$/)) {
				elm += "px";
			}
			an.push(opts[key]+":"+elm);
		}
	}
	op = an.join(dlm2);
	return op;
}
//window.open() 系オプションから IE 風オプションへ変換
var OptionConverter_ie = function(op) {
	return OptionConverter(op,opt_mm_to_ie, ",", "=", ";");
}
//IE 風オプションから、window.open() 系オプションへ変換
var OptionConverter_mm = function(op) {
	return OptionConverter(op, opt_ie_to_mm, ";", ":", ",");
}
//------------------------------------------------------------------------------
// Initialize
//------------------------------------------------------------------------------
//window.moveTo/moveBy のラッパー
InitMoveTo();
InitMoveBy();
//window.resizeTo/resizeBy のラッパー
InitResizeTo();
InitResizeBy();

if (_op_) {
	if (window.opener[window.name+"_arguments"] != null) {
		//for NN,Moz,FF,OP and another dom browsers
		window.dialogArguments = window.opener[window.name+"_arguments"];
		InitExpandUtilities(window.dialogArguments);
	}
}
else {
	//for IE
	InitExpandUtilities(window.dialogArguments);
}
//------------------------------------------------------------------------------
// End //2005/10/07(Fri) - 2005/10/22(Sat) -
//------------------------------------------------------------------------------
