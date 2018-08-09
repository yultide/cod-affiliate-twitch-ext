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

$(window).on('resize', function() {
    var win = $(this); //this = window
    var width = win.width();
    var height = win.height();
    $('.offset').css('transform', 'scale(' + ((height - 300)/500) + ')');
});