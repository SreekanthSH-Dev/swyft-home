jQuery(function($) {


    // Close popup
    $(".notify-button-product-card").click(function(){
        $('.notify-form').css('display', 'block'); // Hide
    });
    $(".modal__close-button").click(function(){
        $('.notify-form').css('display', 'none'); // Hide
    });
    
});