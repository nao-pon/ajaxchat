// AjaxChat - ajaxchat.js by XOOPSマニア(nao-pon)
// XOOPSマニア: http://hypweb.net/xoops/
//
// Based on http://la.ma.la/blog/diary_200507290022.htm
// by 最速インターフェース研究会

var version = 2.31;

// 設定値用変数
var refresh0 = 60000;     //ログチェック間隔(入室前) [ms]
var refresh = 2000;       //ログチェック間隔(入室後) [ms]
var stayref = 60000;      //在室確認間隔 [ms]
var read = 5000;          //最初に読み込むログのサイズ [bite]
var noname = "名無し";    //名前を入力していない人の仮名
var need_refrash = 50000  //リフレッシュを促すログ文字数 [character]
var max_post_size = 1000  //発言一回あたりの最大文字数 [character]

// 変数の初期化
var QueryString = new Array();
CreateQuetyStringList();
var stays = new Array();
var size = 0;
var mod = 0;
var insert = "";
var logid = parseInt(QueryString["id"]);
var logfile = "./log/log_"+logid+".utxt";
var u_noname = noname;
var active_elm = null;
var ck;
var name = "";
var color = "";
var saving = false;
var myip = "";
var tip = "";
var tname = "";
var last_time = 0;
var last_time_talk = 0;
var timerID = new Array();
var flg = new Array();
var name_html = "";
var timeoffset = 0;
var lasttime = 0;
var lastref = 0;
var logtop = 0;
var logcache = "";
var logstart;
var logend;
var bef_name = "";
var getcounter = 0;
var msg = new Array;
var tag = new Array;
var sound = new Array();
var filter = new Array();
var popup_w;
var staypos = QueryString["staypos"];
staypos = (!staypos || staypos == "t")? "t" : "r";
flg['popup'] = (!parseInt(QueryString["popup"]))? 0 : 1;
flg['stay'] = (!parseInt(QueryString["stay"]))? 0 : 1;
flg['show_welcome'] = false;

// メッセージ
msg['welcome'] = '<ul><li>このログ表示窓は、入室前は <b>'+(refresh0/1000)+'</b> 秒ごと、入室後は <b>'+(refresh/1000)+'</b> 秒ごとに更新されます。</li><li>特定の人にだけ<span style="color:red;"> ささやく </span>には、名前をクリックしてください。</li><li>特定の人を無視リストに追加・解除するには、名前をダブルクリックしてください。</li><li>名前欄にはトリップが使えます。[ <span style="color:blue;">名前</span><span style="color:red;">#</span><span style="color:green;">内緒の言葉</span> ] とすると成りすましを防ぐことができます。</li><li>不特定多数が使うパソコンからアクセスしている場合は、<a href="javascript:setting(\'open\')" title="詳細設定">詳細設定<img src="./imgs/setting.png" width="16" height="16" border="0"></a>で Cookie「保存する」のチェックを外してください。</li></ul>';
msg['howto'] = '入室するには、名前欄に記名してこの入力エリアをクリックしてください。';
msg['noopera'] = '残念ながら ブラウザ Opera では利用できません。';
msg['stay_init'] = "閲覧者: 初回は"+(stayref/1000/2)+"秒後に情報取得します。";
msg['stay_refresh'] = "今すぐ取得";
msg['pastfor'] = 'この間に$1時間ほど経ちました・・・';
msg['ininfo'] = '$1さんが入りました。';
msg['outinfo'] = '$1さんが退席しました。';
msg['passinfo'] = '$1さんが通り過ぎました。';
msg['sysinfo'] = 'システム通知[$1]';
msg['needupdate'] = '<span style="color:red;">チャットプログラムが更新されています。<br><a href="javascript:window_reload()">このリンクをクリックしてバージョンアップしてください。</a></span>';
msg['nomail'] = '[ ログ表示ではメールアドレスは表示しません ]';
msg['morelog'] = 'さらに過去の発言を表示';
msg['whisper'] = 'ささやき';
msg['clearwhisper'] = msg['whisper']+': チャット画面の名前をクリック。ここをクリックでクリア';
msg['click2whisper'] = "クリック: "+msg['whisper']+"\nダブルクリック: 無視リスト";
msg['toall'] = ' 全員';
msg['to'] = '<img src="./imgs/whisper.png" height="16" width="17" alt="'+msg['clearwhisper']+'" title="'+msg['clearwhisper']+'">&nbsp;$1へ';
msg['novoice'] = '最終発言: 発言はありません。';
msg['bef_sec'] = '秒前';
msg['bef_min'] = '分前';
msg['hour'] = '時間';
msg['last_voice'] = '最終発言: ';
msg['refresh'] = 'リフレッシュ';
msg['refresh_msg'] = 'ログ表示が増えてブラウザの動作が重くなったらクリックしてください。';
msg['com'] = '通信中';
msg['wait'] = '待機中';
msg['com_status'] = '通信状態';
msg['nomember'] = '入室 0人,';
msg['menber'] = '閲覧 $1人';
msg['rom'] = ' 見物 $1人';
msg['in_rom'] = 'IN $1 : ROM $2';
msg['leave'] = '$1 退席';
msg['error_post'] = 'データの送信に失敗しました。';
msg['error_set'] = '挿入する位置を指定してください。';
msg['close'] = '閉じる';
msg['popup'] = '別窓';
msg['popuping'] = '<center>別窓にてポップアップ中です。$1で元に戻ります。</center>';
msg['popup_msg'] = 'チャットウィンドウのみをポップアップします。';
msg['noref'] = '<p>ノートンなどのセキュリティソフトでリファラ(参照元)情報を送信しないように設定されているので利用できません。<br>以下のリンクを参考に参照元情報を送信するように設定してください。</p><p><ul><li><a href="http://service1.symantec.com/SUPPORT/INTER/nisjapanesekb.nsf/jp_docid/20031024163125947?Open&src=&docid=20021020160209947&nsf=support%5CINTER%5Cnisjapanesekb.nsf&view=jp_docid&dtype=&prod=&ver=&osv=&osv_lvl=" target="_blank">Norton Internet Security 2004 / Norton Personal Firewall 2004 の場合</a></li><li><a href="http://service1.symantec.com/SUPPORT/INTER/nisjapanesekb.nsf/jp_docid/20021020160209947?Open&src=&docid=20031024163125947&nsf=support%5CINTER%5Cnisjapanesekb.nsf&view=jp_docid&dtype=&prod=&ver=&osv=&osv_lvl=" target="_blank">Norton Internet Security 2003/Norton Personal Firewall 2003 の場合</a></li><li><a href="http://service1.symantec.com/SUPPORT/INTER/nisjapanesekb.nsf/jp_docid/20020617223337947?Open&src=&docid=20021020160209947&nsf=support%5CINTER%5Cnisjapanesekb.nsf&view=jp_docid&dtype=&prod=&ver=&osv=&osv_lvl=" target="_blank">Norton Internet Security 2001、2002 / Norton Personal Firewall 2001、2002 の場合</a></li></ul></p>';
msg['setting'] = '詳細設定';
msg['last_init'] = '最終発言: ログを読み込んでいます...';
msg['click2face'] = 'クリックでフェイスマークを選択して挿入';
msg['click2color'] = 'クリックで文字色設定';
msg['color'] = '文字色';
msg['talk'] = '発言';
msg['setcolor'] = 'この色にセット';
msg['autotalk'] = '自動発言';
msg['sending'] = '送信しています.....';
msg['space'] = 'スペース';
msg['sound'] = 'サウンド';
msg['in'] = '入室';
msg['out'] = '退席';
msg['save'] = '保存する';
msg['info'] = '[お知らせ]';
msg['info_sign'] = 'お知らせ表示';
msg['elapsed_time'] = '経過時間';
msg['colorclear'] = '色指定を解除';
msg['addfilter'] = '$1を無視リストに追加して発言を表示しないようにしますか？';
msg['delfilter'] = '$1を無視リストから外して発言を表示するようにしますか？';
msg['stay2top'] = '閲覧者情報を上へ表示';
msg['stay2right'] = '閲覧者情報を右サイドへ表示';
msg['wish_refrash'] = '_PAGE_TITLE_: チャット [お知らせ]\n表示しているログが増えてきました。\nブラウザが不安定になる前にリフレッシュしますか？';
msg['to_large_post'] = '発言の文字数が多過ぎます。\n最大文字数は'+max_post_size+'文字です。\n\n発言内容を削って発言しますか？';
msg['kick_req'] = '[ キック申請 ]\n$1 のキック(発言禁止措置)を申請しますか？\nキック申請が一定数に達すると、その人は発言禁止になります。\n::注意:: 悪戯にキック申請を行うとあなた自身が発言禁止になりますので、乱用はしないでください。';
msg['kick_done'] = '$1 のキック申請が完了しました。'
msg['kick'] = 'キック申請'

// 効果音
sound['in'] = "./sounds/login.swf";
sound['out'] = "./sounds/logout.swf";
sound['newline'] = "./sounds/newline.swf";
sound['toyou'] = "./sounds/toyou.swf";

// HTMLタグ
// フェイスマーク
tag['face'] =
'<span style="cursor:pointer;">'+
'<img src="imgs/smile.gif" width="15" height="15" border="0" title=":)" alt=":)" onClick="javascript:ins_face(\':)\'); return false;">'+
'<img src="imgs/bigsmile.gif" width="15" height="15" border="0" title=":D" alt=":D" onClick="javascript:ins_face(\':D\'); return false;">'+
'<img src="imgs/huh.gif" width="15" height="15" border="0" title=":p" alt=":p" onClick="javascript:ins_face(\':p\'); return false;">'+
'<img src="imgs/oh.gif" width="15" height="15" border="0" title="XD" alt="XD" onClick="javascript:ins_face(\'XD\'); return false;">'+
'<img src="imgs/wink.gif" width="15" height="15" border="0" title=";)" alt=";)" onClick="javascript:ins_face(\';)\'); return false;">'+
'<img src="imgs/sad.gif" width="15" height="15" border="0" title=";(" alt=";(" onClick="javascript:ins_face(\';(\'); return false;">'+
'<img src="imgs/heart.gif" width="15" height="15" border="0" title="&amp;heart;" alt="&amp;heart;" onClick="javascript:ins_face(\'&amp;heart;\'); return false;">'+
' <img src="imgs/close.gif" width="14" height="14" border="0" title="'+msg['close']+'" alt="'+msg['close']+'" onClick="javascript:ins_face(\'X\'); return false;">'+
'</span>';

// その他
tag['refresh'] = " <a href=\"javascript:log_refresh();\" title=\""+msg['refresh']+"\n"+msg['refresh_msg']+"\"><img src=\"./imgs/refresh.png\" width=\"16\" height=\"16\" border=\"0\" alt=\""+msg['refresh']+":"+msg['refresh_msg']+"\"></a>";
tag['popup'] = "";
if (!flg['popup'])
{
	tag['popup'] = " <a href=\"javascript:popup();\" title=\""+msg['popup']+"\n"+msg['popup_msg']+"\"><img src=\"./imgs/popup.png\" width=\"16\" height=\"16\" border=\"0\" alt=\""+msg['popup']+":"+msg['popup_msg']+"\"></a>";
}
tag['info'] = "<img src=\"./imgs/info.png\" width=\"16\" height=\"16\" border=\"0\" alt=\"Ver "+version+"\" onclick=\"showinfo('open');\" style=\"cursor:pointer;\">&nbsp;";

