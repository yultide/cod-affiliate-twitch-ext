// var state = {
//     auth: {
//         userId: 'userid',
//         token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGFubmVsX2lkIjoiY2hhbm5lbGlkIiwib3BhcXVlX3VzZXJfaWQiOiJ1c2VyaWQiLCJpYXQiOjE1MzM0MzEwMDV9.xGe_AQPmVaZ-OT-uJE5tqQutunkLHLQUVkC6AuCJUHU'
//     }
// }
var state = {};
var apiUrl = 'https://hxkcztcm5f.execute-api.us-east-2.amazonaws.com/dev/api/'

window.Twitch.ext.onAuthorized(function(auth) {
    console.log('The JWT that will be passed to the EBS is', auth.token);
    console.log('The channel ID is', auth.channelId);
    state.auth = auth;

    setUsername(auth.channelId);

    fetchReferralUrl(function(url) {
        setReferralUrl(url);
    });
});

// window.Twitch.ext.onContext(function(context) {
//     state.context = context;
//     console.log('onContext', context);
// });

function fetchReferralUrl(cb) {
    $.ajax({
        url: apiUrl + 'get/' + state.auth.userId,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + state.auth.token
        },
        success: function(data) {
            var id = data.affiliateid;
            var url = 'https://www.amazon.com/Call-Duty-Black-Ops-PC-Standard/dp/B071G5K49R/ref=as_sl_pc_tf_til?tag=' + id + '&linkCode=w00&linkId=b877c360a3c3f573f50a7922093fe1bc&creativeASIN=B071G5K49R';
            cb(url);
        }
    });
}

function setReferralUrl(url) {
    var a = document.getElementById('reflink');
    if (a) {
        a.href = url;
    }
}

function setUsername(username) {
    var u = document.getElementById('username');
    if (u) {
        u.innerText = username;
    }
}

// fetchReferralUrl(function(url) {
//     setReferralUrl(url);
// });

// setUsername('channelId');

