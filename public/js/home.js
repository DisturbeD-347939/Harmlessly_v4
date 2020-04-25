var date = new Date();

//Check if user is logged in
if(getCookie("email") == "")
{
    window.location.href = "/";
}

$(document).ready(function()
{
    /******************************************* SETUP ************************************************/
    //Variables
    var backgroundColorHEX = "#EAEDED";
    var color1 = "#009FE3";
    var substancesInfo;

    //Timers
    var updateNewSubstances;

    //Sizing/Position - Dashboard Nav Bar
    $('#dashboardNavBar > div:first-child > div').css('width', $('#dashboardNavBar > div:first-child > p').width()/1.5);
    $('#dashboardNavBar > div:last-child > div').css('width', $('#dashboardNavBar > div:last-child > p').width()/1.5);

    //Sizing/Position - New Substance
    $('#newSubstance').height($(document).height() - $('footer').height());

    //Hide Elements - Dashboard Nav Bar
    $('#dashboardNavBar > div:last-child > div').css('background-color', backgroundColorHEX);

    //Hide Elements - New Substance
    $('#newSubstance').hide();
    $('#newSubstanceSecond').hide();

    //Processing calendar
    $('#dashboardMiniCalendarMonth').text(date.toLocaleString('default', { month: 'long' }));

    var days = [];
    //Get first date of the month number
    var firstDayMonthNumber = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    var daysLength = 34;

    //If the month starts on a Sunday, add an extra week to the calendar
    if(firstDayMonthNumber == 7)
    {
        daysLength = 41;
    }
    
    //If it's not monday
    if(firstDayMonthNumber != 1)
    {
        for(var i = -Math.abs(firstDayMonthNumber - 2); i <= 0; i++)
        {
            days.push(new Date(date.getFullYear(), date.getMonth(), i).getDate())

            if(i+1 >= 1)
            {
                for(var j = 1; j <= new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); j++)
                {
                    days.push(j);
                    if(j+1 > new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())
                    {
                        var counterDays = 1;
                        for(var k = days.length; k <= daysLength; k++)
                        {
                            days.push(counterDays);
                            counterDays++;
                            if(k == daysLength)
                            {
                                for(var r = 0; r < days.length; r++)
                                {
                                    $('#dashboardMiniCalendar > div:last-child').append("<p>" + days[r] + "</p>");
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    else
    {
        for(var i = 1; i <= new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); i++)
        {
            days.push(i);
            if(i+1 > new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())
            {
                var counterDays = 1;
                for(var j = days.length; j <= daysLength; j++)
                {
                    days.push(counterDays);
                    counterDays++;
                    if(j == daysLength)
                    {
                        for(var k = 0; k < days.length; k++)
                        {
                            $('#dashboardMiniCalendar > div:last-child').append("<p>" + days[k] + "</p>");
                        }
                    }
                }
            }
        }
    }

    //Get data.json
    $.get('/getSubstanceData', function(data, status)
    {
        substancesInfo = data["Substances"];
    })

    /******************************************* DASHBOARD ************************************************/
    $('#footerDashboardBtn').click(function()
    {
        cancelTimers();
        $('#dashboard').show();
        $('#newSubstance').hide();
    })

    $("#calendarBtn").click(function()
    {
        $('#dashboardNavBar > div:first-child > div').css('background-color', backgroundColorHEX);
        $('#dashboardNavBar > div:last-child > div').css('background-color', color1);
    })

    $("#dashboardBtn").click(function()
    {
        $('#dashboardNavBar > div:last-child > div').css('background-color', backgroundColorHEX);
        $('#dashboardNavBar > div:first-child > div').css('background-color', color1);
    })



    /******************************************* NEW SUBSTANCE ************************************************/
    $('#footerNewSubstanceBtn').click(function()
    {
        var substanceInputData = [];
        cancelTimers();
        $('#dashboard').hide();
        $('#displaySubstancesLoading').show();
        $('#newSubstance').show();

        if(substancesInfo)
        {
            $('#displaySubstances').empty();

            $('#displaySubstancesLoading').hide();

            if(Object.keys(substancesInfo).length >= 3)
            {
                $('#displaySubstances').css('grid-template-columns', 'repeat(3, 1fr)');
            }
            else
            {
                $('#displaySubstances').css('grid-template-columns', 'repeat(' + Object.keys(substancesInfo).length + ', 1fr)   ');
            }

            $('#displaySubstancesLoading')
            for(var i = 0; i < Object.keys(substancesInfo).length; i++)
            {
                $('#displaySubstances').append("<div class='substanceCard z-depth-4'><div class='substanceCardImage'><img   src='./img/substances/" + Object.keys(substancesInfo)[i] + ".png'></div><div class='substanceCardName'><p     class='center'>" + Object.keys(substancesInfo)[i] + "</p></div></div");

                
            }
        }
        else
        {
            updateNewSubstances = setTimeout(function()
            {
                $('#footerNewSubstanceBtn').click();
            }, 500);
        }

        $('.substanceCard').click(function(e)
        {
            substanceInputData.push($(e.currentTarget).children()[1].innerText);
            $('#newSubstanceFirst').hide();
            $('#newSubstanceSecond').show();
            $('#inputDoseScale').css('margin-bottom', $('#inputDose').css('marginBottom'));
            $('#inputDoseScale').text(substancesInfo[$(e.currentTarget).children()[1].innerText]["dosages"]["scale"]);
        })

        $('#submitDosage').click(function()
        {
            if($('#inputDose').hasClass("valid"))
            {
                console.log("submitted");
            }
        })
    })
