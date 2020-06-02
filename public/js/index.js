//Check if browser supports service workers.
if('serviceWorker' in navigator)
{
    //Put it in all scripts (installs/updates the service worker)
    navigator.serviceWorker.register('/sw.js')
    .then(function()
    {
        console.log("Service worked registered!");
    })
}

//Check if user is logged in
if(getCookie("email") != "")
{
    window.location.href = "/home";
}

$(document).ready(function()
{
    $('#loginDiv').hide();
    $('#registerDiv').hide();
    $('.back').css("color", "black");

    //Take user to register page
    $('#register').click(function()
    {
        $('#home').hide();
        $('#registerDiv').show();
    })
    
    //Take user to login page
    $('#login').click(function()
    {
        $('#home').hide();
        $('#loginDiv').show();
    })

    //Take user back to the main page
    $('.back').click(function()
    {
        $('#home').show();
        $('#loginDiv').hide();
        $('#registerDiv').hide();
    })

    //Submit login
    $('#loginButton').click(function()
    {
        $('#loginForm').submit();
    })

    //Submit registration
    $('#registerButton').click(function()
    {
        $('#registerForm').submit();
    })

    //Login form submission
    $('#loginForm').submit(function(e)
    {
        e.preventDefault();
        
        var valid = true;
        var inputs = $('#loginForm :input');
        var values = {};

        //Check if fields are valid
        inputs.each(function()
        {
            values[this.name] = $(this).val();
        })

        $('#loginForm > div > input').each(function(index)
        {
            if(!$(this).hasClass("valid")) { valid = false; }
        })

        //If they are attempt to login
        if(valid)
        {
            $.post("/login",
            {
                data: values
            },
            function(data, status)
            {

                //409 - Wrong password/email
                if(data == "409")
                {
                    $('#loginForm > div:first-child() > input, #loginForm > div:nth-child(2) > input').val("");
                    $('#loginForm > div:first-child() > input, #loginForm > div:nth-child(2) > input').removeClass("valid");
                    $('#loginForm > div:first-child() > input, #loginForm > div:nth-child(2) > input').addClass("invalid");
                }
    
                //500 - Server issues
                else if(data == "500")
                {
                    $('.back').click();
                    alert("Sorry, we are having trouble with our servers at the moment. Try again later!");
                }

                //200 - OK
                else
                {
                    setCookie("email", values.email, "1");
                    setCookie("name", data, "1");
                    window.location.href = "/home";
                }
            })
        }
    })
    
    //Registration submission
    $('#registerForm').submit(function(e)
    {
        e.preventDefault();

        var valid = true;
        var inputs = $('#registerForm :input');
        var values = {};

        //Check if inputs are valid
        inputs.each(function()
        {
            values[this.name] = $(this).val();
            if(!$(this).hasClass("valid")) { valid = false; }
        })

        //If they are attempt to register the user
        if(valid)
        {
            $.post("/register",
            {
                data: values
            },
            function(data, status)
            {
                //200 - OK
                if(data == "200")
                {
                    $('.back').click();
                    alert("Account created!");
                    $('#registerForm > div > input').val("");
                }
    
                //409 - Email in use
                if(data == "409")
                {
                    alert("Email already in use, try again!");
                    $('#registerForm > div:nth-child(2) > input').val("");
                    $('#registerForm > div:nth-child(2) > input').removeClass("valid");
                    $('#registerForm > div:nth-child(2) > input').addClass("invalid");
                }
    
                //500- Documents not found
                if(data == "500")
                {
                    $('.back').click();
                    alert("Sorry, we are having trouble with our servers at the moment. Try again later!");
                }
    
            })
        }
        else
        {
            alert("Fill up all the fields correctly before submitting!");
        }
    })

    //Enable users to press enter to submit the form
    $("#registerForm").keypress(function(event)
    {
        var keycode = (event.keyCode ? event.keyCode : event.which);

        //If the user presses ENTER
        if(keycode == '13')
        {
            $('#registerForm').submit();
        }
    })

    //Enable users to press enter to submit the form
    $("#loginForm").keypress(function(event)
    {
        var keycode = (event.keyCode ? event.keyCode : event.which);

        //If the user presses ENTER
        if(keycode == '13')
        {
            $('#loginForm').submit();
        }
    })
})

//Sets cookie in browser
function setCookie(cname, cvalue, exdays) 
{
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

//Gets cookie from browser
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