//form
tag['form'] = 
'<span id="name">'+
'	お名前:<input type="text" id="n" name="n" maxlength="16" size="14" onfocus="active_elm=this;" disabled>'+
'</span>'+
'<span style="position:relative;cursor:pointer;">'+
'	<img src="imgs/smile.gif" width="15" height="15" border="0" onclick="ins_face();" title="'+msg['click2face']+'" alt="'+msg['click2face']+'">'+
'	<span id="face" class="box"></span>'+
'</span>'+
'<span id="colorset" onclick="set_color();" title="'+msg['click2color']+'">'+msg['color']+'</span> <span id="tip" onclick="set_tip();" title="'+msg['clearwhisper']+'"></span> <img src="./imgs/connect.png" id="status" width="16" height="16" alt="'+msg['com_status']+'" title="'+msg['com_status']+'"> <span id="setting_btn"></span><br>'+
'<table style="width:100%;border:none;">'+
'	<tr>'+
'		<td style="width:100%;">'+
'			<textarea id="c" name="c" cols="50" rows="2" style="width:100%;height:3em;" onmouseup="check();" onkeyup="check();" onkeypress="key_press(event);" onfocus="c_onfocus(this);" disabled></textarea>'+
'		</td>'+
'		<td>'+
'			<input id="btn_send" type="button" value="'+msg['talk']+'" style="height:3em;" onclick="post();" disabled>'+
'		</td>'+
'	</tr>'+
'</table>';

//color
tag['color'] = '<img src="imgs/color.png" border="0" width="303" height="67" usemap="#spmap" title="'+msg['setcolor']+'" alt="'+msg['setcolor']+'">';

tag['infobox'] =
'<div style="text-align:left;"><img src="imgs/close.gif" width="14" height="14" border="0" onclick="showinfo(\'close\');" title="'+msg['close']+'" alt="'+msg['close']+'" style="cursor: pointer;"></div>'+
'<div id="infobody"></div>';

tag['setting']=
'<div style="text-align:right;"><img src="imgs/close.gif" width="14" height="14" border="0" onclick="setting(\'close\');" title="'+msg['close']+'" alt="'+msg['close']+'" style="cursor: pointer;"></div>'+
'<fieldset>'+
'<legend>'+msg['autotalk']+'</legend>'+
'<input type="checkbox" id="ent" value="on" onclick="c_focus();" checked><label for="ent">Enter</label>'+
'<input type="checkbox" id="maru" value="on" onclick="c_focus();"><label for="maru">。</label>'+
'<input type="checkbox" id="ten" value="on" onclick="c_focus();"><label for="ten">、</label>'+
'<input type="checkbox" id="sp" value="on" onclick="c_focus();"><label for="sp">'+msg['space']+'</label>'+
'</fieldset> '+
'<fieldset>'+
'<legend>'+msg['sound']+'</legend>'+
'<input type="checkbox" id="sound_in" value="on" checked><label for="sound_in">'+msg['in']+'</label>'+
'<input type="checkbox" id="sound_out" value="on" checked><label for="sound_out">'+msg['out']+'</label>'+
'<input type="checkbox" id="sound_line" value="on" checked><label for="sound_line">'+msg['talk']+'</label>'+
'<input type="checkbox" id="sound_toyou" value="on" checked><label for="sound_toyou">'+msg['whisper']+'</label>'+
'</fieldset> '+
'<fieldset>'+
'<legend>'+msg['info_sign']+'</legend>'+
'<input type="checkbox" id="info_in" value="on" checked><label for="info_in">'+msg['in']+'</label>'+
'<input type="checkbox" id="info_out" value="on" checked><label for="info_out">'+msg['out']+'</label>'+
'<input type="checkbox" id="info_time" value="on" checked><label for="info_time">'+msg['elapsed_time']+'</label>'+
'</fieldset> '+
'<fieldset>'+
'<legend>Cookie</legend>'+
'<input type="checkbox" id="cookie" value="on" onclick="c_focus();" checked><label for="cookie">'+msg['save']+'</label>'+
'</fieldset>';

tag['stay2right'] = '<div style="float:right;width:14px;height:14px;border:none;" title="'+msg['stay2right']+'"><a href="javascript:stay_pos(\'r\')"><img src="./imgs/to_right.png" width="14" height="14" border="0"></a></div>';
tag['stay2top'] = '<div style="float:right;width:14px;height:14px;border:none;" title="'+msg['stay2top']+'"><a href="javascript:stay_pos(\'t\')"><img src="./imgs/to_top.png" width="14" height="14" border="0"></a></div>';
// spmap
tag['spmap'] = 
'<area shape="rect" coords="1,1,7,10" href="javascript:set_color(\'#00ff00\')">'+
'<area shape="rect" coords="9,1,15,10" href="javascript:set_color(\'#00ff33\')">'+
'<area shape="rect" coords="17,1,23,10" href="javascript:set_color(\'#00ff66\')">'+
'<area shape="rect" coords="25,1,31,10" href="javascript:set_color(\'#00ff99\')">'+
'<area shape="rect" coords="33,1,39,10" href="javascript:set_color(\'#00ffcc\')">'+
'<area shape="rect" coords="41,1,47,10" href="javascript:set_color(\'#00ffff\')">'+
'<area shape="rect" coords="49,1,55,10" href="javascript:set_color(\'#33ff00\')">'+
'<area shape="rect" coords="57,1,63,10" href="javascript:set_color(\'#33ff33\')">'+
'<area shape="rect" coords="65,1,71,10" href="javascript:set_color(\'#33ff66\')">'+
'<area shape="rect" coords="73,1,79,10" href="javascript:set_color(\'#33ff99\')">'+
'<area shape="rect" coords="81,1,87,10" href="javascript:set_color(\'#33ffcc\')">'+
'<area shape="rect" coords="89,1,95,10" href="javascript:set_color(\'#33ffff\')">'+
'<area shape="rect" coords="97,1,103,10" href="javascript:set_color(\'#66ff00\')">'+
'<area shape="rect" coords="105,1,111,10" href="javascript:set_color(\'#66ff33\')">'+
'<area shape="rect" coords="113,1,119,10" href="javascript:set_color(\'#66ff66\')">'+
'<area shape="rect" coords="121,1,127,10" href="javascript:set_color(\'#66ff99\')">'+
'<area shape="rect" coords="129,1,135,10" href="javascript:set_color(\'#66ffcc\')">'+
'<area shape="rect" coords="137,1,143,10" href="javascript:set_color(\'#66ffff\')">'+
'<area shape="rect" coords="145,1,151,10" href="javascript:set_color(\'#99ff00\')">'+
'<area shape="rect" coords="153,1,159,10" href="javascript:set_color(\'#99ff33\')">'+
'<area shape="rect" coords="161,1,167,10" href="javascript:set_color(\'#99ff66\')">'+
'<area shape="rect" coords="169,1,175,10" href="javascript:set_color(\'#99ff99\')">'+
'<area shape="rect" coords="177,1,183,10" href="javascript:set_color(\'#99ffcc\')">'+
'<area shape="rect" coords="185,1,191,10" href="javascript:set_color(\'#99ffff\')">'+
'<area shape="rect" coords="193,1,199,10" href="javascript:set_color(\'#ccff00\')">'+
'<area shape="rect" coords="201,1,207,10" href="javascript:set_color(\'#ccff33\')">'+
'<area shape="rect" coords="209,1,215,10" href="javascript:set_color(\'#ccff66\')">'+
'<area shape="rect" coords="217,1,223,10" href="javascript:set_color(\'#ccff99\')">'+
'<area shape="rect" coords="225,1,231,10" href="javascript:set_color(\'#ccffcc\')">'+
'<area shape="rect" coords="233,1,239,10" href="javascript:set_color(\'#ccffff\')">'+
'<area shape="rect" coords="241,1,247,10" href="javascript:set_color(\'#ffff00\')">'+
'<area shape="rect" coords="249,1,255,10" href="javascript:set_color(\'#ffff33\')">'+
'<area shape="rect" coords="257,1,263,10" href="javascript:set_color(\'#ffff66\')">'+
'<area shape="rect" coords="265,1,271,10" href="javascript:set_color(\'#ffff99\')">'+
'<area shape="rect" coords="273,1,279,10" href="javascript:set_color(\'#ffffcc\')">'+
'<area shape="rect" coords="281,1,287,10" href="javascript:set_color(\'#ffffff\')">'+

'<area shape="rect" coords="1,12,7,21" href="javascript:set_color(\'#00cc00\')">'+
'<area shape="rect" coords="9,12,15,21" href="javascript:set_color(\'#00cc33\')">'+
'<area shape="rect" coords="17,12,23,21" href="javascript:set_color(\'#00cc66\')">'+
'<area shape="rect" coords="25,12,31,21" href="javascript:set_color(\'#00cc99\')">'+
'<area shape="rect" coords="33,12,39,21" href="javascript:set_color(\'#00cccc\')">'+
'<area shape="rect" coords="41,12,47,21" href="javascript:set_color(\'#00ccff\')">'+
'<area shape="rect" coords="49,12,55,21" href="javascript:set_color(\'#33cc00\')">'+
'<area shape="rect" coords="57,12,63,21" href="javascript:set_color(\'#33cc33\')">'+
'<area shape="rect" coords="65,12,71,21" href="javascript:set_color(\'#33cc66\')">'+
'<area shape="rect" coords="73,12,79,21" href="javascript:set_color(\'#33cc99\')">'+
'<area shape="rect" coords="81,12,87,21" href="javascript:set_color(\'#33cccc\')">'+
'<area shape="rect" coords="89,12,95,21" href="javascript:set_color(\'#33ccff\')">'+
'<area shape="rect" coords="97,12,103,21" href="javascript:set_color(\'#66cc00\')">'+
'<area shape="rect" coords="105,12,111,21" href="javascript:set_color(\'#66cc33\')">'+
'<area shape="rect" coords="113,12,119,21" href="javascript:set_color(\'#66cc66\')">'+
'<area shape="rect" coords="121,12,127,21" href="javascript:set_color(\'#66cc99\')">'+
'<area shape="rect" coords="129,12,135,21" href="javascript:set_color(\'#66cccc\')">'+
'<area shape="rect" coords="137,12,143,21" href="javascript:set_color(\'#66ccff\')">'+
'<area shape="rect" coords="145,12,151,21" href="javascript:set_color(\'#99cc00\')">'+
'<area shape="rect" coords="153,12,159,21" href="javascript:set_color(\'#99cc33\')">'+
'<area shape="rect" coords="161,12,167,21" href="javascript:set_color(\'#99cc66\')">'+
'<area shape="rect" coords="169,12,175,21" href="javascript:set_color(\'#99cc99\')">'+
'<area shape="rect" coords="177,12,183,21" href="javascript:set_color(\'#99cccc\')">'+
'<area shape="rect" coords="185,12,191,21" href="javascript:set_color(\'#99ccff\')">'+
'<area shape="rect" coords="193,12,199,21" href="javascript:set_color(\'#cccc00\')">'+
'<area shape="rect" coords="201,12,207,21" href="javascript:set_color(\'#cccc33\')">'+
'<area shape="rect" coords="209,12,215,21" href="javascript:set_color(\'#cccc66\')">'+
'<area shape="rect" coords="217,12,223,21" href="javascript:set_color(\'#cccc99\')">'+
'<area shape="rect" coords="225,12,231,21" href="javascript:set_color(\'#cccccc\')">'+
'<area shape="rect" coords="233,12,239,21" href="javascript:set_color(\'#ccccff\')">'+
'<area shape="rect" coords="241,12,247,21" href="javascript:set_color(\'#ffcc00\')">'+
'<area shape="rect" coords="249,12,255,21" href="javascript:set_color(\'#ffcc33\')">'+
'<area shape="rect" coords="257,12,263,21" href="javascript:set_color(\'#ffcc66\')">'+
'<area shape="rect" coords="265,12,271,21" href="javascript:set_color(\'#ffcc99\')">'+
'<area shape="rect" coords="273,12,279,21" href="javascript:set_color(\'#ffcccc\')">'+
'<area shape="rect" coords="281,12,287,21" href="javascript:set_color(\'#ffccff\')">'+

