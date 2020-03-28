$(document).ready(function()
{
    $('#loginDiv').hide();
    $('#registerDiv').hide();

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
        
        var inputs = $('#loginForm :input');
        var values = {};
        inputs.each(function()
        {
            values[this.name] = $(this).val();
        })

        console.log(values);
    })
    
    $('#registerForm').submit(function(e)
    {
        e.preventDefault();
        console.log("Submitted register");
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

