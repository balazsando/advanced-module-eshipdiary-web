$(document).ready( function () {
    $('#oar-table').DataTable ({
        language: {
            "url": "https://cdn.datatables.net/plug-ins/1.10.13/i18n/Hungarian.json"
        },
        ajax: {
            url: '/api/oar?projection=oarOverview',
            dataSrc: '_embedded.oar'
        },
        columns: [
            {data: 'name'},
            {data: 'type'},
            {data: 'owner'},
            {
                sortable: false,
                searchable: false,
                render: oarActionButtons
            }
        ]
    });
});


function oarActionButtons( data, type, row ) {
    var shouldBeActive = !(row.active);
    var activationLabel = shouldBeActive ? 'Aktiválás' : 'Inaktiválás';
    var buttonType = shouldBeActive ? 'success' : 'warning';
    var editButton = ' <a class="btn btn-info btn-xs" data-toggle="modal" data-target="#oarModal" role="button" onclick="oarModal(\'/oars/'+row.id+'\', \''+row.name+'\');">Szerkesztés</a>';
    var deleteButton = ' <a class="btn btn-danger btn-xs" data-toggle="modal" data-target="#oarDeleteModal" role="button" onclick="oarDeleteModal(\''+row._links.self.href+'\', \''+row.name+'\');">Törlés</a>';
    var statusChangeButton = ' <a class="btn btn-'+buttonType+' btn-xs" role="button" onclick="setOarStatus(\''+row._links.self.href+'\', ' + shouldBeActive + ')">' + activationLabel + '</a>';
    return editButton + deleteButton + statusChangeButton;
}

function setOarStatus(link, shouldBeActive) {
    $.ajax({
        url: link,
        type: 'PATCH',
        data: JSON.stringify({"active": shouldBeActive}),
        success: function (msg) {$('#oar-table').DataTable().ajax.reload( null, false );},
        dataType: 'json',
        contentType : 'application/json'
    })
}

function oarDeleteModal(link, name){
    document.getElementById('oarDeleteModalLabel').innerHTML = name + ' törlése';
    document.getElementById('oarDelete').addEventListener('click', function(){
        $.ajax({
            type: 'DELETE',
            url: link,
            success: function(msg){
                $('#oarDeleteModal').modal('hide');
                $('#oar-table').DataTable().ajax.reload( null, false );
            }
        });
    });
}

function oarModal(link, name){
    document.getElementById('oarModalLabel').innerHTML = name + ' adatai';
    $.ajax({
        url: link,
        type: "OPTIONS",
        success: function (result) {
            document.getElementById('oarUpdate').innerHTML = result;
        }
    });
}

function validateOar(id){
    $.ajax({
        url:'/oars/' + id,
        type:'POST',
        data:$('#oarForm').serialize(),
        success:function(result){
            document.getElementById('oarUpdate').innerHTML = result;
            $('#oarPost').click();
        }
    });
    return false;
}

function submitOar(id){
    var data = $("#oarForm").serializeObject();
    data.owner = window.location.origin + 'api/user/' + data.owner;
    $.ajax({
        type: id == 0 ? 'POST' : 'PATCH',
        url: id == 0 ? '/api/oar' : 'api/oar/' + id,
        data: JSON.stringify(data),
        success: function (msg) {
            document.getElementById('oarModalLabel').innerHTML = "";
            $('#oarModal').modal('hide');
            $('#oar-table').DataTable().ajax.reload( null, false );
            $('#user-table').DataTable().ajax.reload( null, false );
        },
        dataType: 'json',
        contentType : 'application/json'
    });
}