// source: https://www.mkyong.com/jquery/jquery-ajax-submit-a-multipart-form/
$(document).ready(function () {

    //Program a custom submit function for the form
    $("form#rst").submit(function(event){

        //stop submit the form, we will post it manually.
        event.preventDefault();

        // Get form
        //~ var form = $('#fileUploadForm')[0];

		// Create an FormData object
        //~ var data = new FormData(form);

        //grab form data
        var input = $('#input-text').val()
        var formData = new FormData();
        formData.append('input', input);
        formData.append('output_format', 'original');

        alert('input: ' + input);

		// If you want to add an extra field for the FormData
        //~ data.append("CustomField", "This is some extra data, testing");

		// disable the submit button
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

                $("#results").text(data);
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



/*
$(document).ready(function() {

    //Program a custom submit function for the form
    $("form#rst").submit(function(event){
       
        //disable the default form submission
        event.preventDefault();

        //~ alert('submit!1!!');
             
        //grab form data
        var input = $('#input-text').val()
        var formData = new FormData();
        formData.append('input', input);
        formData.append('output_format', 'original');

        alert('input: ' + input);

        $.ajax({
            url: 'http://localhost:8000/parse',
            type: 'POST',
            data: formData,
            //~ async: false,
            cache: false,
            contentType: false,
            processData: false,
            success: function (returndata) {
                alert(returndata);
            },
            error: function (returndata) {
                alert('ERROR:' + returndata);
            }
        });
     
      return false;
    });

});
*/


/*
contentType and processData are needed when passing multi-part forms as 
when one sets the contentType option to false, it forces jQuery to 
remove the Content-Type header, otherwise, the boundary string will be 
missing from it. Also, when submitting files via multi-part/form one 
must leave the processData flag set to false, otherwise, jQuery will 
try to convert your FormData into a string, which will fail.
*/


/*
var xhr = new XMLHttpRequest();

xhr.open("POST", "http://localhost:8000/parse")

var input = $('#input-text').val()

var data = new FormData();
data.append('input', input);
data.append('output_format', 'original');

xhr.send(data);
xhr.onreadystatechange = function (e) {
    //~ alert(xhr.response);
    var main = $("#results");
    main.append('<pre>' + xhr.response + '</pre><br />');
}
*/



/*
//Program a custom submit function for the form
$("form#rst").submit(function(event){
 
  //disable the default form submission
  event.preventDefault();
 
  //grab all form data  
  var formData = new FormData($(this)[0]);
 
  $.ajax({
    url: 'http://localhost:8000/parse',
    type: 'POST',
    data: formData,
    async: false,
    cache: false,
    contentType: false,
    processData: false,
    success: function (returndata) {
      alert(returndata);
    }
  });
 
  return false;
});
*/

/*
$(document).ready(function(){
   //Logic goes here
   var main = $("#results");

   $.ajax({
   	url: 'http://blog.fefe.de',
   	type: "GET",
   	success: function(response){
   		if (response.success) {

   				var listItem = '<pre>' + response + '</pre>';
   				main.append(listItem);
   			}

   		}
   		else{
   			alert("Oops, an error occured fetching the remote data.");
   		}
   	}
   });
});
*/
