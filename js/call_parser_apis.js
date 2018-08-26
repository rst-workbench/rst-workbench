// intercept clicks on the submit button of <form id='rst'> and send the form
// content to several RST parsers, convert their output to the given format
// and add that output to the results section of the site.
//
// based on: https://www.mkyong.com/jquery/jquery-ajax-submit-a-multipart-form/
$(document).ready(function () {

    //Program a custom submit function for the form
    $("form#rst").submit(function(event){
         // FIXME: this was disabled b/c it also reacted to the edit button
         //~ $("#results").empty(); // reset results

        //stop submit the form, we will post it manually.
        event.preventDefault();

        //store text that the user entered into <textarea id='input-text'>
        var input = $('#input-text').val()
        // store the output format that the user selected from <select id="output-format">
        var outputFormat = $('#output-format').val()
        var formData = new FormData();
        formData.append('input', input);
        formData.append('output_format', outputFormat);

        console.log('input: ', input);

        // disable the non-js submit button temporarely
        $("#btnSubmit").prop("disabled", true);

        postForm("http://localhost:9001/parse", formData, "codra-service", outputFormat, onParserSuccess, onParserError);
        postForm("http://localhost:9002/parse", formData, "dplp-service", outputFormat, onParserSuccess, onParserError);
        // postForm("http://localhost:9999/parse", formData, "does-not-exist", outputFormat, onParserSuccess, onParserError);

    });
});

// postForm runs the text from the input form through the given RST parser,
// transforms the output into the given format and adds the output into the
// results section.
function postForm(url, formData, serviceName, outputFormat, successFunc, errorFunc) {
    // send the form data via a POST request
    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: url,
        data: formData,
        processData: false,
        contentType: false,
        cache: false,
        timeout: 600000,
        success: function(data) { return successFunc(data, outputFormat, serviceName); },
        error: function(e){ return errorFunc(e, serviceName); }
    });
}

// onParserSuccess is called when the RST parser returned a result.
// The result is then given to `handleParserOutput()`
// and the submit button of the form is re-enabled.
function onParserSuccess(data, outputFormat, parserName) {
    // transform output and add it to results section
    handleParserOutput(data, outputFormat, parserName);
    console.log("Parser success : ", data);
    // re-enable submit button
    $("#btnSubmit").prop("disabled", false);
}

// onParserError is called when the RST parser returned an error.
// The error message is then added to the results section
// and the submit button of the form is re-enabled.
function onParserError(e, parserName) {
    $("#results").append('<h2>' + parserName + ':</h2>\n\n');
    $("#results").append('<pre>\nParser error:\n' + JSON.stringify(e, null, 2) + '\n</pre>\n\n');
    console.log("Parser error : ", e);
    // re-enable submit button
    $("#btnSubmit").prop("disabled", false);
}


// handleParserOutput takes the output of an RST parser, converts it if needed
// and adds it to the <div id="results"> section.
function handleParserOutput(outputString, outputFormat, parserName) {
    $("#results").append('<h2>' + parserName + ':</h2>\n\n');
    if (outputFormat == 'nltk-tree-png') {
        $("#results").append('<div><img alt="Embedded Image" src="data:image/png;base64,' + outputString + '" /></div>');
    } else if (outputFormat == 'rs3') {
        addRS3toResults(outputString);
    } else {
        $("#results").append('<div><pre>\n' + outputString + '\n</pre></div>');
    }
}

// addRS3toResults takes the content of an .rs3 file,
// calls the rstweb-service to convert it into an image
// and adds that image to the result section.
// In addition, a button for downloading the rs3 file
// is shown.
function addRS3toResults(rs3String) {
    var formData = new FormData();
    formData.append('input', rs3String);

    // console.log('input: ', input);

    // send the form data via a POST request
    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: "http://localhost:9200/convert",
        data: formData,
        processData: false,
        contentType: false,
        cache: false,
        timeout: 600000,
        success: function (data) {
            console.log("convertRS3toPNG SUCCESS : ", data);
            addRS3DownloadButton(rs3String);
            addPNGtoResults(data);
        },
        error: function (e) {
            $("#results").text(e.responseText);
            console.log("convertRS3toPNGERROR : ", e);
        }
    });
}

// This function adds a button to the site that let's
// a user download a given text as a file.
// By default, the file will be stored on the user's
// computer under the given filename.
//
// source: https://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// addRS3DownloadButton adds a button to download the given
// rs3 file to the results section.
function addRS3DownloadButton(rs3String) {
    $("#results").append(
`<form onsubmit="download('result.rs3', this['text'].value)">
  <textarea name="text" style='display:none;'>${rs3String}</textarea>
  <input type="submit" value="Download .rs3 file">
</form>`
    );
}


// addPNGtoResults adds an image to the results section
// given the base64 representation of that image.
function addPNGtoResults(pngBase64) {
    $("#results").append('<div><img alt="Embedded Image" src="data:image/png;base64,' + pngBase64 + '" /></div>');
}


// FIXME: implement addRSTWebEditOptionToResults
//~ function addRSTWebEditOptionToResults(rs3String) {
    //~ $("#results").append(
//~ `<form id='editor' method='post'>
    //~ <textarea id='input-rs3' style='display:none;'>${rs3String}</textarea>
    //~ <input type='submit' id='RSTWebSubmitButton' value='Edit in rstweb'/>
//~ </form>`);
//~ }
