$(function () {
  var employeeList = new Bloodhound({
    datumTokenizer: function (employee) {
      return Bloodhound.tokenizers.whitespace(employee.employee_name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    identify: function (employee) {
      return employee.emp_no;
    },
    prefetch: {
      url: '/employees/today/list/json',
      transform: function (res) {
        return res.employees;
      }
    }
  });
  var selectedEmployee;
  var employeeTypeahead = $('#employee').typeahead({
    minLength: 1,
    highlight: true,
    hint: true
  }, {
    name: 'employee',
    display: 'employee_name',
    limit: 20,
    source: employeeList
  });

  employeeTypeahead.on('typeahead:select', function (e, o) {
    selectedEmployee = o;
    $('#employee-id').text(o.person_id);
  });

  $('#show-employee-details').click(function (e) {
    if (selectedEmployee) {
      $('#employee-details').text(JSON.stringify(selectedEmployee));
    } else {
      $('#employee-details').text('No employee selected from the suggested list.');
    }
  });

});