function getArticles() {
    $("#articles").empty();
    $.getJSON("/articles/", function(data){
        for (var i = 0; i< data.length; i++){
            if (data[i].notes.length > 0) {
                $("#articles").append("<li class='list-group-item post-title' data-id='" + data[i]._id + "'>" + data[i].title + "<br><a href='" + data[i].link + "'>Link to article</a><span class='badge'>"+data[i].notes.length+"</span></li>");
            }
            else {
                $("#articles").append("<li class='list-group-item post-title' data-id='" + data[i]._id + "'>" + data[i].title + "<br><a href='" + data[i].link + "'>Link to article</a></li>");
            }
            console.log(data[i].notes.length);
            }
    });
}

getArticles();

var articleId;
$(document).on("click", "li", function (){
    
    var articleId = $(this).attr("data-id");
    $("#addNote").attr("data-id", articleId);
    console.log("This is my id: " + articleId);
    $("#panelNotes").empty();

    $.ajax ({
        method: "GET",
        url: "/articles/" + articleId
    })
    .done(function (data) {
        for (var i = 0; i < data.notes.length; i++) {
            console.log(data.notes[i]);
            if (data.notes[i].title && data.notes[i].body) {
                $('#panelNotes').append("<li class='list-group-item'>Title: <strong>" + data.notes[i].title + "</strong></li>");
                $('#panelNotes').append("<li class='list-group-item'>Comment: " + data.notes[i].body + "</li>");
                console.log(data.notes.length);
            }
        }
    });
});
$("#addNote").on("click", function (){
    var thisId = $(this).attr("data-id");

    $.ajax ({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            title: $("title-input").val(),
            body: $("#body-input").val()
        }
    })
    .done(function (data){
        console.log(data);
    });
    $("#title-input").val("");
    $("#body-input").val("");
});