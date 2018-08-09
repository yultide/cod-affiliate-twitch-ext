$('.btn-close').click(function() {
    $(document.body).hide();
});

$('.dropdown').click(function() {
    var container = $('.container');
    if (container.is(':visible')) {
        container.addClass('fadeOut').removeClass('fadeIn');
        setTimeout(function() {
            container.hide();
        }, 500);
    } else {
        container.show();
        container.addClass('fadeIn').removeClass('fadeOut');
    }
});

$(window).on('resize', function() {
    var win = $(this); //this = window
    var width = win.width();
    var height = win.height();
    $('.offset').css('transform', 'scale(' + ((height - 200)/540) + ')');
});