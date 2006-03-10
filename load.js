var ajaxchat_id = (!ajaxchat_id)? 1 : parseInt(ajaxchat_id);
var ajaxchat_height = (!ajaxchat_height)? 400 : parseInt(ajaxchat_height);
var ajaxchat_staypos = (!ajaxchat_staypos)? 't' : ajaxchat_staypos;
var ajaxchat_url = (!ajaxchat_url)? './' : ajaxchat_url;
var ajaxchat_cookie_domain_up = (!ajaxchat_cookie_domainlevel_up || ajaxchat_cookie_domainlevel_up != "on")? "off" : "on";

var ajaxchat_title = encodeURIComponent(document.title);
document.write('<iframe src="'+ajaxchat_url+'ajaxchat.htm?id='+ajaxchat_id+'&amp;staypos='+ajaxchat_staypos+'&amp;title='+ajaxchat_title+'&amp;cdu='+ajaxchat_cookie_domain_up+'" width="100%" height="'+ajaxchat_height+'" style="border:none;" frameborder="0" border="0" allowtransparency="true" scrolling="no"></iframe>');
