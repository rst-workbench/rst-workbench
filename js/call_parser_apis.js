// based on: https://www.mkyong.com/jquery/jquery-ajax-submit-a-multipart-form/
$(document).ready(function () {

    //Program a custom submit function for the form
    $("form#rst").submit(function(event){
         $("#results").empty(); // reset results

        //stop submit the form, we will post it manually.
        event.preventDefault();

        //store text that the user entered into <textarea id='input-text'>
        var input = $('#input-text').val()
        // store the output format that the user selected from <select id="output-format">
        var outputFormat = $('#output-format').val()
        var formData = new FormData();
        formData.append('input', input);
        formData.append('output_format', outputFormat);

        console.log('input: ', input); // TODO: rm after debug

        // disable the non-js submit button temporarely
        $("#btnSubmit").prop("disabled", true);

        // send the form data via a POST request
        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "http://localhost:9001/parse",
            data: formData,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success: function (data) {
                handleParserOutput(data, outputFormat);
                console.log("SUCCESS : ", data);
                $("#btnSubmit").prop("disabled", false);
            },
            error: function (e) {
                $("#results").text(e.responseText);
                console.log("ERROR : ", e);
                $("#btnSubmit").prop("disabled", false);
            }
        });

    });

});

// handleParserOutput takes the output of an RST parser, converts it if needed
// and adds it to the <div id="results"> section
function handleParserOutput(outputString, outputFormat) {
    if (outputFormat == 'nltk-tree-png') {
        $("#results").append('<div><img alt="Embedded Image" src="data:image/png;base64,' + outputString + '" /></div>');
    } else if (outputFormat == 'rs3') {
        addRS3toResults(outputString);
    } else {
        $("#results").append('<div><pre>\n' + outputString + '\n</pre></div>');
    }
}


function addRS3toResults(rs3String) {
    var formData = new FormData();
    formData.append('input', rs3String);

    // console.log('input: ', input);

    // send the form data via a POST request
    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: "http://localhost:9100/rs3_to_png",
        data: formData,
        processData: false,
        contentType: false,
        cache: false,
        timeout: 600000,
        success: function (data) {
            console.log("convertRS3toPNG SUCCESS : ", data);
            addPNGtoResults(data);
        },
        error: function (e) {
            $("#results").text(e.responseText);
            console.log("convertRS3toPNGERROR : ", e);
        }
    });
}

function addPNGtoResults(pngBase64) {
    $("#results").append('<div><img alt="Embedded Image" src="data:image/png;base64,' + pngBase64 + '" /></div>');
}
