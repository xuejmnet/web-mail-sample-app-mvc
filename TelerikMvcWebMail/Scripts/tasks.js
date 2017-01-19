﻿function taskSelectionChanged(e) {
    var mailsInView = this.dataSource.view().length;
    var selectedRows = this.select();

    $('input.chkbx').prop('checked', false);

    if (mailsInView > selectedRows.length) {
        $('input.master-checkbox').prop('checked', false);
    } else {
        $('input.master-checkbox').prop('checked', true);
    }

    var checkboxes = selectedRows.find('.chkbx');
    checkboxes.prop('checked', true);
}

function getInitialNumberOfItems(gridData) {
    var numbers = { All: 0, Personal: 0, Work: 0 };

    for (var i = 0; i < gridData.length; i++) {
        var currentItemCategory = gridData[i].Category;
        numbers[currentItemCategory] += 1;
    }

    numbers.All = numbers.All + numbers.Personal + numbers.Work;

    return numbers;
}

function tasksGridDataBound(e) {
    bindCheckboxes();

    $.ajax({
        url: location.protocol + '//' + location.host + '/Tasks/Tasks_Read',
        success: function (gridData) {
            var numbers = getInitialNumberOfItems(gridData.Data);
            var data = [{
                text: "All ",
                value: "All",
                number: numbers.All
            }, {
                text: "Personal ",
                value: "Personal",
                number: numbers.Personal
            }, {
                text: "Work ",
                value: "Work",
                number: numbers.Work
            }];

            populateNavigationTree(data);
        }
    });
}

function bindCheckboxes() {
    $('.chkbx').on('change', function (e) {
        var target = $(e.target);
        var checked = e.target.checked;
        var tasksGrid = $("#mainWidget").data("kendoGrid");
        var selectedRows = tasksGrid.select();
        var checkedRow = $(target).parents('tr');

        if (checked) {
            checkedRow.addClass('k-state-selected');
            selectedRows.add(checkedRow);
            tasksGrid.select(selectedRows);
        } else {
            var resultSelection = $.map(selectedRows, function (row) {
                if ($(row).attr('data-uid') !== checkedRow.attr('data-uid')) {
                    return row;
                }
            });

            checkedRow.removeClass('k-state-selected');
            tasksGrid.select(resultSelection);
        }
    });
}

function selectFolder(e) {
    var dataItem = this.dataItem(e.node);
    var selectedText = e.sender.dataItem(e.node).value;

    $('input.master-checkbox').prop('checked', false);

    Cookies.set('selected', kendo.stringify(dataItem.index));
    selected = Cookies.get('selected');

    var tasksGrid = $("#mainWidget").data("kendoGrid");
    if (!tasksGrid) {
        window.location.href = location.protocol + '//' + location.host + '/Tasks/Index';
    } else if (selectedText == 'All') {
        tasksGrid.dataSource.filter({});
    } else {
        tasksGrid.dataSource.filter({ field: "Category", operator: "contains", value: selectedText });
    }
}

$(document).ready(function () {
    $(".search-textbox").on('keyup', function (e) {
        var text = $(e.target).val();

        var tasksGrid = $("#mainWidget").data("kendoGrid");
        tasksGrid.dataSource.filter({ field: "Subject", operator: "contains", value: text });
    });

    $('.btn-delete').on('click', function () {
        var tasksGrid = $("#mainWidget").data("kendoGrid");

        var checkboxesToBeDeleted = $('.chkbx:checkbox:checked');
        var rows = checkboxesToBeDeleted.parents('tr[role="row"]');

        $('input.master-checkbox').prop('checked', false);

        for (var i = 0; i < rows.length; i++) {
            tasksGrid.removeRow(rows[i]);
        }
    });

    $('.new-Task').on('click', function (e) {
        $(".main-section").load(location.protocol + '//' + location.host + '/Tasks/NewTask');
    });

    $('.master-checkbox').on('change', function (e) {
        var checked = e.target.checked;
        var tasksGrid = $("#mainWidget").data("kendoGrid");

        if (checked) {
            tasksGrid.select('tr');
        } else {
            tasksGrid.clearSelection();
        }
    });
});