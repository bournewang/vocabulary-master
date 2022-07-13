<?php
// echo "words:" . ($_GET["word"] ?? null);
// var_dump($_GET);
if ($word = (isset($_GET["word"]) ? $_GET["word"] : null) ) {
    $dir = "archive";
    $filename = $dir . "/" . $word . ".html";
    if (!is_dir($dir)){
        mkdir($dir, 0755);
    }
    if (file_exists($filename)){
        echo file_get_contents($filename);
    } else {
        $url = "https://sentencedict.com/${word}.html";
        $html = file_get_contents($url);
        file_put_contents($filename, $html);
        echo $html;
    }

}else{
    echo json_encode(["error" => true, "message" => "you must specify a word."]);
}
