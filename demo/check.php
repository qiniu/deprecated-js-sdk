<?php
require_once("php-sdk/qiniu/rs.php");
// $accessKey = '6Ua-pviUhl0k75Juee5wOxb4LxXC_iGUxJQFBtzf';
// $secretKey = 'L_KNbmmO2nKPLlJOG1TxHvP4q56F3-lx_PhEs4zL';
// $bucket = "test";


// if($_POST["accessKey"]&&$_POST["secretKey"]&&$_POST["bucket"]){
// 	$accessKey = $_POST["accessKey"];
// 	$secretKey = $_POST["secretKey"];
// 	$bucket = $_POST["bucket"];
// }

$accessKey = 'iN7NgwM31j4-BZacMjPrOQBs34UG1maYCAQmhdCV';
$secretKey = '6QTOr2Jg1gcZEWDQXKOGZh5PziC2MCV5KsntT70j';
$bucket = "qtestbucket";
$key = $_GET['key'];
$client = new Qiniu_MacHttpClient(null);
echo json_encode(Qiniu_RS_Stat($client,$bucket,$key));

?>