$(document).ready(function()
{
    /*********************************************VARIABLES********************************************/
    var addUse = false;

    /***********************************************SETUP**********************************************/
    
    //Hide elements
    $('#addUse').hide();

    //Set content height and position
    var remainingScreen = ($("body").height() - ($("header").height() + 10 + $("footer").height() + 10));
    var percentageFreeScreen = Math.round(((remainingScreen * 100)/$("body").height())) + "%";
    $(".content").height(percentageFreeScreen);
    $(".content").css("top", $("header").height() + 10);

    //Setup add tab bottom
    $('#addUse').css("bottom", $("footer").height() + 15 + "px");

    //Get drug info
    $.get("/info", function(data, status)
    {
        var substances = Object.keys(data.Substances);
        

        for(var i = 0; i < substances.length; i++)
        {
            $("#substancesSelect").append("<option value= " + substances[i] + ">" + substances[i] + "</option>")
        }
    });

    if(getCookie("email") == "")
    {
        window.location.href = "/";
    }
    else
    {
        $('#welcomeHome').text("Welcome " + getCookie("name"));
    }

    updateSubstances();

    /************************************************RUN***********************************************/
    
    $('#add').click(function()
    {
        if(!addUse)
        {
            $('#addUse').show();
            $('header, .content').css("filter","blur(3px)");
            addUse = true;
        }
        else
        {
            addUse = false;
            $('#addUse').hide();
        }
    })

    $('.content, header').click(function()
    {
        if(addUse)
        {
            addUse = false;
            $('#addUse').hide();
            $('header, .content').css("filter","none");
        }
    })

    /***********************************************FORMS**********************************************/

    $('#addDose').click(function()
    {
        var timestamp;

        if($('#timeSelect').val() == "Now")
        {
            timestamp = Date.now();
        }
        else
        {
            var hours = $('#timeSelect').val()[0];
            timestamp = Date.now() + (hours * 3600);
        }

        console.log(timestamp);

        $.post("/addDose",
        {
            substance: $("#addDose").val(),
            time: timestamp
        }
        )
    })
})

function updateSubstances()
{
    if(getCookie("email") != "")
    {
        $(".content").empty();

        $.get("/usage",
        {
            email: getCookie("email")
        },
        function(data, status)
        {
            if(data == "409")
            {
                console.log("No data");
            }
            else
            {
                console.log(data);  
                for(var i = 0; i < data.length; i++)
                {
                    var date = new Date(data[i]["id"] * 1000);
                
                    $(".content").append("<div><img class='logoSubstance' src=./img/substances/" + data[i]  ["data"]["substance"] + ".png><p class='titleSubstance'>" + data[i]["data"]["substance"]  + "</p><p class='dateSubstance'>" + date.getDate() + "/" + date.getMonth()+1 + "/" + date.getFullYear() + "</p><div class='infoSubstance waves-effect   waves-blue btn white'>Info</div><div class='warningSubstance waves-effect waves-blue btn  white'>Dangers</div>");
                }
            }
        })
    }
}

function getCookie(cname) 
{
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) 
    {
        var c = ca[i];
        while (c.charAt(0) == ' ') 
        {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) 
        {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}