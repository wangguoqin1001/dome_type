/**
 * Created by huaxiukun on 16/8/15.
 */
function download_comp_voucher(user_info) {
    var user = eval('(' + user_info + ')');
    var age = user["age"] != "" ? (new Date().getFullYear() - parseInt(user["age"])) : "";
    var user_gender = (user["gender"] == '1' ? "男" : (user["gender"] == '2' ? "女" : ""));
    var group = user["group"];
    switch (group) {
        case '1':
            group = '小学';
            break;
        case '2':
            group = '中学';
            break;
        case '3':
            group = '初中';
            break;
        case '4':
            group = '高中';
            break;
        default:
            group = ''
    }
    $('#qrcodeCanvas').qrcode({
        width: 260,
        height: 260,
        text: utf16to8("姓名:" + user["username"] + ";\n性别:" + user_gender + ";\n学校:" + user["school_name"] + ";\n项目:" + user["event_name"] + ";\n组别:" + group + ";\n队伍:" + user["identifier"] + "")
    });
    var canvas = document.getElementById("myCanvas");
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");
        ctx.font = "Normal 30px Arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "black";

        var back_image = document.getElementById("use-voucher");
        ctx.drawImage(back_image, 0, 0);
        ctx.fillText(user["username"], 360, 180);
        ctx.fillText(age, 930, 180);
        ctx.fillText(user_gender, 360, 270);
        ctx.fillText(user["student_code"], 930, 270);
        ctx.fillText(user["school_name"], 360, 360);
        ctx.fillText(user["bj"], 360, 450);
        ctx.fillText(user["event_name"], 380, 1322);
        ctx.fillText(user["identifier"], 380, 1435);
        ctx.fillText(user["teacher"], 380, 1540);
        ctx.fillText(user["teacher_mobile"], 380, 1640);
        ctx.font = "Normal 50px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(user["comp_name"], 430, 900);

        var qrcode_canvas = $("#qrcodeCanvas").find("canvas")[0];
        var qrcode_image = new Image();
        qrcode_image.src = qrcode_canvas.toDataURL("image/jpeg");
        ctx.drawImage(qrcode_image, 850, 1400);
        var all_img = new Image();
        all_img.src = canvas.toDataURL("image/jpeg");

    }
    var doc = new jsPDF();
    var js_pdf_data = all_img.src;
    doc.addImage(js_pdf_data, 'JPEG', 0, 0, 210, 298);
    doc.setTextColor(255, 255, 255);
    doc.save(user["identifier"] + '_' + user["username"] + '_' + user["event_name"]);
}
function utf16to8(str) {
    var out, i, len, c;
    out = "";
    len = str.length;
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        }
    }
    return out;
}

