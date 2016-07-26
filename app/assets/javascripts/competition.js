$(function () {
    $('.update-user-info-submit').on('click', function (event) {
        event.preventDefault();
        var username = $('#username').val();
        var gender = $('#gender').val();
        var district_id = $('#user-info-district').val();
        var school_id = $('#user-info-school').val();
        var birthday = $('#birthday').val();
        var identity_card = $('#identity_card').val();
        var grade = $('#grade').val();
        var student_code = $('#student_code').val();
        var team_group = $('#team-group').val();
        var team_teacher = $('#team-teacher').val();
        var teacher_mobile = $('#team-teacher-mobile').val();
        var ed = $('#event-identify').val();

        $.ajax({
            url: '/competitions/leader_create_team',
            type: 'post',
            data: {
                "username": username,
                "gender": gender,
                "district": district_id,
                "school": school_id,
                "birthday": birthday,
                "identity_card": identity_card,
                "grade": grade,
                "student_code": student_code,
                "team_group": team_group,
                "teacher_name": team_teacher,
                "teacher_mobile": teacher_mobile,
                "team_event": ed
            },
            success: function (data) {
                if (data[0]) {
                    $('#update-user-info').modal('hide');
                    alert(data[1]);
                    window.location.reload();
                } else {
                    alert(data[1]);
                }
            }
        });
    });


    //创建队伍
    $('#step-for-new').on('click',function(event){
        event.preventDefault();
        $('#step-for-update').removeClass('hide');
        $(this).parents('.first-step').addClass('hide');
    });

    //加入队伍
    $('#step-for-join').on('click',function(event){
        event.preventDefault();
        $('#step-for-search').removeClass('hide');
        $(this).parents('.first-step').addClass('hide');
    });

    // 搜索队伍
    $('#search-team').on('click', function () {
        var team = $('.search-team-input').val();
        var ed = $('#event-identify').val();
        var reg = /[A-Z]+/i;
        if (reg.test(team)) {
            $.ajax({
                url: '/competitions/search_team',
                dataType: 'json',
                type: 'get',
                data: {ed: ed, team: team},
                success: function (data) {
                    if (data[0]) {
                        if (data[1].length == 0) {
                            alert('未查询到相关队伍');
                        } else {
                            var result = data[1];
                            //队伍信息
                        }
                    } else {
                        alert(data[1]);
                    }
                },
                error: function (data) {
                    alert(1);
                }
            });
        } else {
            alert('请输入字母');
        }
    });

    $('#search-player').on('click', function () {
        var invited_name = $('.search-player-input').val();
        if (invited_name) {
            $.ajax({
                url: '/competitions/search_user',
                dataType: 'json',
                type: 'get',
                data: {invited_name: invited_name},
                success: function (data) {
                    if (data[0]) {
                        if (data[1].length == 0) {
                            alert('未查询到相关用户');
                        } else {
                            var result = data[1];
                            $('.table-player-show').removeClass('hide');
                            var tbody = $(".table-player-show").find('tbody');
                            tbody.empty();
                            $('.search-player-input').val('');
                            $.each(result, function (k, v) {
                                var tr = $('<tr><td>' + v.nickname + '</td>' +
                                    '<td>' + v.username + '</td>' +
                                    '<td>' + v.school_name + '</td>' +
                                    '<td>' + v.grade + '</td>' +
                                    '<td><button class="btn btn-xs btn-info" onclick="invite_player(' + v.user_id + ')" data-user="' + v.user_id + '">邀请</button></td>' +
                                    '</tr>');
                                tbody.append(tr);

                            });
                        }
                    } else {
                        alert(data[1]);
                    }
                },
                error: function (data) {
                    alert(data["status"])
                }
            });
        } else {
            alert('请输入前两个名字')
        }
    });


});

function invite_player(user_id) {
    var team_id = $('#team-identify').val();
    if (confirm('确认邀请该用户?')) {
        $.ajax({
            url: '/competitions/leader_invite_player',
            dataType: 'json',
            type: 'post',
            data: {td: team_id, ud: user_id},
            success: function (data) {
                if (data[0]) {
                    alert(data[1]);
                    $('.table-player-show').addClass('hide');
                    var team_players_info = $('#team-players-info').find('tbody');
                    var tr_info = $('<tr id="team-player-' + user_id + '"><td>' + data[2] + '</td><td>' + data[3] + '</td>' +
                        '<td></td><td></td>' +
                        '<td>队员(待确认)</td><td><button class="btn btn-xs btn-info" onclick="leader_delete_player(' + user_id + ')">清退</button></td></tr>');
                    team_players_info.append(tr_info);
                } else {
                    alert(data[1]);
                }
            }
        });
    }

}
// 队长解散队伍
function leader_delete_team(team_id) {
    if (confirm('确定解散队伍?')) {
        $.ajax({
            url: '/competitions/leader_delete_team',
            dataType: 'json',
            type: 'post',
            data: {td: team_id},
            success: function (data) {
                if (data[0]) {
                    alert(data[1]);
                    window.location.reload();
                } else {
                    alert(data[1]);
                }
            }
        })
    }


}

// 队长清退队员
function leader_delete_player(ud) {
    var team_id = $('#team-identify').val();
    if (confirm('确定清退该队员?')) {
        $.ajax({
            url: '/competitions/leader_delete_player',
            dataType: 'json',
            type: 'post',
            data: {td: team_id, ud: ud},
            success: function (data) {
                if (data[0]) {
                    alert(data[1]);
                    $("#team-player-" + ud).addClass('hide');
                } else {
                    alert(data[1]);
                }
            }
        })
    }
}