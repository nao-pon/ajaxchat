<?php
error_reporting(0);

//オンライン保持時間(秒)
define('ONLINE_TIME_LIMIT',65);

//mb_string ini_set
ini_set("mbstring.substitute_character","");
ini_set("mbstring.http_input","pass");
ini_set("mbstring.http_output","pass");

//文字エンコード
define('SOURCE_ENCODING','EUC-JP');

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

//PHPオブジェクトをJSONへ変換
function getjson($data) {

	$json = '{';
	foreach ($data as $k => $dat)
	{
		// JSONの構成
		if ($json != '{') $json .= ",\n  ";
		$json .=  '"' . $k .'"' . ':{';
		$json .= '"name":"' . jsencode(htmlspecialchars($dat['name'])) . '",';
		$json .= '"time":' . ($dat['time']? $dat['time'] : 0 );
		$json .= '}';
	}
	$json .= '}';
	$to = "UTF-8";
	$json = mb_convert_encoding($json, $to, SOURCE_ENCODING);
	return $json;
}

//JSON向けエンコード
function jsencode($str) {
	$str = preg_replace('/(\x22|\x2F|\x5C)/', '\\\$1', $str);
	$str = preg_replace('/\x08/', '\b', $str);
	$str = preg_replace('/\x09/', '\t', $str);
	$str = preg_replace('/\x0A/', '\n', $str);
	$str = preg_replace('/\x0C/', '\f', $str);
	$str = preg_replace('/\x0D/', '\r', $str);
	return $str;
}

if (!empty($_POST['encode_hint']))
{
	$encode = mb_detect_encoding($_POST['encode_hint']);
	mb_convert_variables(SOURCE_ENCODING, $encode, $_POST);
}

$_POST = input_filter($_POST);

//$name = (empty($_POST['n']))? "" : htmlspecialchars($_POST['n']);
$name = (empty($_POST['n']))? "" : $_POST['n'];
$id = (empty($_POST['id']))? 0 : (int)$_POST['id'];
$myip = (empty($_POST['ucd']))? $_SERVER["REMOTE_ADDR"] : $_POST['ucd'];

$stayfile = "./stay/stay_".$id.".dat";

// 現在の情報読み込み
if (file_exists($stayfile))
{
	$data = unserialize(join('',file($stayfile)));
}
else
{
	$data = array();
}

if ($data)
{
	foreach($data as $ip => $dat)
	{
		if ($dat['time'] < time() - ONLINE_TIME_LIMIT)
		{
			unset($data[$ip]);
		}
	}
}
$data[$myip]['time'] = time();
$data[$myip]['name'] = $name;

$fp = null;
$cnt = 0;
while(!$fp && $cnt++ < 6)
{
	if ($fp = fopen($stayfile,"wb"))
	{
		flock($fp,LOCK_EX);
		fwrite($fp,serialize($data));
		flock($fp,LOCK_UN);
		fclose($fp);
	}
	else
	{
		sleep(1);
	}
}
header ('Content-Type:text/plain; charset=UTF-8');
echo getjson($data);
?>