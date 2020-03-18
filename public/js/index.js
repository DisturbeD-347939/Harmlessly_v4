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
    })
})

