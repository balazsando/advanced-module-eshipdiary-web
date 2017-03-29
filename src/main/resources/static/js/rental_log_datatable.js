$(document).ready( function () {
    $('#rental-table').DataTable ({
        language: {
            "url": "https://cdn.datatables.net/plug-ins/1.10.13/i18n/Hungarian.json"
        },
        ajax: {
            url: '/api/rental?projection=rentalOverview',
            dataSrc: '_embedded.rental'
        },
        columns: [
            {   data: 'ship'
            },
            {   data: 'crewNames'
            },
            {
                data: 'rentalStart',
                searchable: false
            },
            {
                data: 'rentalEnd',
                searchable: false
            },
            {
                data: 'cox'
            },
            {
                data: 'itinerary'
            },
            {
                data: 'comment',
                render: $.fn.dataTable.render.ellipsis(10)
            },
            {
                sortable: false,
                searchable: false,
                render: rentalActionButtons
            }
        ]
    });
});

function rentalActionButtons( data, type, row ) {
    var details = ' <a class="btn btn-info btn-xs" data-toggle="modal" data-target="#rentalModal" role="button" onclick="rentalDetailsModal(\'/rentals/details/'+row.id+'\');">Részletek</a>';
    var final = row.finalized ? '' : ' <a class="btn btn-success btn-xs" data-toggle="modal" data-target="#rentalModal" role="button" onclick="rentalFinalModal(\'/rentals/final/'+row.id+'\');">Véglegesítés</a>';
    var isAdmin = document.getElementById("role").value === 'ADMIN';
    var comment = isAdmin ? ' <a class="btn btn-warning btn-xs" data-toggle="modal" data-target="#rentalModal" role="button" onclick="rentalCommentModal(\'/rentals/comment/'+row.id+'\');">Megjegyzés</a>' : '';
    return details + final + comment;
}

function multipleSelect () {
    $('.multi-select').multiselect({
        enableCaseInsensitiveFiltering: true,
        filterPlaceholder: 'Keresés...',
        buttonWidth : '100%',
        nonSelectedText: ' '
    });
}

function rentalModal(link) {
    $.ajax({
        url: link,
        type: "OPTIONS",
        success: function (result) {
            document.getElementById('rentalModalLabel').innerHTML = "Hajóbérlés";
            document.getElementById('rentalUpdate').innerHTML = result;
            document.getElementById('rentalSubmit').style.display = "inline";
            multipleSelect();
            loadValidate();
            selectShipsByType();
            selectShipsByName();
        }
    });
}

function rentalFinalModal(link) {
    $.ajax({
        url: link,
        type: "OPTIONS",
        success: function (result) {
            document.getElementById('rentalModalLabel').innerHTML = "Hajóbérlés befejezése";
            document.getElementById('rentalUpdate').innerHTML = result;
            document.getElementById('rentalSubmit').style.display = "inline";
            multipleSelect();
        }
    });
}

function rentalCommentModal(link) {
    $.ajax({
        url: link,
        type: "OPTIONS",
        success: function (result) {
            document.getElementById('rentalModalLabel').innerHTML = "Megjegyzés hozzáfűzése";
            document.getElementById('rentalUpdate').innerHTML = result;
            document.getElementById('rentalSubmit').style.display = "inline";
            multipleSelect();
        }
    });
}

function rentalDetailsModal(link) {
    $.ajax({
        url: link,
        type: "OPTIONS",
        success: function (result) {
            document.getElementById('rentalModalLabel').innerHTML = "Bérlés részletei";
            document.getElementById('rentalUpdate').innerHTML = result;
            document.getElementById('rentalSubmit').style.display = "none";
        }
    });
}

function submitRentalLog() {
    $.ajax({
        type: 'POST',
        url: '/api/rental',
        data: JSON.stringify(processData($("#rentalForm").serializeObject())),
        success: function (msg) {
            $('#rentalModal').modal('hide');
            $('#rental-table').DataTable().ajax.reload(null, false);
        },
        dataType: 'json',
        contentType: 'application/json'
    });
    return false;
}

function processData(data) {
    data.chosenShip = window.location.origin + '/api/ship/' + data.chosenShip;
    data.cox = window.location.origin + '/api/user/' + data.cox;
    data.captain = window.location.origin + '/api/user/' + data.captain;
    if(data.crew.constructor === Array) {
        data.crew = data.crew.map(function(member, index){return window.location.origin + '/api/user/' + member});
    } else {
        data.crew = [window.location.origin + '/api/user/' + data.crew];
    }
    if(data.oars.constructor === Array) {
        data.oars = data.oars.map(function(oar, index){return window.location.origin + '/api/oar/' + oar});
    } else {
        data.oars = [window.location.origin + '/api/oar/' + data.oars];
    }
    return data;
}

function submitFinalRentalLog(id) {
    $.ajax({
        type: 'PATCH',
        url: '/api/rental/' + id,
        data: JSON.stringify($("#rentalForm").serializeObject()),
        success: function (msg) {
            $('#rentalModal').modal('hide');
            $('#rental-table').DataTable().ajax.reload(null, false);
        },
        dataType: 'json',
        contentType: 'application/json'
    });
    return false;
}

function loadValidate() {
    $('#rentalPeriod').on('input', function () {
        this.setCustomValidity(validateRentalPeriod(this.value));
    })
}

function validateRentalPeriod(rentalPeriod) {
    if(rentalPeriod > minutesUntilMidnight()) {
        return "A bérlési idő maximum a nap végéig tart"
    } else if (rentalPeriod < 15) {
        return "A bérlési idő minimum 15 perc"
    } else if (rentalPeriod % 15 != 0) {
        return "Negyedórás időközt használj"
    } else {
        return ""
    }
}

function minutesUntilMidnight() {
    var now = new Date();
    var midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return (midnight.getTime() - now.getTime())/ 1000 / 60;
}

function getShipsByType(id) {
    $.ajax({
        type: "GET",
        url: "shipsByType",
        data: {"typeId": id},
        dataType: 'json',
        success: function(data) {
            var shipByName = $('#shipByName');
            shipByName.empty();
            $.each(data, function(index, value) {
                shipByName.append($('<option></option>').text(value['name']).val(value['id']));
                });
            shipByName.multiselect('rebuild');
        }
    });
}

function selectShipsByType() {
    $('#shipByType').val('').multiselect({
        buttonWidth: '100%',
        nonSelectedText: 'Minden típus',
        onChange: function (option, checked, select) {
            getShipsByType(option.val());
        }
    })
}

function selectShipsByName() {
    $('#shipByName').val('').multiselect({
        enableCaseInsensitiveFiltering: true,
        filterPlaceholder: 'Keresés...',
        buttonWidth: '100%',
        nonSelectedText: 'Minden hajó'
    })
}

$.fn.dataTable.render.ellipsis = function (charLimit) {
    return function ( data, type, row ) {
        return type === 'display' && data.length > 10 ?
            data.substr( 0, charLimit ) +'…' :
            data;
    }
};