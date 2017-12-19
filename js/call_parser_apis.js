var xhr = new XMLHttpRequest();

xhr.open("POST", "http://localhost:8000/parse")

var data = new FormData();
data.append('input', 'Altough they didn\'t like him, they accepted the offer.');
data.append('output_format', 'original');

xhr.send(data);
xhr.onreadystatechange = function (e) {
    //~ alert(xhr.response);
    var main = $("#results");
    main.append('<pre>' + xhr.response + '</pre><br />');
}




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
