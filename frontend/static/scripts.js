myusername = "";
socket = "";
temp_partner = "";
var notif = new Audio('static/notif.mp3');
$(document).ready(function () {
    $tnc_block = $('#tncblock');
    //$tnc_block.hide(); //debugging
    $loading = $('#connecting');
    $tnc_button = $('#tncbutton');
    $tnc_accept = $('#tncaccept');
    $chat_block = $('#chatblock');   
    $username = $('#username'); 
    $("#newcon").attr("disabled", true);
    $tnc_button.on('click', function(){
        if($tnc_accept.prop('checked')){
            $tnc_block.slideUp("slow",function(){
                $username.slideDown("slow",function(){
                   // setTimeout(chaton, 3000);
                });
            });
        }else{
            $("#confwarn").html('<b style="color:red">Cant ignore this :P</b>');
        }
    });
    $('#chatwindow').css('height', ($(window).height()/1.3));
});


function clearchatbox(){
    $("#actualchat").html("");
    $("#msg").val("");
    $("#unamemsg").html("");
}

function chaton(){
        clearchatbox();
        $("#newcon").attr("disabled", true);
        $.ajax({url: "/sv/live", success: function(result){
            $("#livecount").html(result);
        }});
        $username.slideUp("slow", function(){
            socket=io("nojob2.tibstack.com", {path : '/sv/socket.io'});
            // socket=io("localhost:3000", {path : '/socket.io'});
            //socket=io("localhost:3000");
        $loading.slideDown("slow",function(){
            // add user to live and random roulette
            //add user
            socket.emit("init",{
                username : myusername,
                id : socket.id
            });
            socket.on("msg",function(message){
                notif.play();
                $("#actualchat").append($('<p class="stranger"></p>').text(message));
                $('#actualchat').scrollTop($('#actualchat')[0].scrollHeight);
            });
            socket.on("partner",function(partner){
                temp_partner = partner;
                $loading.slideUp("slow", function(){
                    $("#actualchat").append($('<p class="conmsg text-center"></p>').text("You are now talking to " + temp_partner.username));
                    $chat_block.slideDown("slow");
                });
            });
            socket.on("pat_disc",function(nothing){
                $("#actualchat").append($('<p class="dismsg text-center"></p>').text(temp_partner.username + " has disconnected"));
                $("#disconnect").attr("disabled", true);
                $("#newcon").attr("disabled", false);
                $("#msg").attr("disabled", true);
                $("#send").attr("disabled", true);
                temp_partner = "";
            });
        });
    });
}

function clearchatbox(){
    $("#actualchat").html("");
    $("#msg").val("");
    $("#unamemsg").html("");
}

function rechaton(){
        clearchatbox();
        $("#unamefield").attr("disabled", false);
        $("#newcon").attr("disabled", true);
        $.ajax({url: "/sv/live", success: function(result){
            $("#livecount").html(result);
        }});
        $chat_block.slideUp("slow", function(){
        socket.connect();
       // socket=io("localhost:3000", {path : '/socket.io'});
        $loading.slideDown("slow",function(){
            // add user to live and random roulette
            //add user
            socket.emit("init",{
                username : myusername,
                id : socket.id
            });
        });
    });
}

$("#disconnect").click(function(){
    $("#unamefield").attr("disabled", false);
    $chat_block.slideUp("slow",function(){
        socket.disconnect();
        socket.off('pat_disc');
        socket.off('msg');
        socket.off('partner');
        temp_partner="";
        $username.slideDown("slow");
        $("#newcon").attr("disabled", false);
        clearchatbox();
    });
});

$("#newcon").click(function(){
    $("#unamefield").attr("disabled", false);
    clearchatbox();
    rechaton();
    $("#disconnect").attr("disabled", false);
    $("#msg").attr("disabled", false);
    $("#send").attr("disabled", false);
});

$("#send").click(function(e){
    e.preventDefault();
    if($("#msg").val() == ""){
        return;
    }
    msg = {};
    msg.sender = socket.id;
    msg.username = myusername;
    msg.to = temp_partner.id;
    msg.message = $("#msg").val();
    socket.emit('msg', msg);
    $("#actualchat").append($('<p class="you"></p>').text($("#msg").val()));
    $("#msg").val("");
    $('#actualchat').scrollTop($('#actualchat')[0].scrollHeight);
});


//receiving
//<p class="stranger"><b>Strange : </b>Strange Reply</p>

$("#unbutton").click(function(){
    myusername = $("#unamefield").val();
    data = {}
    data.myusername = myusername;
    $.ajax({ 
        url: '/sv/adduser',
        type: 'POST',
		data: JSON.stringify(data),
        contentType: 'application/json',
        error: function(xmlReq, txtStatus, errThrown){
            $("#unamemsg").html('<b style="color:red">Service Down</b>');
        },
        success: function(result)
        {   
            if(result==='1'){
                $("#unamemsg").html('<b style="color:green">All Set. Redirecting to chat ..</b>');
                $("#unamefield").attr("disabled", true);
                setTimeout(chaton, 2000);
            }
            else{
                $("#unamemsg").html('<b style="color:red">Username is already taken.</b>');
            }
        }
    });
});