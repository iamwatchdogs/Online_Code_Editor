<?php

// For handling`POST` Request 
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Retrieve the raw POST data
    $postData = file_get_contents('php://input');

    // Check if the POST data is not empty
    if (!empty($postData)) {

        // Decode the JSON data
        $_POST = json_decode($postData, true);

        // Check if the POST data is valid JSON
        if($_POST === null) {
            $_POST['error'] = 'Server Error: Failed to decode JSON data (core.php:Line No.13)';  
        }

    } else if(!isset($_POST['code'])) {

        // Error Log
        $fetch_error_log = 'Server Error: Failed to fetch the data (script.js:Line No.199|core.php:Line No.13)';

        // Appending to existing log
        if($_POST['error'] === '') {
            $_POST['error'] = $fetch_error_log;
        } else {
            $_POST['error'] = $_POST['error'] . ' | ' . $fetch_error_log;
        }
    }
    
    // if there is no input parameter in POST request, we'll pass out empty string.
    if (!isset($_POST['input'])){
        $_POST['input'] = "";
    };
    
    $input_code = $_POST['code'];
    
    // Converting POST request into URL-encoded query string.
    $payload = http_build_query($_POST);
    
    // Initializing cURL request to the Codex API.
    $curl = curl_init();
    
    // Setting cURL options.
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.codex.jaagrav.in',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => array(
            'Content-Type: application/x-www-form-urlencoded'
        ),
    ));
    
    // Executing the cURL Request though CodeX API.
    $response = curl_exec($curl);
    
    // Basic Error Handling
    if (curl_errno($curl)) {

        // Error Log
        $curl_error_log = 'Server Error: ' . curl_error($curl) . ' (core.php:Line No.44-63)';

        // Appending to existing log
        if($_POST['error'] === '') {
            $_POST['error'] = $curl_error_log;
        } else {
            $_POST['error'] = $_POST['error'] . ' | ' . $curl_error_log;
        }
    }
    
    // Safely closing cURL connection.
    curl_close($curl);

    // Converting into JSON format
    $responseData = json_decode($response,true);

    // Testing the converted respose
    if ($responseData !== null) {
        $responseData['input_code'] = $input_code;
    } else { 
        $respose_decode_error_log = 'Server Error: Failed to decode response to JSON format (core.php:Line No.83)';
        $responseData = array(
            'input_code' => $_POST['code'],
            'error' => ($_POST['error'] === '') ? $respose_decode_error_log : $_POST['error'] . ' | ' . $respose_decode_error_log
        );
    }

    header('Content-Type: application/json');
    echo json_encode($responseData);
}
?>