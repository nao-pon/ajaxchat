<?php
// AjaxChat - write.php by XOOPSマニア(nao-pon)
// XOOPSマニア: http://hypweb.net/xoops/

//過去ログファイル作成基準
define('LOG_FILE_MAX', 1000000); // 約1MBを超えたら過去ログを作成
define('LOG_FILE_MIN', 50000);   // 約50KB分現行ログに残す

//キック申請関連
define('KICK_DAY_LIMIT' , 7); // キック申請の有効日数
define('KICK_ENABLE'    , 3); // キック申請を有効化する申請数

//禁止文字列 半角スペース区切り
define('NG_WORDS' ,'http://jin-kita/ http://sfutjhhdiqdiqo.jdo 1month-gaz http://aityann.onagazou ｈｔｔｐ：//ｗｗｗ。ｋａｅ＆ｚｉｎｎ http://home.megapass.net http://www.zin.tomohisa http;//watashiha.yurusanai');

// ajaxshat.js 要求バージョン
$jsver = 2.3;

error_reporting(0);

//文字エンコード
define('SOURCE_ENCODING','UTF-8');

//mb_string ini_set
ini_set("mbstring.substitute_character"," ");
ini_set("mbstring.http_input","pass");
ini_set("mbstring.http_output","pass");
ini_set("mbstring.internal_encoding",SOURCE_ENCODING);

$_POST = input_filter($_POST);

if (isset($_POST['encode_hint']) && $_POST['encode_hint'] != '')
{
	$encode = mb_detect_encoding($_POST['encode_hint']);
	if (SOURCE_ENCODING != strtoupper($encode))
	{
		mb_convert_variables(SOURCE_ENCODING, $encode, $_POST);
	}
}

// 初期化
$name = (empty($_POST['n']))? "" : htmlspecialchars($_POST['n']);
list($name,$trip) = convert_trip($name);
$comment = (empty($_POST['c']))? "" : htmlspecialchars($_POST['c']);
$id = (empty($_POST['id']))? 0 : (int)$_POST['id'];
$tip = (empty($_POST['tip']))? "" : $_POST['tip'];
$tname = (empty($_POST['tn']))? "" : $_POST['tn'];
$color = (empty($_POST['color']))? "" : $_POST['color'];
$ver = (empty($_POST['ver']))? 0 : $_POST['ver'];
$myip = (empty($_POST['myip']))? substr(crypt($_SERVER["REMOTE_ADDR"]),-10) : $_POST['myip'];
$cmd = (empty($_POST['cmd']))? "" : $_POST['cmd'];
$g_name = (empty($_POST['gn']))? "" : htmlspecialchars($_POST['gn']);
$kick_write = false;
$denys = array();

$ip = $_SERVER["REMOTE_ADDR"];

$comment = preg_replace("/[\r\n]+$/","",$comment);
$comment = preg_replace("/[\r\n]+/","<br>",$comment);
$comment = preg_replace("/^[\s]+$/","",$comment);

//管理人登録 KickID 取得
$kick_admin = "./log/kick_admin.txt";
if (file_exists($kick_admin))
{
	$denys = file($kick_admin);
	$denys = array_map('rtrim',$denys);
}

//Kickデータ取得
$kickdat = "./log/kick.dat";
$kicklog = "./log/kick.log";

$kickdat_time = (file_exists($kickdat))? filemtime($kickdat) : 0;
$kicklog_time = (file_exists($kicklog))? filemtime($kicklog) : 0;

$_denys = array();
if ($cmd == "kick" || $kickdat_time >= $kicklog_time)
{
	if (file_exists($kickdat))
	{
		$kicks = unserialize(join('',file($kickdat)));
	}
	else
	{
		$kicks = array();
	}
	if ($kicks)
	{
		foreach($kicks as $tid => $kick)
		{
			foreach($kick as $fid => $time)
			{
				if (time() > $time + 86400 * KICK_DAY_LIMIT)
				{
					unset($kicks[$tid][$fid]);
					$kick_write = true;
				}
			}
			
			if (count($kicks[$tid]) < 1)
			{
				unset($kicks[$tid]);
				$kick_write = true;
			}
			
			if (count($kicks[$tid]) >= KICK_ENABLE)
			{
				$_denys[] = $tid;
				foreach($kicks[$tid] as $fid2 => $_time)
				{
					$kicks[$tid][$fid2] = time();
				}
			}
		}
	}
	//キャッシュ保存
	$fp = null;
	$cnt = 0;
	while(!$fp && $cnt++ < 10)
	{
		if ($fp = fopen($kicklog, "wb"))
		{
			flock($fp,LOCK_EX);
			fwrite($fp,join("\n",$_denys));
			flock($fp,LOCK_UN);
			fclose($fp);
		}
	}
}
else
{
	//キャッシュから取得
	$_denys = file($kicklog);
	$_denys = array_map('rtrim',$_denys);
}
$denys = array_merge($denys,$_denys);
$denys = array_unique($denys);

