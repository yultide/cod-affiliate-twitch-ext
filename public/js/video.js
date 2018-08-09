$('.btn-close').click(function() {
    $(document.body).hide();
});

$('.dropdown').click(function() {
    var container = $('.container');
    if (container.is(':visible')) {
        container.hide();
    } else {
        container.show();
    }
});
