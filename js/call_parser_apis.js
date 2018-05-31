// based on: https://www.mkyong.com/jquery/jquery-ajax-submit-a-multipart-form/
$(document).ready(function () {

    //Program a custom submit function for the form
    $("form#rst").submit(function(event){

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
            url: "http://localhost:8000/parse",
            data: formData,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success: function (data) {

                // put the result in the <div id="results"> element
                if (outputFormat == 'nltk-tree-png') {
                    $("#results").append('<div><img alt="Embedded Image" src="data:image/png;base64,' + data + '" /></div>');
                } else {
                    $("#results").append('<div><pre>\n' + data + '\n</pre></div>');
                }

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