//Kick判定
if (in_array($myip,$denys))
{
	$id = false;
	$cmd = "";
}

// Kick依頼
if ($cmd == "kick" && $tip && $myip)
{
	$kicks[$tip][$myip] = time();
	$kick_write = true;
	$id = false;
}

if ($kick_write)
{
	$fp = null;
	$cnt = 0;
	while(!$fp && $cnt++ < 10)
	{
		if ($fp = fopen($kickdat, "wb"))
		{
			flock($fp,LOCK_EX);
			fwrite($fp,serialize($kicks));
			flock($fp,LOCK_UN);
			fclose($fp);
		}
	}
}

// 禁止文字列の判定
if (preg_match("#(".str_replace(" ","|",preg_quote(NG_WORDS,"#")).")#i",$comment))
{
	$id = false;
	$cmd = "";
	$comment = "";
}

// 名前の正規化
$name = mb_convert_kana($name, "s", SOURCE_ENCODING);
$g_name = mb_convert_kana($g_name, "s", SOURCE_ENCODING);
$name = trim(preg_replace("/[\s]+/"," ",$name));
$g_name = trim(preg_replace("/[\s]+/"," ",$g_name));
if (!$name && !$g_name) $id = false;

// 発言・入退出処理
if ($id && ($comment || $cmd))
{
	$data = "";
	$logfile = "./log/log_".$id.".utxt";
	$trip = ($trip)? "<>".$trip : "";
	
	if ($comment)
	{
		$data = time()."<>".$name."<>".$comment."<>".$_SERVER["REMOTE_ADDR"]."<>".$tip."<>".$tname."<>".$myip."<>".$color.$trip."\n";
	}
	else if ($cmd == "in")
	{
		$data = time()."<>_iN_<>".(($name)?$name:$g_name)."<><><><>".$myip."\n";
	}
	else if ($cmd == "out")
	{
		$data = time()."<>_oUt_<>".(($name)?$name:$g_name)."<><><><>".$myip."\n";
	}
	if ($ver < $jsver)
	{
		if ($ver < 1.0)
		{
			$tip = $ip;
		}
		else
		{
			$tip = $myip;
		}
		$data .= time()."<>_uP_<>".$jsver."<><>".$tip."<>".preg_replace("/#$/","",$name)."<>\n";
	}
	//$data = input_filter(mb_convert_encoding($data,"UTF-8",SOURCE_ENCODING));

	if ($data)
	{
		
		$fp = null;
		$cnt = 0;
		while(!$fp && $cnt++ < 10)
		{
			// ログファイルのサイズをチェック
			$fsize = filesize($logfile);
			$logfull = ($fsize && $fsize > LOG_FILE_MAX)? ture : false;
			
			$mode = ($logfull)? "a+b" : "ab";
			if ($fp = fopen($logfile, $mode))
			{
				flock($fp,LOCK_EX);
				
				if ($logfull)
				{
					$bakfile = "./bak/bak_".$id."_".time().".utxt";
					copy($logfile,$bakfile);
					fseek ($fp, $fsize - LOG_FILE_MIN);
					$newlog = fread ($fp,LOG_FILE_MIN);
					list($tmp, $newlog) = explode("\n", $newlog, 2);
					$data = $newlog.$data;
					ftruncate($fp, 0);
				}
				
				fwrite($fp,$data);
				flock($fp,LOCK_UN);
				fclose($fp);
			}
		}
	}
}
if ($ver < 1.0)
{
	exit($ip);
}
else
{
	exit($myip." ".time());
}

function input_filter($param)
{
	static $magic_quotes_gpc = NULL;
	if ($magic_quotes_gpc === NULL)
	    $magic_quotes_gpc = get_magic_quotes_gpc();

	if (is_array($param)) {
		return array_map('input_filter', $param);
	} else {
		$result = str_replace("\0", '', $param);
		if ($magic_quotes_gpc) $result = stripslashes($result);
		return $result;
	}
}

// #以降をトリップに変換して # で分割した配列で返す
function convert_trip($val)
{
	$match = array();
	if (preg_match('/([^#]+#)(.+)/', $val, $match))
	{
		$name = $match[1];
		$key = $match[2];
		$salt = substr(substr($key,1,2).'H.',0,2);
		$salt = strtr($salt,':;<=>?@[\]^_`','ABCDEFGabcdef');
		$salt = preg_replace('/[^\dA-Za-z]/', '.', $salt);
		return array($name,substr(crypt($key,$salt), -10));
	}
	else
	{
		return array($val,'');
	}
}
?>