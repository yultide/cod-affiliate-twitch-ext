var state = {}
// var state = {
//     auth: {
//         userId: 'userid',
//         token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGFubmVsX2lkIjoiY2hhbm5lbGlkIiwib3BhcXVlX3VzZXJfaWQiOiJ1c2VyaWQiLCJpYXQiOjE1MzM0MzEwMDV9.xGe_AQPmVaZ-OT-uJE5tqQutunkLHLQUVkC6AuCJUHU'
//     }
// }
var apiUrl = 'https://hxkcztcm5f.execute-api.us-east-2.amazonaws.com/dev/api/';

window.Twitch.ext.onAuthorized(function(auth) {
    console.log('The JWT that will be passed to the EBS is', auth.token);
    console.log('The channel ID is', auth.channelId);
    state.auth = auth;

    fetchReferralId(function(id) {
        $('#affiliateid').val(id);
    });
});


window.Twitch.ext.onContext(function(context) {
    state.context = context;
});


function saveReferralId(userid, affiliateid, cb) {
    $.ajax({
        url: apiUrl + 'save',
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + state.auth.token
        },
        data: JSON.stringify({ userid: userid, affiliateid: affiliateid }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
            cb()
        },
        error: function(err) {
            cb('Failed to update referral id: ' + err.responseText);
        }
    });
}

var timeout;

function alertFail(msg) {
    $('#alertmsg').text(msg);
    $('.alert').removeClass('alert-success hide').addClass('alert-danger show')
    clearTimeout(timeout);
    timeout = setTimeout(function() {
        $('.alert').removeClass('show').addClass('hide')
    }, 3000);
}

function alertSuccess(msg) {
    $('#alertmsg').text(msg);
    $('.alert').removeClass('alert-danger hide').addClass('alert-success show')
    clearTimeout(timeout);
    timeout = setTimeout(function() {
        $('.alert').removeClass('show').addClass('hide')
    }, 3000);
}

function fetchReferralId(cb) {
    $.ajax({
        url: apiUrl + 'get/' + state.auth.userId,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + state.auth.token
        },
        success: function(data) {
            var id = data.affiliateid;
            cb(id);
        },
        error: function(err) {
            cb('Failed to fetch referral id: ' + err.responseText);
        }
    });
}

$('#affiliateid').change(function() {
    var affiliateId = $('#affiliateid').val();
    if (!affiliateId) {
        alertFail('Please enter a affiliate id');
        return;
    }

    saveReferralId(state.auth.userId, affiliateId, function(err) {
        if (err) {
            alertFail(err);
        } else {
            alertSuccess('Updated affiliate id');
        }
    });
})

// $('#btn-submit').click(function() {
//     var affiliateId = $('#affiliateid').val();
//     if (!affiliateId) {
//         alertFail('Please enter a affiliate id');
//         return false;
//     }

//     saveReferralId(state.auth.userId, affiliateId, function(err) {
//         if (err) {
//             alertFail(err);
//         } else {
//             alertSuccess('Updated affiliate id');
//         }
//     });

//     return false;
// });

$('.close').click(function() {
    $('.alert').removeClass('show').addClass('hide')
    return false;
})