'<area shape="rect" coords="1,23,7,32" href="javascript:set_color(\'#009900\')">'+
'<area shape="rect" coords="9,23,15,32" href="javascript:set_color(\'#009933\')">'+
'<area shape="rect" coords="17,23,23,32" href="javascript:set_color(\'#009966\')">'+
'<area shape="rect" coords="25,23,31,32" href="javascript:set_color(\'#009999\')">'+
'<area shape="rect" coords="33,23,39,32" href="javascript:set_color(\'#0099cc\')">'+
'<area shape="rect" coords="41,23,47,32" href="javascript:set_color(\'#0099ff\')">'+
'<area shape="rect" coords="49,23,55,32" href="javascript:set_color(\'#339900\')">'+
'<area shape="rect" coords="57,23,63,32" href="javascript:set_color(\'#339933\')">'+
'<area shape="rect" coords="65,23,71,32" href="javascript:set_color(\'#339966\')">'+
'<area shape="rect" coords="73,23,79,32" href="javascript:set_color(\'#339999\')">'+
'<area shape="rect" coords="81,23,87,32" href="javascript:set_color(\'#3399cc\')">'+
'<area shape="rect" coords="89,23,95,32" href="javascript:set_color(\'#3399ff\')">'+
'<area shape="rect" coords="97,23,103,32" href="javascript:set_color(\'#669900\')">'+
'<area shape="rect" coords="105,23,111,32" href="javascript:set_color(\'#669933\')">'+
'<area shape="rect" coords="113,23,119,32" href="javascript:set_color(\'#669966\')">'+
'<area shape="rect" coords="121,23,127,32" href="javascript:set_color(\'#669999\')">'+
'<area shape="rect" coords="129,23,135,32" href="javascript:set_color(\'#6699cc\')">'+
'<area shape="rect" coords="137,23,143,32" href="javascript:set_color(\'#6699ff\')">'+
'<area shape="rect" coords="145,23,151,32" href="javascript:set_color(\'#999900\')">'+
'<area shape="rect" coords="153,23,159,32" href="javascript:set_color(\'#999933\')">'+
'<area shape="rect" coords="161,23,167,32" href="javascript:set_color(\'#999966\')">'+
'<area shape="rect" coords="169,23,175,32" href="javascript:set_color(\'#999999\')">'+
'<area shape="rect" coords="177,23,183,32" href="javascript:set_color(\'#9999cc\')">'+
'<area shape="rect" coords="185,23,191,32" href="javascript:set_color(\'#9999ff\')">'+
'<area shape="rect" coords="193,23,199,32" href="javascript:set_color(\'#cc9900\')">'+
'<area shape="rect" coords="201,23,207,32" href="javascript:set_color(\'#cc9933\')">'+
'<area shape="rect" coords="209,23,215,32" href="javascript:set_color(\'#cc9966\')">'+
'<area shape="rect" coords="217,23,223,32" href="javascript:set_color(\'#cc9999\')">'+
'<area shape="rect" coords="225,23,231,32" href="javascript:set_color(\'#cc99cc\')">'+
'<area shape="rect" coords="233,23,239,32" href="javascript:set_color(\'#cc99ff\')">'+
'<area shape="rect" coords="241,23,247,32" href="javascript:set_color(\'#ff9900\')">'+
'<area shape="rect" coords="249,23,255,32" href="javascript:set_color(\'#ff9933\')">'+
'<area shape="rect" coords="257,23,263,32" href="javascript:set_color(\'#ff9966\')">'+
'<area shape="rect" coords="265,23,271,32" href="javascript:set_color(\'#ff9999\')">'+
'<area shape="rect" coords="273,23,279,32" href="javascript:set_color(\'#ff99cc\')">'+
'<area shape="rect" coords="281,23,287,32" href="javascript:set_color(\'#ff99ff\')">'+

'<area shape="rect" coords="1,34,7,43" href="javascript:set_color(\'#006600\')">'+
'<area shape="rect" coords="9,34,15,43" href="javascript:set_color(\'#006633\')">'+
'<area shape="rect" coords="17,34,23,43" href="javascript:set_color(\'#006666\')">'+
'<area shape="rect" coords="25,34,31,43" href="javascript:set_color(\'#006699\')">'+
'<area shape="rect" coords="33,34,39,43" href="javascript:set_color(\'#0066cc\')">'+
'<area shape="rect" coords="41,34,47,43" href="javascript:set_color(\'#0066ff\')">'+
'<area shape="rect" coords="49,34,55,43" href="javascript:set_color(\'#336600\')">'+
'<area shape="rect" coords="57,34,63,43" href="javascript:set_color(\'#336633\')">'+
'<area shape="rect" coords="65,34,71,43" href="javascript:set_color(\'#336666\')">'+
'<area shape="rect" coords="73,34,79,43" href="javascript:set_color(\'#336699\')">'+
'<area shape="rect" coords="81,34,87,43" href="javascript:set_color(\'#3366cc\')">'+
'<area shape="rect" coords="89,34,95,43" href="javascript:set_color(\'#3366ff\')">'+
'<area shape="rect" coords="97,34,103,43" href="javascript:set_color(\'#666600\')">'+
'<area shape="rect" coords="105,34,111,43" href="javascript:set_color(\'#666633\')">'+
'<area shape="rect" coords="113,34,119,43" href="javascript:set_color(\'#666666\')">'+
'<area shape="rect" coords="121,34,127,43" href="javascript:set_color(\'#666699\')">'+
'<area shape="rect" coords="129,34,135,43" href="javascript:set_color(\'#6666cc\')">'+
'<area shape="rect" coords="137,34,143,43" href="javascript:set_color(\'#6666ff\')">'+
'<area shape="rect" coords="145,34,151,43" href="javascript:set_color(\'#996600\')">'+
'<area shape="rect" coords="153,34,159,43" href="javascript:set_color(\'#996633\')">'+
'<area shape="rect" coords="161,34,167,43" href="javascript:set_color(\'#996666\')">'+
'<area shape="rect" coords="169,34,175,43" href="javascript:set_color(\'#996699\')">'+
'<area shape="rect" coords="177,34,183,43" href="javascript:set_color(\'#9966cc\')">'+
'<area shape="rect" coords="185,34,191,43" href="javascript:set_color(\'#9966ff\')">'+
'<area shape="rect" coords="193,34,199,43" href="javascript:set_color(\'#cc6600\')">'+
'<area shape="rect" coords="201,34,207,43" href="javascript:set_color(\'#cc6633\')">'+
'<area shape="rect" coords="209,34,215,43" href="javascript:set_color(\'#cc6666\')">'+
'<area shape="rect" coords="217,34,223,43" href="javascript:set_color(\'#cc6699\')">'+
'<area shape="rect" coords="225,34,231,43" href="javascript:set_color(\'#cc66cc\')">'+
'<area shape="rect" coords="233,34,239,43" href="javascript:set_color(\'#cc66ff\')">'+
'<area shape="rect" coords="241,34,247,43" href="javascript:set_color(\'#ff6600\')">'+
'<area shape="rect" coords="249,34,255,43" href="javascript:set_color(\'#ff6633\')">'+
'<area shape="rect" coords="257,34,263,43" href="javascript:set_color(\'#ff6666\')">'+
'<area shape="rect" coords="265,34,271,43" href="javascript:set_color(\'#ff6699\')">'+
'<area shape="rect" coords="273,34,279,43" href="javascript:set_color(\'#ff66cc\')">'+
'<area shape="rect" coords="281,34,287,43" href="javascript:set_color(\'#ff66ff\')">'+

