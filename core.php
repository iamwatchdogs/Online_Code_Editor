<?php

// For handling`POST` Request 
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Defining error stack
    $_ERROR_STACK = array();

    // Retrieve the raw POST data
    if(!isset($_POST['code'])){
        $postData = file_get_contents('php://input');
    }
    // Check if the POST data is not empty
    if (isset($postData) && !empty($postData)) {

        // Decode the JSON data
        $_POST = json_decode($postData, true);

        // Check if the POST data is valid JSON
        if($_POST === null) {
            // Error Log
            $failed_request_decoding_log = 'Server Error: Failed to decode JSON data (core.php:Line No.13)';  

            // Adding to the error stack
            array_push($_ERROR_STACK, $failed_request_decoding_log);
        }

    } else if(!isset($_POST['code'])) {
        // Error Log
        $fetch_error_log = 'Server Error: Failed to fetch the data (script.js:Line No.199|core.php:Line No.13)';

        // Adding to the error stack
        array_push($_ERROR_STACK, $fetch_error_log);
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

        // Adding to the error stack
        array_push($_ERROR_STACK, $curl_error_log);
    }
    
    // Safely closing cURL connection.
    curl_close($curl);

    // Converting into JSON format
    $responseData = json_decode($response,true);

    // Testing the converted respose
    if ($responseData !== null) {
        $responseData['input_code'] = $input_code;
    } else { 
        // Error Log
        $respose_decode_error_log = 'Server Error: Failed to decode response to JSON format (core.php:Line No.83)';

        // Adding to the error stack
        array_push($_ERROR_STACK, $respose_decode_error_log);
    }

    // Checking for CodeX API's server failure
    if(isset($responseData['status']) && $responseData['status'] !== 200) {

        // Error Log
        $codex_api_error_log = 'Server Error: API Request failed with status code: ' . $responseData['status'] . ' (core.php:Line No.51)';

        // Adding to the error stack
        array_push($_ERROR_STACK, $codex_api_error_log);
    } 

    // Appending all the Error Log's to response
    $reducedErrorLog = array_reduce($_ERROR_STACK, function($errorLog1,$errorLog2) { return $errorLog1 . ' | ' . $errorLog2; }, 'Error Log(s):');
    $responseData['error'] = (isset($responseData['error']) && $responseData['error'] !== '') ? $reducedErrorLog . ' | ' . $responseData['error'] : $reducedErrorLog;

    header('Content-Type: application/json');
    echo json_encode($responseData);            /*  Returning the Response   */
}
?>