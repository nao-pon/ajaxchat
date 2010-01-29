【名    称】

AjaxChat

【登 録 名】

ajaxchat_[Version].zip

【制作者名】

nao-pon
http://hypweb.net/
http://hypweb.net/xoops/modules/pukiwiki/2211.html

原案: 最速インターフェース研究会
http://la.ma.la/blog/diary_200507290022.htm

【動作環境】

サーバー環境: PHPが動作するサーバー
確認済みクライアント環境: InternetExplorer 6, FireFox 1.07(Windows), Opera 8.5(Windows)

【種    別】

フリーウェア

【概    要】

Ajax技術を利用した JavaScript + PHP による軽快チャットプログラムです。

【インストール】

解凍したファイル一式をサーバーにアップロードし、log, stay, bak ディレクトリのパーミッションを 777 など、httpd(Apache) がファイルを作成できる権限を与えてください。

【使用方法】

Webページから、下記の JavaScript と <iframe>で呼び出します。

<!--========== AjaxChat Start ==========-->
<script type="text/javascript">
<!--

	var ajaxchat_url     = './';
	var ajaxchat_id      = 1;
	var ajaxchat_staypos = 'r';
	var ajaxchat_height  = 350;
	var ajaxchat_cookie_domainlevel_up = "off";
	
	document.write('<script type="text/javascript" src="'+ajaxchat_url+'load.js"></script>');
//-->
</script>
<noscript>
	<iframe src="./ajaxchat.htm" width="100%" height="50" style="border:none;" frameborder="0" border="0" allowtransparency="true" scrolling="no"></iframe>
</noscript>
<!--========== AjaxChat End ==========-->

:パラメータの説明:
ajaxchat_url     = 'ajaxchat.htm の URL(外部サーバーでも可)';
ajaxchat_id      = [整数値]; 整数値を変えることで、部屋をいくつでも作成できます。
ajaxchat_staypos = '[t|r]';  閲覧者情報の初期位置 t=上部(省略時), r=左サイド
ajaxchat_height  = [整数値]; チャット部分の高さ(px)

=================================
Spanish translation by la9una
rauljesusl@gmail.com
=================================