'<area shape="rect" coords="1,45,7,54" href="javascript:set_color(\'#003300\')">'+
'<area shape="rect" coords="9,45,15,54" href="javascript:set_color(\'#003333\')">'+
'<area shape="rect" coords="17,45,23,54" href="javascript:set_color(\'#003366\')">'+
'<area shape="rect" coords="25,45,31,54" href="javascript:set_color(\'#003399\')">'+
'<area shape="rect" coords="33,45,39,54" href="javascript:set_color(\'#0033cc\')">'+
'<area shape="rect" coords="41,45,47,54" href="javascript:set_color(\'#0033ff\')">'+
'<area shape="rect" coords="49,45,55,54" href="javascript:set_color(\'#333300\')">'+
'<area shape="rect" coords="57,45,63,54" href="javascript:set_color(\'#333333\')">'+
'<area shape="rect" coords="65,45,71,54" href="javascript:set_color(\'#333366\')">'+
'<area shape="rect" coords="73,45,79,54" href="javascript:set_color(\'#333399\')">'+
'<area shape="rect" coords="81,45,87,54" href="javascript:set_color(\'#3333cc\')">'+
'<area shape="rect" coords="89,45,95,54" href="javascript:set_color(\'#3333ff\')">'+
'<area shape="rect" coords="97,45,103,54" href="javascript:set_color(\'#663300\')">'+
'<area shape="rect" coords="105,45,111,54" href="javascript:set_color(\'#663333\')">'+
'<area shape="rect" coords="113,45,119,54" href="javascript:set_color(\'#663366\')">'+
'<area shape="rect" coords="121,45,127,54" href="javascript:set_color(\'#663399\')">'+
'<area shape="rect" coords="129,45,135,54" href="javascript:set_color(\'#6633cc\')">'+
'<area shape="rect" coords="137,45,143,54" href="javascript:set_color(\'#6633ff\')">'+
'<area shape="rect" coords="145,45,151,54" href="javascript:set_color(\'#993300\')">'+
'<area shape="rect" coords="153,45,159,54" href="javascript:set_color(\'#993333\')">'+
'<area shape="rect" coords="161,45,167,54" href="javascript:set_color(\'#993366\')">'+
'<area shape="rect" coords="169,45,175,54" href="javascript:set_color(\'#993399\')">'+
'<area shape="rect" coords="177,45,183,54" href="javascript:set_color(\'#9933cc\')">'+
'<area shape="rect" coords="185,45,191,54" href="javascript:set_color(\'#9933ff\')">'+
'<area shape="rect" coords="193,45,199,54" href="javascript:set_color(\'#cc3300\')">'+
'<area shape="rect" coords="201,45,207,54" href="javascript:set_color(\'#cc3333\')">'+
'<area shape="rect" coords="209,45,215,54" href="javascript:set_color(\'#cc3366\')">'+
'<area shape="rect" coords="217,45,223,54" href="javascript:set_color(\'#cc3399\')">'+
'<area shape="rect" coords="225,45,231,54" href="javascript:set_color(\'#cc33cc\')">'+
'<area shape="rect" coords="233,45,239,54" href="javascript:set_color(\'#cc33ff\')">'+
'<area shape="rect" coords="241,45,247,54" href="javascript:set_color(\'#ff3300\')">'+
'<area shape="rect" coords="249,45,255,54" href="javascript:set_color(\'#ff3333\')">'+
'<area shape="rect" coords="257,45,263,54" href="javascript:set_color(\'#ff3366\')">'+
'<area shape="rect" coords="265,45,271,54" href="javascript:set_color(\'#ff3399\')">'+
'<area shape="rect" coords="273,45,279,54" href="javascript:set_color(\'#ff33cc\')">'+
'<area shape="rect" coords="281,45,287,54" href="javascript:set_color(\'#ff33ff\')">'+

'<area shape="rect" coords="1,56,7,65" href="javascript:set_color(\'#000000\')">'+
'<area shape="rect" coords="9,56,15,65" href="javascript:set_color(\'#000033\')">'+
'<area shape="rect" coords="17,56,23,65" href="javascript:set_color(\'#000066\')">'+
'<area shape="rect" coords="25,56,31,65" href="javascript:set_color(\'#000099\')">'+
'<area shape="rect" coords="33,56,39,65" href="javascript:set_color(\'#0000cc\')">'+
'<area shape="rect" coords="41,56,47,65" href="javascript:set_color(\'#0000ff\')">'+
'<area shape="rect" coords="49,56,55,65" href="javascript:set_color(\'#330000\')">'+
'<area shape="rect" coords="57,56,63,65" href="javascript:set_color(\'#330033\')">'+
'<area shape="rect" coords="65,56,71,65" href="javascript:set_color(\'#330066\')">'+
'<area shape="rect" coords="73,56,79,65" href="javascript:set_color(\'#330099\')">'+
'<area shape="rect" coords="81,56,87,65" href="javascript:set_color(\'#3300cc\')">'+
'<area shape="rect" coords="89,56,95,65" href="javascript:set_color(\'#3300ff\')">'+
'<area shape="rect" coords="97,56,103,65" href="javascript:set_color(\'#660000\')">'+
'<area shape="rect" coords="105,56,111,65" href="javascript:set_color(\'#660033\')">'+
'<area shape="rect" coords="113,56,119,65" href="javascript:set_color(\'#660066\')">'+
'<area shape="rect" coords="121,56,127,65" href="javascript:set_color(\'#660099\')">'+
'<area shape="rect" coords="129,56,135,65" href="javascript:set_color(\'#6600cc\')">'+
'<area shape="rect" coords="137,56,143,65" href="javascript:set_color(\'#6600ff\')">'+
'<area shape="rect" coords="145,56,151,65" href="javascript:set_color(\'#990000\')">'+
'<area shape="rect" coords="153,56,159,65" href="javascript:set_color(\'#990033\')">'+
'<area shape="rect" coords="161,56,167,65" href="javascript:set_color(\'#990066\')">'+
'<area shape="rect" coords="169,56,175,65" href="javascript:set_color(\'#990099\')">'+
'<area shape="rect" coords="177,56,183,65" href="javascript:set_color(\'#9900cc\')">'+
'<area shape="rect" coords="185,56,191,65" href="javascript:set_color(\'#9900ff\')">'+
'<area shape="rect" coords="193,56,199,65" href="javascript:set_color(\'#cc0000\')">'+
'<area shape="rect" coords="201,56,207,65" href="javascript:set_color(\'#cc0033\')">'+
'<area shape="rect" coords="209,56,215,65" href="javascript:set_color(\'#cc0066\')">'+
'<area shape="rect" coords="217,56,223,65" href="javascript:set_color(\'#cc0099\')">'+
'<area shape="rect" coords="225,56,231,65" href="javascript:set_color(\'#cc00cc\')">'+
'<area shape="rect" coords="233,56,239,65" href="javascript:set_color(\'#cc00ff\')">'+
'<area shape="rect" coords="241,56,247,65" href="javascript:set_color(\'#ff0000\')">'+
'<area shape="rect" coords="249,56,255,65" href="javascript:set_color(\'#ff0033\')">'+
'<area shape="rect" coords="257,56,263,65" href="javascript:set_color(\'#ff0066\')">'+
'<area shape="rect" coords="265,56,271,65" href="javascript:set_color(\'#ff0099\')">'+
'<area shape="rect" coords="273,56,279,65" href="javascript:set_color(\'#ff00cc\')">'+
'<area shape="rect" coords="281,56,287,65" href="javascript:set_color(\'#ff00ff\')">'+
'<area shape="rect" coords="281,56,287,65" href="javascript:set_color(\'#ff00ff\')">'+

'<area shape="rect" coords="289,0,302,13" href="javascript:set_color(\'X\')" title="'+msg['close']+'">'+
'<area shape="rect" coords="289,53,302,66" href="javascript:set_color(\'C\')" title="'+msg['colorclear']+'">';

tag['scriptinfo'] = '<p>AjaxChat by : <a href="http://hypweb.net/xoops/" target="_blank">XOOPS MANIAC</a> - <a href="http://hypweb.net/xoops/modules/pukiwiki/2211.html" target="_blank">written in nao-pon\'s Blog</a></p>';

String.prototype.mReplace = function(pat,flag){
	var temp = this;
	if(!flag){flag=""}
	for(var i in pat){
		var re = new RegExp(i,flag);
		temp = temp.replace(re,pat[i])
	}
	return temp;
};
var D = Date.prototype;
//日付の書式
D.format = "yyyy-mm-dd HH:MM:SS";
D.formatTime = function(format){
	var yy;
	var o = {
		yyyy : ((yy = this.getYear()) < 2000)? yy+1900 : yy,
		mm   : this.getMonth() + 1,
		dd   : this.getDate(),
		HH   : this.getHours(),
		MM   : this.getMinutes(),
		SS   : this.getSeconds()
	}
	for(var i in o){
		if (o[i] < 10) o[i] = "0" + o[i];
	}
	return (format) ? format.mReplace(o) : this.format.mReplace(o);
}

window.onload = init;
window.onunload = leave;
window.onresize = set_logwindow;

function init()
{
	if (window.opera)
	{
		flg['opera'] = true;
	}
	
	build();
	
	var cname = "";
	if (flg['stay']) gid('btn_send').disabled = false;
	gid('c').disabled = false;
	gid('c').className = "toall";
	gid('tip').className = "toall";
	gid('n').disabled = false;
	flg['islogtop'] = true;
	
	if (ck = load_cookie("ajaxchat"))
	{
		if (ck[0]) cname = ck[0];
		if (ck[1]) set_color(ck[1],true);
		if (ck[2]) myip = ck[2];
		if (ck[3]) gid('ent').checked = (ck[3]==2)? true : false;
		if (ck[4]) gid('ten').checked = (ck[4]==2)? true : false;
		if (ck[5]) gid('maru').checked = (ck[5]==2)? true : false;
		if (ck[6]) gid('sp').checked = (ck[6]==2)? true : false;
		if (ck[7]) gid('cookie').checked = (ck[7]==2)? true : false;
		if (ck[8]) gid('sound_in').checked = (ck[8]==2)? true : false;
		if (ck[9]) gid('sound_out').checked = (ck[9]==2)? true : false;
		if (ck[10]) gid('sound_line').checked = (ck[10]==2)? true : false;
		if (ck[11]) gid('sound_toyou').checked = (ck[11]==2)? true : false;
		if (ck[12]) gid('info_in').checked = (ck[12]==2)? true : false;
		if (ck[13]) gid('info_out').checked = (ck[13]==2)? true : false;
		if (ck[14]) gid('info_time').checked = (ck[14]==2)? true : false;
	}
	
	name_html = gid('name').innerHTML;
	gid('n').value = name = cname;
	
	//set_tip();
	
	// 自己ID取得設定
	post(true);
	
	noname = noname+"("+(myip.charCodeAt(0,1) + myip.charCodeAt(1,1))+")";
	
	timerID['stay'] = setTimeout("stay(false)",stayref/2);
	
	// 初期読み込み
	head();
	
	if (flg['stay'])
	{
		gid('c').value = "";
		post(false,'popup');
		gid('c').focus();
	}
	else
	{
		gid('c').value = msg['howto'];
	}
	
	// title 設定(親から継承する)
	if (QueryString['title'])
	{
		document.title = QueryString['title'];
	}
	else
	{
		if (window.opener)
		{
			document.title = window.opener.document.title;
			window.status = document.title;
		}
		else if (window.parent)
		{
			try
			{
				document.title = window.parent.document.title;
			}
			catch(e)
			{
				//var title = QueryString['title'];
				//if (title) document.title = title;
			}
		}
	}
	if (flg['popup']){stay(true);}
	
	//set_logwindow();
	// なぜか、表示域が調整されないことがあるので念のためもう一度
	//setTimeout("set_logwindow()",1000);
}

