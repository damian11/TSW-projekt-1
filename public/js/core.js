$(function() {
  $(".date").each(function() {
    if ($(this).text() != "") {
      $(this).text(moment($(this).text()).format("DD-MM-YYYY"));
    }
  });
});