<?php
include "baidu_transapi.php";

if (!$query = ($_GET['query'] ?? null)) {
    echo json_encode(["error" => true, "message" => "nothing to translate!"]);
    exit(0);
}
$res = translate($query, "en", "zh");
if ($data = ($res['trans_result'][0]['dst'] ?? null)) {
    echo $data;
}else{
    var_dump($res);
}
