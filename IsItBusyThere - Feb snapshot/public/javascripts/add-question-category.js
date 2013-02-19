$.ready(

    function(){
        $("#add").click(function(){
           var questionId = $("#question").val().trim(),
               categories = $("#category").val().trim().split(":"),
               categoryName = $("#category option:selected").text(),
               categoryId = categories[0],
               parentCategoryId = categories[1],
               parentCategoryName = $("#category option:selected").parent().attr("label");


           if (questionId.length > 0 || categoryId.length > 0){
               $.ajax({url: "/data/add_question_category",
                   type: "POST",
                   data: {questionId: questionId,
                       categoryName: categoryName,
                       categoryId: categoryId,
                       parentCategoryName: parentCategoryName,
                       parentCategoryId: parentCategoryId}
               })
               .done(function() {
                    window.location.reload();
               })
               .fail(function() {
                       alert("error"); });
           }
           return false;
        });
    }()

);