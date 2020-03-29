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

$(document).ready(function()
{
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

    
    $('#add').click(function()
    {
        console.log("Add new");
    })
})