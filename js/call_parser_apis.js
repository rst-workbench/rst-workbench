// based on: https://www.mkyong.com/jquery/jquery-ajax-submit-a-multipart-form/
$(document).ready(function () {

    //Program a custom submit function for the form
    $("form#rst").submit(function(event){

        //stop submit the form, we will post it manually.
        event.preventDefault();

        //grab form data
        var input = $('#input-text').val()
        var formData = new FormData();
        formData.append('input', input);
        formData.append('output_format', 'original');

        console.log('input: ', input); // TODO: rm after debug

        // disable the submit button temporarely
        $("#btnSubmit").prop("disabled", true);

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

                $("#results").append('<div><pre>\n' + data + '\n</pre></div>');
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
