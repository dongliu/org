$(function () {
  var date1 = $('#date1').pickadate({
    min: new Date(2016, 10, 1),
    max: true
  });
  var date1Picker = date1.pickadate('picker');
  var from = $('#from').pickadate({
    min: new Date(2016, 10, 1),
  });
  var to = $('#to').pickadate({
    min: new Date(2016, 10, 1),
    max: true
  });

  var fromPicker = from.pickadate('picker');
  var toPicker = to.pickadate('picker');

  $('#diff1').click(function (e) {
    e.preventDefault();
    // var url = '/employees';
    var select = date1Picker.get('select');
    if (select) {
      window.open('/employees/diff/year/' + select.year + '/month/' + (select.month + 1) + '/day/' + select.date);
    } else {
      window.open('/employees/diff/today', 'diff today');
    }
  });

  $('#diff2').click(function (e) {
    e.preventDefault();
    var fromSelect = fromPicker.get('select');
    var toSelect = toPicker.get('select');
    if (!fromSelect) {
      fromSelect = fromPicker.get('min');
    }
    if (!toSelect) {
      toSelect = toPicker.get('max');
    }

    if (fromSelect.year === toSelect.year && fromSelect.month === toSelect.month && fromSelect.day === toSelect.day) {
      return window.open('/employees/diff/year/' + fromSelect.year + '/month/' + (fromSelect.month + 1) + '/day/' + fromSelect.day, 'diff dates');
    }

    var from = fromSelect;
    var to = toSelect;

    if (fromSelect.year > toSelect.year || (fromSelect.year === toSelect.year && fromSelect.month > toSelect.month) || (fromSelect.year === toSelect.year && fromSelect.month === toSelect.month && fromSelect.day > toSelect.day)) {
      from = toSelect;
      to = fromSelect;
    }

    window.open('/employees/year/' + from.year + '/month/' + (from.month + 1) + '/day/' + from.day + '/diff/year/' + +to.year + '/month/' + (to.month + 1) + '/day/' + to.day, 'diff dates')
  });
});
