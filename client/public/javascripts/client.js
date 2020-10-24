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
