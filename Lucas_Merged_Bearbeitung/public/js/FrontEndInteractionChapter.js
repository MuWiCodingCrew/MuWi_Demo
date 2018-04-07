function openRateModal(obj){
  $('#rateModal').modal('toggle');
  $('#rateModalWrapper').attr('data-contentID', $(obj).attr("data-contentid"));
}

function sendRating(){
  var obj = {
    userid: 9, // TODO: Logged User
    contentid: $('#rateModalWrapper').attr('data-contentID'),
    comment: $('#rate_CommentBox').val(),
    rating: $('.starClicked').attr("data-star-value")
  }


  $.ajax({
    type: 'POST',
    data: JSON.stringify(obj),
    contentType: 'application/json',
    url: 'http://localhost:3000/saveRating',
    success: function(data){
      $('#rateModal').modal('toggle');
    }
  });
}

function toggleStars(obj){
  for(let e of $('.rating').children()){
    $(e).removeClass("starClicked");
  }

  $(obj).addClass("starClicked");
}

/*
(function($) {
  $(document).ready(function($) {
    $('.card-body').on('click', '.btn-rate-content', openRateModal);
  })
})(jQuery);
*/
