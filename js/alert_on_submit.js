$(document).ready(function() {

    //Program a custom submit function for the form
    $("form#data").submit(function(event){
        //disable the default form submission
        event.preventDefault();

        //grab all form data  
        //~ var formData = new FormData($(this)[0]);
        alert($("#username-field").val());

    });

});
