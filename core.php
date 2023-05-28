<?php

// For handling`POST` Request 
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Retrieve the raw POST data
    $postData = file_get_contents('php://input');

    // Check if the POST data is not empty
    if (!empty($postData)) {

        // Decode the JSON data
        $_POST = json_decode($postData, true);

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
        echo 'Error: ' . curl_error($curl);
    }
    
    // Safely closing cURL connection.
    curl_close($curl);

    // Converting into JSON format
    $responseData = json_decode($response,true);

    // Testing the converted respose
    if ($responseData !== null) {
        $responseData['input_code'] = $input_code;
    } else { 
        $responseData = array(
            'input_code' => $_POST['code'],
            'error' => 'Failed'
        );
    }

    header('Content-Type: application/json');
    echo json_encode($responseData);
}
?>