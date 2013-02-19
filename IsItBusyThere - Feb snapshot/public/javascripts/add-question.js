$.ready(

    function(){

        $("#add-question").click(function(){
           var question = $("#question").val().trim();

           if (question.length > 0){
               $.ajax({url: "/questions/create",
                   type: "POST",
                   data: {question: question}
               })
               .done(function(response) {
                    $("#question").val("");
                    $("#questions-list").append($("<li>"+response.results.item.question.question+"</li>"));
               })
               .fail(function() { alert("error"); });
           }

           return false;
        });
    }()

);