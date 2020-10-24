


$(function(){
    displayTrends();
});


function displayTrends(){
    $("button").click(function(){
        const inputText = $('#searchInput').val();
        const ButtonText = $(this);
        if (inputText == '') {
            $('#searchInput').val(ButtonText[0].outerText);
        } else {
            $('#searchInput').val($('#searchInput').val() + ',' + ButtonText[0].outerText);
        }

    });
}



