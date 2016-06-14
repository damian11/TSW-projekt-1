/*jshint globalstrict: true, devel: true, esnext: true */
'use strict';

$(function() {
  $("input[type=date]").each(function() {
    if ($(this).val() !== "") {
      var ms = Date.parse($(this).val());
      $(this).val(moment(ms).format("DD-MM-YYYY"));
    }
    $(this).datepicker();
  });
    
  $(".date").each(function() {
    if ($(this).text() !== "") {
      $(this).text(moment($(this).text()).format("DD-MM-YYYY"));
    }
  });
});