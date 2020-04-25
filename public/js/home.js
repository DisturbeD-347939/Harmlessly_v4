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

    //Sizing/Position - Footer
    $('#addBtn').css
    ({
        'margin-bottom': ($('#wikipediaBtn').position()).top * 4
    });

    //Hide Elements - Dashboard Nav Bar
    $('#dashboardNavBar > div:last-child > div').css('background-color', backgroundColorHEX);

    //Processing calendar
    $('#dashboardMiniCalendarMonth').text(date.toLocaleString('default', { month: 'long' }));

    var days = [];
    var firstDayMonthNumber = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    
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
                        for(var k = days.length; k <= 34; k++)
                        {
                            days.push(counterDays);
                            counterDays++;
                            if(k == 34)
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

    /******************************************* DASHBOARD ************************************************/
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

    /******************************************* MINI CALENDAR ************************************************/
    //console.log(new Date(date.getFullYear(), date.getMonth(), -2));
})