function build()
{
	var elm;

	elm = document.createElement("div");
	elm.id = "stay";
	document.body.appendChild(elm);
	set_stay('init');

	elm = document.createElement("div");
	elm.id = "setting";
	elm.innerHTML = tag['setting'];
	tag['setting'] = null;
	document.body.appendChild(elm);

	elm = document.createElement("div");
	elm.id = "infobox";
	elm.innerHTML = tag['infobox'];
	tag['infobox'] = null;
	document.body.appendChild(elm);

	elm = document.createElement("div");
	with(elm)
	{
		id = "logbase";
		onscroll = log_onscroll;
		onmouseup = log_onscroll;
	}
	document.body.appendChild(elm);
	
	elm = document.createElement("div");
	elm.id = "log";
	tag['log'] = null;
	gid('logbase').appendChild(elm);
	
	elm = document.createElement("div");
	elm.id = "last";
	elm.innerHTML = '<p><span id="last_time">' + msg['last_init'] + '</span>' + tag['refresh'] + tag['popup'] + '</p>';
	msg['last_init'] = null;
	document.body.appendChild(elm);
	
	elm = document.createElement("div");
	elm.id = "formbase";
	document.body.appendChild(elm);
	
	elm = document.createElement("form");
	with(elm)
	{
		name = "f";
		id = "f";
		action = "write.php";
		method = "POST";
		onsubmit = post;
		innerHTML = tag['form'];
		tag['form'] = null;
	}
	gid('formbase').appendChild(elm);
	gid('setting_btn').innerHTML = '<img src="./imgs/setting.png" width="16" height="16" border="0" alt="'+msg['setting']+'" title="'+msg['setting']+'" onclick="setting(\'open\');" style="cursor:pointer;">';
	gid('face').innerHTML = tag['face'];
	tag['face'] = null;
	
	elm = document.createElement("div");
	elm.id = "color";
	elm.innerHTML = tag['color'];
	tag['color'] = null;
	gid('formbase').appendChild(elm);
	
	elm = document.createElement("map");
	elm.id = "spmap";
	elm.name = "spmap";
	elm.innerHTML = tag['spmap'];
	tag['spmap'] = null;
	document.body.appendChild(elm);
	
	elm = document.createElement("div");
	elm.id = "SoundUnit"
	document.body.appendChild(elm);
	
	gid('tip').innerHTML = msg['to'].replace('$1',msg['toall']);
	
	// overlib
	//elm = document.createElement("div");
	//elm.id = "overDiv";
	//elm.style.position = "absolute";
	//elm.style.visibility = "hidden";
	//elm.style.zIndex = 1000;
	//document.body.appendChild(elm);
	
	//elm = document.createElement("script");
	//elm.language = "JavaScript";
	//elm.src = "overlib.js";
	//document.body.appendChild(elm);
}

function play(swfURL){
	var elm = gid("SoundUnit");
	var innerHTML = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,22,0" width="0" height="0" id="SoundUnit"><param name="movie" value="' + swfURL + '" /><embed src="' + swfURL + '" width="0" height="0" name="SoundUnit" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /></object>'
	elm.innerHTML = innerHTML;
}

function log_refresh()
{
	flg['popupping'] = false;
	if (popup_w && !popup_w.closed)
	{
		try{popup_w.close();}catch(e){}
		leave(true);
	}
	popup_w = null;
	flg['stop'] = false;
	
	gid('logbase').style.visibility = "visible";
	gid('formbase').style.visibility = "visible";
	
	if (flg['stay']) gid('c').focus();
	insert = "";
	head();
	//stay(false);
	stay_timer(500);
	((flg['stay'])? gid('c'):window).focus();
}

function set_logwindow(scroll)
{
	try
	{
		if(document.all)
		{
			var dbody = parseInt(document.body.offsetHeight) - 5;
			
		}
		else
		{
			var dbody = parseInt(window.innerHeight) - 5;
		}
		
		gid('stay').style.height = "auto";
		var logheight = dbody - parseInt(gid('formbase').offsetHeight) - ((staypos == "t")? parseInt(gid('stay').offsetHeight) : 0) - parseInt(gid('last').offsetHeight) - 2;
		if (logheight)
		{
			gid('logbase').style.height = logheight + "px";
			if (staypos != "t")
			{
				gid('stay').style.height = logheight + "px";
				gid('stay_r_m').style.height = (logheight - parseInt(gid('stay_r_h').offsetHeight) - parseInt(gid('stay_r_f').offsetHeight) - 1) + "px";
				//alert(gid('stay_r_menber').style.height);
			}
		}
		if (scroll){log_scroll();}
		if (window.opera)
		{
			if (staypos == "t")
			{
				gid('logbase').style.width = "auto";
			}
			else
			{
				gid('logbase').style.width = (parseInt(document.body.offsetWidth) - parseInt(gid('stay').offsetWidth) - 2)+"px";
			}
			// opera のバグ？ エレメント位置が追従しない。
			gid("face").style.top = "0px";
			gid("face").style.left = "0px";
		}
		flg['set_logwindow_err'] = false;
	}
	catch(e)
	{
		flg['set_logwindow_err'] = true;
		//alert(e);
	}
}

function gid(id){
	return document.getElementById(id)
}
function createXMLHttp(){
	try {
		return new ActiveXObject("Microsoft.XMLHTTP");
	} catch (e) {
		return new XMLHttpRequest()
	}
}

// タイマー
function timer()
{
	// 念のためクリアー
	// 低速なブラウザの為に数発打っておく。効果ある？
	for ( cnt = 1 ; cnt <= 3 ; cnt++ )
	{
		if (timerID['log']) clearTimeout(timerID['log']);
	}
	
	if (!flg['stop'])
	{
		timerID['log'] = setTimeout("reload()",(flg['stay'])? refresh : refresh0);
	}
}

// 在室タイマー
function stay_timer(val)
{
	// 念のためクリアー
	// 低速なブラウザの為に数発打っておく。効果ある？
	for ( cnt = 1 ; cnt <= 3 ; cnt++ )
	{
		if (timerID['stay']) clearTimeout(timerID['stay']);
	}
	
	if (!flg['stop'])
	{
		timerID['stay'] = setTimeout("stay(false)",((!val)? stayref : val));
	}
}

// 最終発言タイマー
function last_timer()
{
	// 念のためクリアー
	// 低速なブラウザの為に数発打っておく。効果ある？
	for ( cnt = 1 ; cnt <= 3 ; cnt++ )
	{
		if (timerID['last']) clearTimeout(timerID['last']);
	}
	
	if (!flg['stop'] && lastref)
	{
		timerID['last'] = setTimeout("set_last()",lastref);
	}
}

