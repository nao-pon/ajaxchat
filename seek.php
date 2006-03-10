<?php
// AjaxChat - seek.php by XOOPSマニア(nao-pon)
// XOOPSマニア: http://hypweb.net/xoops/
// 
// Opera では、setRequestHeader が利用できないので
// その Opera 用専用の seek->get プログラム


$s = (empty($_GET['s']))? 0 : (int)$_GET['s'];
$e = (empty($_GET['e']))? 0 : (int)$_GET['e'];
$id = (empty($_GET['id']))? 0 : (int)$_GET['id'];
$med = (empty($_GET['med']))? "" : (strtoupper($_GET['med']));
$t = (empty($_GET['t']))? 0 : (int)$_GET['t'];

if (time() - $t > 2)
{
	header("HTTP/1.0 403 Forbidden");
	exit();
}

$file = "./log/log_".$id.".utxt";
if (file_exists($file))
{
	$filesize = filesize($file);
}
else
{
	$filesize = 0;
	$med = "HEAD";
}
$data = "";

if ($med != "HEAD" && $filesize > $s)
{
	if ($fp = fopen($file, "r"))
	{
		if ($s && $e)
		{
			$size = $e - $s + 1;
			$start = $s;
		}
		else if ($s)
		{
			$size = $filesize;
			$start = $s;
		}
		else if ($e)
		{
			$size = $e + 1;
			$start = 0;
		}
		else
		{
			$size = $filesize;
			$start = 0;
		}
		fseek ($fp, $start);
		$data = fread ($fp,$size);
		fclose ($fp);
	}
}
header ('Content-Disposition: inline; filename="log_'.$id.".utxt".'"');
header ('Content-Type: text/plain; charset=utf-8');
if ($med == "HEAD")
{
	header ('Content-Range: bytes 0-0/'.$filesize);
	header ('Content-Length: 0');
	$data = "";
}
else if ($s || $e) 
{
	if (!$e) $e = $filesize - 1;
	header ('Content-Range: bytes '.$s.'-'.$e.'/'.$filesize);
	header ('Content-Length: '.strlen($data));

}
else
{
	header ('Content-Length: '.$filesize);
}
echo $data;
exit;
?>