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

    $('#register').click(function()
    {
        $('#home').hide();
        $('#registerDiv').show();
    })
    
    $('#login').click(function()
    {
        $('#home').hide();
        $('#loginDiv').show();
    })

    $('.back').click(function()
    {
        $('#home').show();
        $('#loginDiv').hide();
        $('#registerDiv').hide();
    })

    $('#loginButton').click(function()
    {
        $('#loginForm').submit();
    })

    $('#registerButton').click(function()
    {
        $('#registerForm').submit();
    })

    $('#loginForm').submit(function(e)
    {
        e.preventDefault();
        
        var valid = true;
        var inputs = $('#loginForm :input');
        var values = {};
        inputs.each(function()
        {
            values[this.name] = $(this).val();
        })

        $('#loginForm > div > input').each(function(index)
        {
            if(!$(this).hasClass("valid")) { valid = false; }
        })

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
                    console.log("Wrong password/email");
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
            console.log("Submitted register");
        }
    })
    
    $('#registerForm').submit(function(e)
    {
        e.preventDefault();

        var valid = true;
        var inputs = $('#registerForm :input');
        var values = {};
        inputs.each(function()
        {
            values[this.name] = $(this).val();
            if(!$(this).hasClass("valid")) { valid = false; }
        })

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
            console.log("Submitted register");
        }
        else
        {
            alert("Fill up all the fields correctly before submitting!");
        }
    })

    //Put both together using $(this)

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

function setCookie(cname, cvalue, exdays) 
{
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}