// ログ表示
function write(v,mode,dust)
{
	if (flg['set_logwindow_err'] || mode=="init")
	{
		set_logwindow();
		//なぜか、表示域が調整されないことがあるので念のため後でもう一度
		if (mode=="init") {setTimeout("set_logwindow(true)",2000);}
	}
	
	if (mode == "past")
	{
		if (dust) logcache = logcache.substr(dust);
		v += logcache + "\n";
	}

	var lines = v.split("\n");
	var log = gid("log");
	var dat = ""
	var last_time_tmp = last_time;
	var last_time_talk_tmp = last_time_talk;
	var start = 0;
	
	if (!flg['islogtop'] && mode)
	{
		start = 1;
		logcache = lines[0];
	}
	
	var dats = new Array();
	var cmds = new Array();
	var dat_cnt = 0;
	var staychange = 0;
	var bef_name_tmp = (!mode)? bef_name : "";
	
	for(var i=start;i<lines.length;i++)
	{
		if(!lines[i]){continue}
		var tmp = lines[i].split("<>");
		
		var Dt = new Date(tmp[0]*1000).formatTime();
		if(!tmp[0] || /NaN/.test(Dt) || !tmp[2])
		{
			continue;
		}
		
		var cmd = "";
		var systmtalk = false;
		
		// 前回の発言からの経過時間
		if (gid('info_time').checked && last_time_tmp)
		{
			var hour = parseInt((tmp[0] - last_time_tmp + 900)/3600);
			if (hour >= 1)
			{
				dats[dat_cnt++] =  [
					"<tr><td style=\"text-align:right;\" nowrap=\"true\">",
					"</td>",
					"<td style=\"padding-left:2em;width:100%;\" colspan=\"2\">",
					"<img src=\"./imgs/alert.png\" width=\"11\" height=\"10\" style=\"vertical-align: middle;margin:0px;\"> <span class=\"info\" title=\"\">",msg['pastfor'].replace('$1',hour),"</span>",
					"</td></tr>"
				].join("");
				cmds[dat_cnt] = cmd;
				bef_name_tmp = "";
			}
		}
		
		// システムメッセージ(旧バージョン用 Ver 1.4 未満)
		if (tmp[1] && tmp[1].match(/.*(システム通知)\[[\d.]+\].*/))
		{
			if (tmp[1].match(/[\d.]+/) <= version){continue;}
		}
		
		if (!tmp[1]) {tmp[1] = "";}
		if (!tmp[6]) {tmp[6] = "";}
		// In & Out
		if (tmp[1] == "_iN_")
		{
			//if (tmp[6] != myip) staychange = 1;
			staychange = 1;
			tmp[6] = "";
			cmd = tmp[1] + tmp[2];
			
			if (!mode && gid('sound_in').checked) {play(sound['in']);}
			if (!gid('info_in').checked) {continue;}
			
			tmp[1] = msg['info'];
			tmp[2] = tmp[2].replace(/([^#]+)#?$/,"$1");
			tmp[2] = "<span class=\"info\">"+msg['ininfo'].replace('$1',tmp[2])+"</span>";
			systmtalk = true;
		}
		else if (tmp[1] == "_oUt_")
		{
			//if (tmp[6] != myip) {staychange = 1;}
			staychange = 1;
			tmp[6] = "";
			if (cmds[dat_cnt] == ("_iN_" + tmp[2]))
			{
				dats[--dat_cnt] = '';
				var outmsg = 'passinfo';
				cmd = "_pAsS_" + tmp[2];
			}
			else
			{
				var outmsg = 'outinfo';
				cmd = tmp[1] + tmp[2];
			}
			
			if (cmds[dat_cnt] == ("_pAsS_" + tmp[2]))
			{
				continue;
			}
			
			if (!mode && gid('sound_out').checked) {play(sound['out']);}
			if (!gid('info_out').checked) {continue;}
			
			tmp[1] = msg['info'];
			tmp[2] = tmp[2].replace(/([^#]+)#?$/,"$1");
			tmp[2] = "<span class=\"info\">"+msg[outmsg].replace('$1',tmp[2])+"</span>";
			systmtalk = true;
		}
		// VerUP が必要？
		else if (tmp[1] == "_uP_")
		{
			if (tmp[2] <= version){continue;}
			tmp[1] = msg['sysinfo'].replace('$1',tmp[2]);
			tmp[2] = msg['needupdate'];
		}
		// 通常の発言
		else
		{
			last_time_talk_tmp = tmp[0];
			
			// 無視リストチェック
			if (!(!filter[tmp[6]])) {continue;}
			
			// 内緒モードチェック
			if (tmp[4])
			{
				if ((myip != tmp[6]) && (myip != tmp[4])) {continue;}
				if (!mode)
				{
					if (myip != tmp[6])
					{
						// 内緒自分以外から
						if (gid('sound_toyou').checked)
						{
							play(sound['toyou']);
						}
						else if (gid('sound_line').checked)
						{
							play(sound['newline']);
						}
					}
					else
					{
						// 内緒自分から
						if (gid('sound_line').checked) {play(sound['newline']);}
					}
				}
			}
			else
			{
				// 通常発言
				if (!mode && gid('sound_line').checked) {play(sound['newline']);}
			}
		}
		
		last_time_tmp = tmp[0];
		
		
		// ipで色のナンバーを決める
		if (!tmp[3]) tmp[3] = "0.0.0.0";
		var ip = tmp[3].split(".");
		var ipc = ip[2] + ip[3];
		var ipv = "ID:"+tmp[6].substring(0,2)+"...";
		ipc = parseInt(ipc.toString(8).substring(0,1),8);
		
		// 色指定あり
		var style = "";
		if (tmp[7])
		{
			style = " style=\"color:"+tmp[7]+";\"";
		}
		
		// コメント欄
		// メアドらしき文字列はログ表示で表示しない
		if (mode && !tmp[4]) tmp[2] = tmp[2].replace(/[!~*'();\/?:\@&=+\$,%#\w.-]+@[A-Za-z0-9_-]+\.[A-Za-z0-9_.-]+/g,"<span class=\"info\">"+msg['nomail']+"</span>");
		// '
		tmp[2] = log_replace(tmp[2]) + ((tmp[5])? "<span class=\"toname\"> &#187; "+tmp[5]+" ["+tmp[4].substring(0,5)+"]</span>":"");
		
		if (systmtalk)
		{
			dats[dat_cnt++] = [
				"<tr><td style=\"text-align:right;\" nowrap=\"true\">",
				"</td>",
				"<td style=\"padding-left:2em;width:100%;\" colspan=\"2\">",
				"<img src=\"./imgs/alert.png\" width=\"11\" height=\"10\" style=\"vertical-align: middle;margin:0px;\"> <span class=\"color",ipc,"\" title=\"",Dt,"\"",style,">",tmp[2],"</span>",
				"</td></tr>"
			].join("");
		}
		else
		{
			dats[dat_cnt++] = [
				"<tr><td style=\"text-align:right;line-height:1.0;padding-top:2px;\" nowrap=\"true\">",
				(tmp[6] != bef_name_tmp)? make_name_link(tmp[6],tmp[1],'name',style,tmp[8]) : "","</td><td style=\"padding:0px;\">&#187;</td>",
				"<td style=\"width:100%;\">",
				"<span class=\"color",ipc,"\" title=\"",Dt,"\"",style,">",tmp[2],"</span>",
				"</td></tr>"
			].join("");
		}
		bef_name_tmp = tmp[6];
		cmds[dat_cnt] = cmd;
	}
	dat += dats.join("");
	if (!mode) bef_name = bef_name_tmp;

	if (mode == "past")
	{
		insert = dat + insert;
	}
	else
	{
		insert += dat;
	}
	// more & Welcome メッセージ
	var moretag = (flg['islogtop'])? "" : '<div id="morelog"><a href="javascript:get(\'\',\'past\')" target="_self">'+msg['morelog']+'</a></div>';
	var welcome_tag = (!flg['show_welcome'] && mode == "init")?'<div id="welcome">'+msg['welcome']+'</div>':'';
	flg['show_welcome'] = true;
	
	log.innerHTML = moretag + '<table id="logtable">' + insert + '</table>' + welcome_tag;
	
	try{log_scroll(mode);}catch(e){}
	
	if (mode != "past")
	{
		last_time = last_time_tmp;
		if (last_time_talk < last_time_talk_tmp)
		{
			last_time_talk = last_time_talk_tmp;
			set_last();
		}
		else if (mode == "init")
		{
			gid('last_time').innerHTML = msg['novoice'];
		}
	}
	
	//if (mode == "init" && (!v || last_time_talk == last_time_talk_tmp)){gid('last_time').innerHTML = msg['novoice'];}

	if (!mode && staychange){stay(true);}
	
	if (!flg['stopscroll'] && insert.length > need_refrash)
	{
		stay(true);
		if (confirm(msg['wish_refrash'].replace('_PAGE_TITLE_',document.title)))
		{
			log_refresh();
		}
	}
}

function log_scroll(mode)
{
	var oldtop = logtop;
	logtop = parseInt(gid('log').offsetHeight) - parseInt(gid('logbase').offsetHeight);
	var settop = (mode == "past")? logtop - oldtop : logtop;
	if (!flg['stopscroll'] || mode == "past") gid('logbase').scrollTop = settop;
}

function make_name_link(id,name,cl,st,trip)
{
	var onclick = "";
	var lname = (name)? name : u_noname + "("+(id.charCodeAt(0,1) + id.charCodeAt(1,1))+")";
	
	var name_tmp = lname;
	
	lname = lname.replace(/([^#]+)#?$/,"$1");
	vname = lname.replace(/'/g,"\\'");
	if (!trip) trip = id;
	trip = (lname != name_tmp)? '<br><span class="trip">'+trip+'</span>' : "";
	
	if (id)
	{
		var ipv = id;
		var set_tip_val = (cl == "stay_name" && id == tip)? "" : vname + "','" + id.replace(/'/g,"\\'");
		var onclick  = " title=\""+lname+" [ ID: " + ipv + " ] - [["+msg['kick']+":javascript:kick_req('"+id+"','"+vname+"')]]\n"+msg['click2whisper'].replace('$1',lname)+"\" onclick=\"set_tip('" + set_tip_val + "')\" ondblclick=\"set_filter('" + vname + "','" + id.replace(/'/g,"\\'") + "')\"";
	}
	else
	{
		cl = "info";
	}
	if (!st) st = "";
	if (cl == "stay_name")
	{
		if (!(!filter[id])){lname = '<span class="filter">'+lname+'</span>';}
		if (tip == id){lname = '<span class="talkto">'+lname+'</span>';}
	}
	else
	{
		lname += trip;
	}
	return "<span class=\""+cl+"\""+st+onclick+">"+lname+"</span>";
}

function set_last()
{
	if (!last_time_talk)
	{
		return;
	}
	var Dt = new Date(last_time_talk*1000).formatTime();
	var past = new Date().getTime();
	var sc = msg['bef_sec'];
	lastref = 1000;
	past = parseInt(past/1000 - last_time_talk - timeoffset);
	if (past < 0)
	{
		past = 0;
		lastref = 0;
	}
	if (past > 60)
	{
		lastref = 6000;
		past = parseInt(past/60);
		sc = msg['bef_min'];
	}
	if (past > 60)
	{
		lastref = 6000;
		sc = msg['hour']+(past%60)+msg['bef_min'];
		past = parseInt(past/60);
	}
	
	gid('last_time').innerHTML = msg['last_voice'] + past + sc + " ( "+ Dt + " )";
	
	if (flg['popup'])
	{
		window.status = document.title;
	}
	if (lastref){last_timer();}
}

function popup()
{
	if (!popup_w || popup_w.closed)
	{
		flg['stop'] = true;
		
		gid('logbase').style.visibility = "hidden";
		gid('formbase').style.visibility = "hidden";
		gid('stay').innerHTML = msg['popuping'].replace('$1',tag['refresh']);
		clearTimeout(timerID['log']);
		clearTimeout(timerID['stay']);
		flg['popupping'] = true;
		
		//try
		//{
		//	popup_w = showModelessDialog('./ajaxchat.htm?popup=1&id='+logid+'&stay='+flg['stay']+'&staypos='+staypos,(myip.replace(/[^a-z0-9_]+/ig,"") + logid),'screenX:100;screenY:100;left:100;top:100;width:400;height:300;status:1;scrollbars:0;menubar:0;location:0;directions:0;toolbar:0;resizable:1;');
		//}catch(e){
		//	alert(e);
			popup_w = window.open('./ajaxchat.htm?popup=1&id='+logid+'&stay='+flg['stay']+'&staypos='+staypos,(myip.replace(/[^a-z0-9_]+/ig,"") + logid),'screenX=100,screenY=100,left=100,top=100,width=400,height=300,status=1,scrollbars=0,menubar=0,location=0,directions=0,toolbar=0,resizable=1');
			popup_w.focus();
		//}
	}
	else
	{
		popup_w.focus();
	}
}

function log_replace(str)
{
	// URL
	str = str.replace(/((?:https?|ftp|news):\/\/[!~*'();\/?:\@&=+\$,%#A-Za-z0-9_.-]+)/g,url);
	//'
	// HTMLタグの外側の処理
	str = str.replace(/(>|^)([^<]+|$)/g,work);
	
	return str;
	
	function url(str0,str1)
	{
		return "<a href=\""+str1+"\" target=\"_blank\" title=\""+str1+"\">"+str1.substr(0,60)+((str1.length > 60)? "..." : "")+"</a>";
	}
	
	function work(str0,str1,str2)
	{
		var str = str2;
		//alert(str0+" : "+str1+" : "+str2);
		// 同じ文字の10回以上の繰り返し
		str = str.replace(/(.)\1{9,}/g,"$1$1$1$1$1$1$1...");
		// 長い英数文字列 (IE以外のみ)
		if (!document.all)
		{
			str = unhtmlspecialchars(str);
			str = str.replace(/([!~*'"();\/?:\@&=+\$,%#\w.-]{20})/g,"$1&#x200B;"); //'
			str = htmlspecialchars(str);
		}
		// フェイスマーク
		str = str.replace(/(^|\s)\:\)/g,"$1<img src=\"imgs/smile.gif\" title=\":)\" alt=\":)\" width=\"15\" height=\"15\" border=\"0\">");
		str = str.replace(/(^|\s)\:D/g,"$1<img src=\"imgs/bigsmile.gif\" title=\":D\ alt=\":D\" width=\"15\" height=\"15\" border=\"0\">");
		str = str.replace(/(^|\s):p/g,"$1<img src=\"imgs/huh.gif\" title=\":p\ alt=\":p\" width=\"15\" height=\"15\" border=\"0\">");
		str = str.replace(/(^|\s)XD/g,"$1<img src=\"imgs/oh.gif\" title=\"XD\" alt=\"XD\" width=\"15\" height=\"15\" border=\"0\">");
		str = str.replace(/(^|\s);\)/g,"$1<img src=\"imgs/wink.gif\" title=\";)\" alt=\";)\" width=\"15\" height=\"15\" border=\"0\">");
		str = str.replace(/(^|\s);\(/g,"$1<img src=\"imgs/sad.gif\" title=\";(\" alt=\";(\" width=\"15\" height=\"15\" border=\"0\">");
		str = str.replace(/(^|\s)&amp;heart;/g,"$1<img src=\"imgs/heart.gif\" title=\" alt=\"&amp;heart;\" width=\"15\" height=\"15\" border=\"0\">");
		return str1 + str;
	}
}

function set_tip(vname,ip)
{
	if (flg['stay']){gid('c').focus();}
	if (!vname || ip == tip)
	{
		gid('tip').innerHTML = msg['to'].replace('$1',msg['toall']);
		tip = "";
		tname = "";
		gid('c').className = "toall";
		gid('tip').className = "toall";
	}
	else
	{
		gid('tip').innerHTML = msg['to'].replace('$1',vname);
		tip = ip;
		tname = vname;
		gid('c').className = "whisper";
		gid('tip').className = "whisper";
	}
	if (timerID['set_stay']) clearTimeout(timerID['set_stay']);
	timerID['set_stay'] = setTimeout("set_stay()",500);
}

function set_filter(vname,ip)
{
	set_tip();
	if (vname)
	{
		if (!filter[ip])
		{
			if (confirm(msg['addfilter'].replace('$1',vname)))
			{
				filter[ip] = vname;
				set_stay();
			}
		}
		else
		{
			if (confirm(msg['delfilter'].replace('$1',vname)))
			{
				filter[ip] = null;
				set_stay();
			}
		}
	}
	((flg['stay'])? gid('c'):window).focus();
}

function set_stay(mod)
{
	var cnt = 0;
	var other = 0;
	var menber = 0;
	var names = new Array();
	for(var ip in stays)
	{
		if (stays[ip]['name'])
		{
			// 内緒設定用
			names[menber] = make_name_link(ip,stays[ip]['name'],'stay_name');
			menber++;
		}
		else
		{
			other++;
		}
		cnt++;
	}
	if (staypos == "t")
	{
		gid('stay').className = "stay_top";
		if (mod == 'init')
		{
			gid('stay').innerHTML = tag['stay2right'] + tag['info'] + msg['stay_init'] + ' <a href="javascript:stay_pos(\''+staypos+'\')">' + msg['stay_refresh'] + '</a>';
		}
		else
		{
			names = (cnt == other)? msg['nomember'] : names.sort().join(" , ") + " &amp;";
			gid('stay').innerHTML = tag['stay2right'] + tag['info'] + msg['menber'].replace('$1',cnt)+" &#187; " + names + msg['rom'].replace('$1',other);
		}
	}
	else
	{
		gid('stay').className = "stay_right";
		if (mod == 'init')
		{
			gid('stay').innerHTML = "<div id=\"stay_r_h\" class=\"stay_r_header\">" + tag['stay2top'] + tag['info'] + "</div>" + "<div id=\"stay_r_m\" class=\"stay_r_menber\">" + msg['stay_init'] + '<br><a href="javascript:stay_pos(\''+staypos+'\')">' + msg['stay_refresh'] + '</a>'+ "</div><div id=\"stay_r_f\" class=\"stay_r_footer\"></div>";
		}
		else
		{
			names = (cnt == other)? "" : names.sort().join("<br>") + "<br>";
			gid('stay').innerHTML = "<div id=\"stay_r_h\" class=\"stay_r_header\">" + tag['stay2top'] + tag['info'] + msg['menber'].replace('$1',cnt) + "</div>" + "<div id=\"stay_r_m\" class=\"stay_r_menber\">" + names + ((other)? msg['rom'].replace('$1',other):"") + "</div><div id=\"stay_r_f\" class=\"stay_r_footer\">" +msg['in_rom'].replace('$1',menber).replace('$2',other) + "</div>";
		}
	}

	set_logwindow();
}

function stay(notimer)
{
	gid("status").src = "./imgs/link2.png";
	
	var x = createXMLHttp();
	x.onreadystatechange = function()
	{
		if(x.readyState == 4)
		{
			try
			{
				if (x.status == 200)
				{
					if (x.responseText)
					{
						eval( 'stays = ' + x.responseText );
					}
					x = null;
					set_stay();
					setTimeout(function(){gid("status").src = "./imgs/connect.png";},500);
					if (!notimer) stay_timer();
					flg['stay_check'] = true;
				}
				else
				{
					x = null;
					setTimeout(function(){gid("status").src = "./imgs/disconnect.png";},100);
				}
			} catch(e) {
				x = null;
				if (!notimer) stay_timer();
			}
		}
	};
	var sname = (name)? name.replace(/([^#]+)(#.*)?/,"$1") : noname;
	sname = (flg['stay'])? sname : "";
	var d = "id="+logid+"&n="+sname+"&encode_hint="+encodeURIComponent("ぷ")+"&ucd="+encodeURIComponent(myip);
	x.open("POST","stay.php", true);
	x.setRequestHeader("Content-Type" , "application/x-www-form-urlencoded");
	x.send(d);
}

// 初回サイズを調べる
function head(opt){
	var x = createXMLHttp();
	x.onreadystatechange = function(){
		if(x.readyState == 4)
		{
			size = 0;
			if (x.status == 200 || x.status == 206)
			{
				var len = 0;
				var ran = "";
				var last = "";
				try{len = x.getResponseHeader("Content-Length");}catch(e){}
				try{last = x.getResponseHeader("Last-Modified");}catch(e){}
				try{ran = x.getResponseHeader("Content-Range");}catch(e){}
				if(ran)
				{
					size = (ran.match(/\/(\d+)$/))[1];
				}
				else if (len)
				{
					size = len-0;
				}
				if (size)
				{
					mod = last;
					get(opt,"init");
				}
				else
				{
					write("","init");
					timer();
				}
			}
			else if (x.status == 403)
			{
				// リファラが設定されていない
				gid('c').value = "";
				gid('btn_send').disabled = true;
				gid('c').disabled = true;
				gid('n').disabled = true;
				set_last();
				if (timerID['stay']) clearTimeout(timerID['stay']);
				gid('stay').innerHTML = "";
				log.innerHTML = msg['noref'];
			}
			else
			{
				// 404(ファイルがない)とか、その他
				write("","init");
				timer();
			}
			x = null;
		}
	};
	var dtNow = new Date;
	if (flg['opera'])
	{
		x.open("GET", "seek.php?id="+logid+"&med=HEAD&t="+dtNow.getTime(), true);
	}
	else
	{
		x.open("HEAD", logfile+"?t="+dtNow.getTime(), true);
		x.setRequestHeader("Referer", "ajaxchat.htm");
	}
	x.send(null);
}
// 初回取得
function get(opt,mode,dust)
{
	clearTimeout(timerID['log']);
	saving = true;
	if (mode == "past")
	{
		gid('morelog').style.visibility = "hidden";
	}
	var x = createXMLHttp();
	x.onreadystatechange = function(){
		if(x.readyState == 4)
		{
			var v;
			try
			{
				if (x.status == 200 || x.status == 206)
				{
					var len = 0;
					try{len = x.getResponseHeader("Content-Length");}catch(e){}
					v = x.responseText;
					x = null;
					logend = logstart - 1;
					logstart = logend - read;
					if (logstart < 0){logstart = 0;}
					write(v,mode,dust);
				}
			} catch(e) {
				x = null;
				getcounter++;
				if (getcounter <= 3)
				{
					// マルチバイト文字がバイト途中で切れている場合 ie でエラーが出るので
					// 読み込みを1バイトづつ増やしてみる。
					logend ++;
					get(opt,mode,getcounter);
				}
				else
				{
					//とりあえずなにもしない。
				}
			}
			flg['islogtop'] = (logstart > 0)? false : true;
			if (gid('morelog')) {gid('morelog').style.visibility = "visible";}
			saving = false;
			getcounter = 0;
			timer();
		}
	};
	var dtNow = new Date;
	if (!flg['opera'])
	{
		x.open("GET", logfile+"?t="+dtNow.getTime(), true);
		x.setRequestHeader("Referer", "ajaxchat.htm");
		if (mode == "past")
		{
			x.setRequestHeader("Range", ["bytes=",logstart,"-",logend].join(""));
		}
		else if(size >= read)
		{
			logstart = size-read;
			x.setRequestHeader("Range", ["bytes=",logstart,"-"].join(""));
			flg['islogtop'] = false;
		}
	}
	else
	{
		var seek="";
		if (mode == "past")
		{
			seek += "&s="+logstart+"&e="+logend;
		}
		else if(size >= read)
		{
			logstart = size-read;
			seek += "&s="+logstart;
			flg['islogtop'] = false;
		}
		x.open("GET", "seek.php?t="+dtNow.getTime()+"&id="+logid+seek, true);
	}
	
	x.send(null);
}
// 差分取得
function reload(opt){

	if (saving && opt != "notimer"){timer();return;}
	
	gid("status").src = "./imgs/link.png";

	var x = createXMLHttp();
	x.onreadystatechange = function(){
		if(x.readyState == 4)
		{
			try
			{
				if (x.status == 200 || x.status == 206)
				{
					if (saving && opt != "notimer"){timer();return;}
					var len = 0;
					var ran = "";
					var last = "";
					var size_t = 0;
					try{len = x.getResponseHeader("Content-Length");}catch(e){}
					try{last = x.getResponseHeader("Last-Modified");}catch(e){}
					try{ran = x.getResponseHeader("Content-Range");}catch(e){}
					//
					if(last){mod = last}
					if(ran)
					{
						size_t = (ran.match(/\/(\d+)$/))[1]
					}
					else if (len)
					{
						size_t = len-0;
					}
					var v = x.responseText;
					x = null;
					
					if (size_t > size)
					{
						size = size_t;
						if(v){write(v);}
					}
					else
					{
						log_refresh();
					}
					setTimeout(function(){gid("status").src = "./imgs/connect.png";},500);
				}
				else if (x.status == 304)
				{
					x = null;
					setTimeout(function(){gid("status").src = "./imgs/connect.png";},500);
				}
				else if (x.status == 416)
				{
					x = null;
					log_refresh();
					setTimeout(function(){gid("status").src = "./imgs/connect.png";},500);
				}
				else
				{
					x = null;
					setTimeout(function(){gid("status").src = "./imgs/disconnect.png";},100);
				}
				timer();
			} catch(e) {
				x = null;
				timer();
			}
		}
	};
	var dtNow = new Date;
	try
	{
		if (!flg['opera'])
		{
			x.open("GET", logfile+"?t="+dtNow.getTime(), true);
			if (size) x.setRequestHeader("Range", ["bytes=",size,"-"].join(""));
			if (mod) x.setRequestHeader("If-Modified-Since", mod);
			x.setRequestHeader("Referer", "ajaxchat.htm");
		}
		else
		{
			var seek="&s="+size;
			x.open("GET", "seek.php?t="+dtNow.getTime()+"&id="+logid+seek, true);
		}
		x.send(null);
	}
	catch(e)
	{
		alert('no connect!')
	}
}
// 送信
function post(init,cmd)
{
	form = gid('f');
	if(!init && (form.c.value == "" || form.c.value == msg['howto']) && !cmd)
	{
		form.c.focus();
		return false;
	}
	if (form.c.value.length > max_post_size)
	{
		if (!confirm(msg['to_large_post']))
		{
			form.c.focus();
			return false;
		}
		form.c.value = form.c.value.substr(0,max_post_size);
	}
	
	document.body.style.cursor = 'wait';
	form.c.style.cursor = 'wait';
	
	if (!cmd) cmd = "";
	
	
	// 低速なブラウザの為に数発打っておく。効果ある？
	for ( cnt = 1 ; cnt <= 3 ; cnt++ )
	{
		clearTimeout(timerID['log']);
	}
	saving = true;
	flg['stopscroll'] = false;
	
	// 初回POST時
	name = form.n.value;
	
	var gn = (name)? "" : "&gn="+encodeURIComponent(noname);
	var d = "ver="+encodeURIComponent(version)+"&myip="+encodeURIComponent(myip);
	
	if (!init)
	{
		var d = "n="+encodeURIComponent(name)+"&c="+encodeURIComponent(form.c.value)+"&id="+logid+"&tip="+encodeURIComponent(tip)+"&tn="+encodeURIComponent(tname)+"&encode_hint="+encodeURIComponent("ぷ")+"&ver="+encodeURIComponent(version)+"&myip="+encodeURIComponent(myip)+"&color="+encodeURIComponent(color)+"&cmd="+encodeURIComponent(cmd)+gn;
		cookie_write();
	}
	
	form.c.value = "";
	
	var x = createXMLHttp();

	x.open("POST", "write.php", false);
	x.setRequestHeader("Content-Type" , "application/x-www-form-urlencoded");
	x.send(d);
	
	if(x.status == 200 || x.status == 0)
	{
		var arg = x.responseText.split(" ");
		myip = arg[0];
		var time = new Date().getTime();
		if (!arg[1]) arg[1] = time/1000;
		timeoffset = time/1000 - arg[1];
		if (!init && cmd != "kick")
		{
			if (!size)
			{
				head("notimer");
			}
			else
			{
				reload("notimer");
			}
			if (!init)
			{
				
				flg['post'] = true;
				var sname = (name)? name : noname;
				sname = htmlspecialchars(sname);
				gid('name').innerHTML = '<input id="leave_btn" type="button" value="'+msg['leave'].replace('$1',sname.replace(/([^#]+)(#.*)?/,"$1"))+'" onclick="leave();"><input type="hidden" name="n" id="n" value="'+sname+'">';
				//"
			}
		}
	}
	else
	{
		alert (msg['error_post']);
	}
	x = null;
	
	if (!init && !cmd) gid('c').focus();
	saving = false;
	document.body.style.cursor = 'auto';
	form.c.style.cursor = 'auto';
	return false;
}

function cookie_write()
{
	var check = 
	"\11"+((gid('ent').checked)? "2" : "1")+
	"\11"+((gid('ten').checked)? "2" : "1")+
	"\11"+((gid('maru').checked)? "2" : "1")+
	"\11"+((gid('sp').checked)? "2" : "1")+
	"\11"+((gid('cookie').checked)? "2" : "1")+
	"\11"+((gid('sound_in').checked)? "2" : "1")+
	"\11"+((gid('sound_out').checked)? "2" : "1")+
	"\11"+((gid('sound_line').checked)? "2" : "1")+
	"\11"+((gid('sound_toyou').checked)? "2" : "1")+
	"\11"+((gid('info_in').checked)? "2" : "1")+
	"\11"+((gid('info_out').checked)? "2" : "1")+
	"\11"+((gid('info_time').checked)? "2" : "1");
	
	save_cookie("ajaxchat",((name == noname)? "" : name) + "\11" + color + "\11" + myip + check,((gid('cookie').checked)? 365 : -1),"/");
}

function check()
{
	if (document.all)
	{
		gid('c').caretPos = document.selection.createRange().duplicate();
	}
	
	var str = "";
	if (gid('ten').checked) {str += "、";}
	if (gid('maru').checked) {str += "。";}
	if (gid('sp').checked) {str += " 　";}
	if (str)
	{
		var reg = new RegExp("["+str+"]+$");
		if (gid('c').value.match(reg))
		{
			if (flg['stay']) gid('c').blur();
			post();
		}
	}
}

function c_focus()
{
	if (flg['stay']) gid('c').focus();
}

function leave(nopost)
{
	if (flg['stay'] && !flg['popupping'])
	{
		flg['stay'] = 0;
		if (!nopost || flg['nopost_leave']) post(false,'out');
		gid('name').innerHTML = name_html;
		gid('n').disabled = false;
		gid('n').value = (name)? name : "";
		gid('btn_send').disabled = true;
		flg['post'] = false;
		//stay(true);
	}
}

function c_onfocus(obj)
{
	active_elm = obj;
	
	if (!flg['stay'])
	{
		gid('c').value = "";
		flg['stay'] = 1;
		post(false,'in');
		gid('c').focus();
		gid('btn_send').disabled = false;
	}
}

function setting(cmd)
{
	if (cmd == "open")
	{
		gid('setting').style.visibility = "visible";
		gid('setting').focus();
	}
	else
	{
		gid('setting').style.visibility = "hidden";
		cookie_write();
		((flg['stay'])? gid('c'):window).focus();
	}
}

function showinfo(cmd)
{
	if (cmd == "open")
	{
		gid('infobody').innerHTML = "<p>Version: " + version + "<br>" + "LogID: "+logid + "<br>" + "YourID: " + myip + "</p>" + tag['scriptinfo'];
		gid('infobox').style.visibility = "visible";
	}
	else
	{
		gid('infobox').style.visibility = "hidden";
	}
	((flg['stay'])? gid('c'):window).focus();
}

// クエリ文字列を解析配列に格納
function CreateQuetyStringList()
{
	if (location.search.length > 1)
	{
		var m_Array = location.search.substr(1).split("&"); 
		for (idx in m_Array)
		{
			temp = m_Array[idx].split("=");
			QueryString[temp[0]] = decodeURIComponent(temp[1]);
		}
	}
}

function key_press(e)
{
	if (!gid('ent').checked) return;
	var dom = true;
	if (!e)
	{
		var e = window.event;
		dom = false;
	}
	var mykey = e.keyCode;
	if (!e.shiftKey && mykey == 13)
	{
		try
		{
			e.stopPropagation(); 
			e.preventDefault();
		}
		catch(err)
		{
			e.cancelBubble=true;
			e.returnValue=false;
		}
		post();
		//return false;
	}
}

function save_cookie(arg1,arg2,arg3,arg4){ //arg1=dataname arg2=data arg3=expiration days
	if(arg1&&arg2)
	{
		if(arg3)
		{
			xDay = new Date;
			xDay.setDate(xDay.getDate() + eval(arg3));
			xDay = xDay.toGMTString();
			_exp = ";expires=" + xDay;
		}
		else
		{
			_exp ="";
		}
		
		if(arg4)
		{
			_exp += ";path=" + arg4;
		}
		else
		{
			_exp += ";path=/";
		}
		
		if (QueryString['cdu'] == "on")
		{
			_exp += ";domain=" + escape(document.domain.replace(/^[^.]+./,""));
		}
		
		document.cookie = escape(arg1) + "=" + escape(arg2) + _exp + ";";
	}
}

function load_cookie(arg){ //arg=dataname
	if(arg)
	{
		cd = document.cookie.split("; ");
		
		arg = escape(arg);
		i = 0;
		while (cd[i])
		{
			var co = cd[i].split("=");
			if (co[0] == arg)
			{
				cd = unescape(co[1]);
				//save_cookie(arg,cd,365,"/");
				// 以前のバージョンは \0 をセパレーターとしていた。Ver 1.52以前
				// nullバイトは何かと問題あるので、\11(水平タブ)に変更。(Ver 1.53)
				if (cd.match(/\0/))
				{
					return cd.split("\0");
				}
				else
				{
					return cd.split("\11");
				}
			}
			i++;
		}
	}
	return false
}

function set_color(col,init)
{
	var obj = gid('color');
	// 以前のバージョンのクッキー
	if (col == "0")
	{
		color = "";
		return;
	}
	if (!col)
	{
		obj.style.visibility = "visible";
		if (!init && flg['stay']) gid('c').focus();
		return;
	}
	
	if (col == "X")
	{
		obj.style.visibility = "hidden";
		if (!init && flg['stay']) gid('c').focus();
		return;
	}
	
	if (col == "C")
	{
		color = "";
		gid('colorset').style.color = "";
		gid('c').style.color = "";
		obj.style.visibility = "hidden";
		if (!init && flg['stay']) gid('c').focus();
		return;
	}

	color = col;
	gid('colorset').style.color = col;
	gid('c').style.color = col;
	obj.style.visibility = "hidden";
	if (!init && flg['stay']) gid('c').focus();
	return;
}

function log_onscroll()
{
	elm = gid('logbase');
	//alert (elm.scrollTop);
	if ((logtop - elm.scrollTop) > 30)
	{
		flg['stopscroll'] = true;
	}
	else
	{
		flg['stopscroll'] = false;
	}
	
}

function ins_face(v)
{
	elm = gid('c');
	if (!v)
	{
		gid('face').style.visibility = "visible";
		if (flg['stay']) elm.focus();
		return;
	}
	if (v == "X")
	{
		gid('face').style.visibility = "hidden";
		if (flg['stay']) elm.focus();
		return;
	}
	else
	{
		v = " " + v + " ";
	}
	if (!flg['stay'])
	{
		alert(msg['error_set']);
		return;
	}
	if (window.opera)
	{
		var ss = elm.selectionStart;
		var se = elm.selectionEnd;
		var s1 = (elm.value).substring(0,ss);
		var s2 = (elm.value).substring(se,elm.textLength);
		var s3 = (elm.value).substring(elm.selectStart, elm.selectEnd);
		if (!s1 && !s2 && !s3) s1 = elm.value;
		elm.value = s1 + v + s2;
		se = se + v.length;
		elm.setSelectionRange(se, se);
	}
	else if (document.all)
	{
		elm.caretPos.text += v;
	}
	else
	{
		var ss = elm.selectionStart;
		var se = elm.selectionEnd;
		var s1 = (elm.value).substring(0,ss);
		var s2 = (elm.value).substring(se,elm.textLength);
		var s3 = (elm.value).substring(elm.selectStart, elm.selectEnd);
		if (!s1 && !s2 && !s3) s1 = elm.value;
		elm.value = s1 + s3 + v + s2;
		se = se + v.length;
		elm.setSelectionRange(se, se);
	}
	if (flg['stay']) elm.focus();
}

function window_reload()
{
	flg['nopost_leave'] = true;
	location.reload();
}

function stay_pos(val)
{
	if (val == "r")
	{
		staypos = "r";
	}
	else
	{
		staypos = "t";
	}
	if (!flg['stay_check']) {stay(true);}
	set_stay();
	if (!flg['stopscroll'])
	{
		logtop = parseInt(gid('log').offsetHeight) - parseInt(gid('logbase').offsetHeight);
		gid('logbase').scrollTop =logtop;
	}
	((flg['stay'])? gid('c'):window).focus();
}

function kick_req(id,name)
{
	name = name + " [ID: "+id+" ]";
	if (confirm(msg['kick_req'].replace("$1",name)))
	{
		var _tip = tip;
		tip = id;
		post(false,"kick");
		tip = _tip;
		alert(msg['kick_done'].replace("$1",name));
	}
}

function htmlspecialchars(str)
{
	return str.
	replace(/&/g,"&amp;").
	replace(/</g,"&lt;").
	replace(/>/g,"&gt;").
	replace(/"/g,"&quot;").
	replace(/&amp;#x200B;/g,"&#x200B;");
	//'
}

function unhtmlspecialchars(str)
{
	return str.
	replace(/&lt;/g,"<").
	replace(/&gt;/g,">").
	replace(/&quot;/g,'"').
	replace(/&amp;/g,"&");
	//'
}
