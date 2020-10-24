$(function () {
    displayTrends();
});

function displayTrends() {
    $("#auTrends button").click(function () {
        const inputText = $('#searchInput').val();
        const btnText = $(this)[0].innerText;
        $('#searchInput').val(!inputText ? btnText : `${Array.from(new Set((inputText + ',' + btnText).split(','))).join(',')}`);
    });
}

$(".btn-primary").click(function (){
    console.log(1);
    sendquery();
    sendqueryToStream();
});

function sendquery(){
    console.log($("#searchInput").val());
    $.ajax({
        url: '/update',
        type:'POST',
        data: {value: $("#searchInput").val()},
    });
}

function sendqueryToStream(){
    let url = "http://localhost:3001/twitter/stream";
    let data = $("#searchInput").val();
    $.ajax({
    });
}


