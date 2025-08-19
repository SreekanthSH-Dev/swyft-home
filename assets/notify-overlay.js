jQuery(function($) {

    // Close popup
    $(".notify-button-product-card").click(function(){
        $('.notify-form').css('display', 'flex');
        $('.notify-form').css('height', '100%'); // Hide
    });
    $(".modal__close-button").click(function(){
        $('.notify-form').css('display', 'none'); // Hide
    });
    
});