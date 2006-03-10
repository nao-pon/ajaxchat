///////////////////////////////////////////////////////////////////////////////
//
// IE �� Moz/FF �̃��[�h���X�_�C�A���O�̃I�[�v���E�l�̎󂯓n���E�߂�l�̎Q��
// ���@�𓝈ꂷ��C���^�[�t�F�[�X
// ���[�h���X�E���[�_���_�C�A���O���ʔ�
//
// �R�s�y�œ\��t����HTML�^�O�F
//<script src="mm_dialog.js" type="text/javascript" charset="shift_jis">
//</script>
//
// ����C���^�[�t�F�[�X�i��{�I��IE�ɕ키�j:
//  ��showModelessDialog(url,param,options)
//  ��showModalDialog(url,param,options)
//  ------------------+-------------+-------------------------------------------
//    parameter name  |  type       | usage
//  ------------------+-------------+-------------------------------------------
//       url          | "string"    | url ���w�肷��
//       param        | "object"    | �K�� DialogParam() �I�u�W�F�N�g���w�肷��
//       options      | "string"    | window.open() �̎w��Ɠ������̂��w�肷��
//                    |             | IE,Moz,FF,OP ���u���E�U�ɂ��I�v�V�����w��
//                    |             | ���@�̈Ⴂ��S�ċz�����܂��B
//  ------------------+-------------+-------------------------------------------
//  ��DialogParam(window_name)
//  ------------------+-------------+-------------------------------------------
//    parameter name  |  type       | usage
//  ------------------+-------------+-------------------------------------------
//       window_name  | "string"    | �_�C�A���O�E�B���h�E�ɕt����ŗL�̖��O��
//                    |             | �w�肷��B���[�h���X�_�C�A���O�̂Ƃ��̂�
//                    |             | window.xxxDialog.xxxx.xxxx �����Ń_�C�A��
//                    |             | �O���Q�Ƃł���悤�ɂ���B
//       modal        | boolean     | modal=true,modeless=false ��ݒ肷��
//       modeless     | boolean     | modal=false,modeless=true ��ݒ肷��
//                    |             | modal=false,modeless=false �� ChildWindow
////////////////////////////////////////////////////////////////////////////////
// Dialog Style
//  IE: window.dialogArguments="object"
//  MZ: window.opener="object"
//  FF: window.opener="object"
//
// Window Style
//  IE: child Window �̏ꍇ�Fwindow.opener="object",dialogArguments="undefined"
//  MZ: ����
//  FF: ����
////////////////////////////////////////////////////////////////////////////////
//z-index ���L�[�v���郁�\�b�h�Ǝw��I�v�V�����ꗗ
//            method          |o|      option      | usage
//  --------------------------+-+------------------+------------------------
//     showModalDialog        |i|        -         | ���\�b�h���̂̒ʂ�
//     showModelessDialog     |i|        -         | �@�@�@�@�V
//     window.open            |m|     modal=yes    | ��O�����Ɏw��Ń��[�_��
//     window.open            |m|   dependent=yes  | ��O�����Ɏw��Ń��[�h���X
//  �������_�ł́Awindow.open("","","modal=yes"); �̓o�O�ɂ��A"dependent=yes"
//    �Ɠ����B
//
////////////////////////////////////////////////////////////////////////////////
var _op_ = !!window.opener; //�q���ŋN�����ꂽ
var _ope_ = !!window.opera; //Opera �Ȃ� true
var _ie_ = !!window.dialogArguments; //IE �œ����Ă��邩(showModal ���������Ă���j
var _md_ = !!window.showModelessDialog; //showModal ���������Ă���
var _mf_ = navigator.userAgent.match(/(gecko|firefox)/i) != null; //Moz/Firefox

////////////////////////////////////////////////////////////////////////////////
//
// Public Methods
//
////////////////////////////////////////////////////////////////////////////////
// ���̃��W���[���̌��J���\�b�h
function DialogParam(window_name) {
	this["name"] = window_name;

	//�N�����ɍĐݒ肳���
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
	//false=window.open() �I�v�V������ IE �n�I�v�V���� �֕ϊ�
	//true =showModalDialog() �I�v�V������ window.open() �n�I�v�V�����֕ϊ��i�f�t�H���g�j

function useMM() { opt_mode = false;}
function useIE() { opt_mode = true; }

////////////////////////////////////////////////////////////////////////////////
//
// showModalDialog and showModelessDialog �́i�āj��`
//
////////////////////////////////////////////////////////////////////////////////
//IE �̏ꍇ�F������ showModal/Modeless ���I�[�o�[���C�h����
//MZ �̏ꍇ�F�V�K�� showModal/Modeless ���쐬����
window.showModalDialog = function(dlg) { //���[�_���_�C�A���O
	return function(url,obj,prm) {
		//IE ���� ��l�p�����[�^ dlg ���g��
		return OpenModalDialog(url,obj,prm,dlg);
	}
}(window.showModalDialog);

window.showModelessDialog = function(dlg) { //���[�h���X�_�C�A���O
	return function(url,obj,prm) {
		//IE ���� ��l�p�����[�^ dlg ���g��
		return OpenModelessDialog(url,obj,prm,dlg);
	}
}(window.showModelessDialog);

////////////////////////////////////////////////////////////////////////////////
//
// Private Methods
//
////////////////////////////////////////////////////////////////////////////////
//�i��Έړ��j
//IE �� ���[�h���X�_�C�A���O�͒ʏ� moveTo �ł͈ړ��ł��܂���B
//����� moveTo �ł��ړ��ł���悤�ɂ��܂��B
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
//�i���Έړ��j
//�����
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
//���T�C�Y
//�i��΁j
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
//���T�C�Y
//�i���΁j
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
//���l��"px" �t��������ɕϊ�����
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
// �g�����[�e�B���e�B
// �ړ��n�F
//		moveCenter = �e��ʂ̒����Ɉړ�
//		moveLeftUpper = �e��ʂ̃N���C�A���g������Ɉړ��B
//		moveRightUpper = �e��ʂ̃N���C�A���g���E��Ɉړ��B
//		moveLeftLower = �e��ʂ̃N���C�A���g�������Ɉړ��B
//		moveRightLower = �e��ʂ̃N���C�A���g���E���Ɉړ��B
//		formationCascade = �e��ʂ̃N���C�A���g���ŃJ�X�P�[�h�\��
//							�i�E�������ɍ�����W�� 20,20 �����炵�ďd�˂�j
//		formationTileLU = �e��ʂ̃N���C�A���g���Ń^�C���\��
//							�i�����Ƀ��T�C�Y���ďォ�牺�֕~���l�߂�j
//		formationTileLR = �e��ʂ̃N���C�A���g���Ń^�C���\��
//							�i�c���Ƀ��T�C�Y���č�����E�ɕ~���l�߂�j
//		formationTile = �e��ʂ̃N���C�A���g���Ń^�C���\��
//							�i�c�������T�C�Y���āA�����E,�と�������֕~���l�߂�j
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
		//�R�����g�Ǝ������Ⴄ�E�E�E�E�܂��������B
	}
	arg.moveLeftUpper = function() {
		alert("moveRightUpper\n�i�������ł��j");
	}
	arg.moveRightUpper = function() {
		alert("moveRightUpper\n�i�������ł��j");
	}
	arg.moveLeftLower = function() {
		alert("moveLeftLower\n�i�������ł��j");
	}
	arg.moveRightLower = function() {
		alert("moveRightLower\n�i�������ł��j");
	}
	arg.formationCascade = function() {
		alert("formationCascade\n�i�������ł��j");
	}
	arg.formationTileUL = function() {
		alert("formationTileUL\n�i�������ł��j");
	}
	arg.formationTileLR = function() {
		alert("formationTileLR\n�i�������ł��j");
	}
}


//------------------------------------------------------------------------------
// ���[�_���_�C�A���O���I�[�v������
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
		//w.returnValue = null;//�߂�l�� returnValue �����ĂˁB
		return w;
	}
	else if (_mf_) {
		dialogParam.modal = false;
		dialogParam.modeless = true;

		if (opt_mode)
			options = OptionConverter_mm(options);

		options = setOptions_mm(dialogParam,options);

		var modal = "modal=yes"; //�o�O�ɕt���A���[�h���X�Ɠ�����������Ă��܂�
		if (options.length > 0) modal+=",";
		options = modal + options;
		var w = window.open(url,dialogParam.name,options);
		//MZ/FF �n�̃��[�_���_�C�A���O�̓o�O���Ă��܂��B
		//���[�_���Ȃ̂ɓ����̓��[�h���X�ł��B
		//�Ȃ̂� IE �Ƃ͌݊��ɂȂ�܂���B���ӁI
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
// ���[�h���X�_�C�A���O���I�[�v������
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
		w.returnValue = null; //�߂�l�� returnValue �����ĂˁB
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
//IE �̃I�v�V�����֕ϊ�����e�[�u��
//------------------------------------------------------------------------------
//IE �̑��̃I�v�V��������ΓK�X�ǉ����Ă��������B�A���A�o���݊����̂���
//�I�v�V��������Ȃ��ƈӖ�������܂���B
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
//window.open() �n�I�v�V�������� IE ���I�v�V�����֕ϊ�
var OptionConverter_ie = function(op) {
	return OptionConverter(op,opt_mm_to_ie, ",", "=", ";");
}
//IE ���I�v�V��������Awindow.open() �n�I�v�V�����֕ϊ�
var OptionConverter_mm = function(op) {
	return OptionConverter(op, opt_ie_to_mm, ";", ":", ",");
}
//------------------------------------------------------------------------------
// Initialize
//------------------------------------------------------------------------------
//window.moveTo/moveBy �̃��b�p�[
InitMoveTo();
InitMoveBy();
//window.resizeTo/resizeBy �̃��b�p�[
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
