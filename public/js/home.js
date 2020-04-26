var date = new Date();
var email;

//Check if user is logged in
if(getCookie("email") == "")
{
    window.location.href = "/";
}
else
{
    email = getCookie("email");
}

$(document).ready(function()
{
    /******************************************* SETUP ************************************************/
    //Variables
    var backgroundColorHEX = "#EAEDED";
    var color1 = "#009FE3";
    var substancesInfo;

    //Hide Elements - New Substance
    $('#newSubstance').hide();
    $('#newSubstanceSecond').hide();
    $('#newSubstanceThird').hide();
    $('#newSubstanceFourth').hide();

    //Timers
    var updateNewSubstances;

    //Sizing/Position - Footer
    $('#footerNewSubstanceBtn').width($('#footerNewSubstanceBtn').height());
    $('#footerCalendarBtn').width($('#footerCalendarBtn').height());
    $('#footerBurgerBtn').width($('#footerBurgerBtn').height());

    //Sizing/Position - Dashboard Nav Bar
    $('#dashboardNavBar > div:first-child > div').css('width', $('#dashboardNavBar > div:first-child > p').width()/1.5);
    $('#dashboardNavBar > div:last-child > div').css('width', $('#dashboardNavBar > div:last-child > p').width()/1.5);

    //Sizing/Position - New Substance
    $('#newSubstance').height($(document).height() - $('footer').height());

    //Hide Elements - Dashboard Nav Bar
    $('#dashboardNavBar > div:last-child > div').css('background-color', backgroundColorHEX);

    //Initialize materialize items
    $('.timepicker').timepicker();
    $('.datepicker').datepicker();

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
                substanceInputData.push($('#inputDose').val());
                $('#newSubstanceSecond').hide();
                $('#newSubstanceThird').show();
            }
        })

        $('#submitDoseTime').click(function()
        {
            if($('#inputDoseTime').val() != "" && $('#inputDoseDate').val() != "")
            {
                var timeChosen = $('#inputDoseTime').val();
                var dateChosen = $('#inputDoseDate').val();

                //Parse Time
                timeChosen = timeChosen.split(" ");
                var timeChosenSplit = timeChosen[0].split(":");
                var timeChosenHour = parseInt(timeChosenSplit[0]);
                var timeChosenMin = timeChosenSplit[1];

                //Convert from 12 hour clock to 24 hour clock
                if(timeChosen[1] == "AM")
                {
                    if(timeChosenHour == 12)
                    {
                        timeChosenHour = 0;
                    }
                }
                else
                {
                    if(timeChosenHour != 12)
                    {
                        timeChosenHour += 12;
                    }
                }

                //Parse Date
                dateChosen = dateChosen.replace(',', "");
                dateChosen = dateChosen.split(" ");
                [dateChosen[0], dateChosen[1]] = [dateChosen[1], dateChosen[0]];
                dateChosen = dateChosen.join(" ");

                //Detect timezone
                var timeChosenTimezone = new Date().getTimezoneOffset();

                if(timeChosenTimezone < 0)
                {
                    timeChosenTimezone = "+" + Math.abs(timeChosenTimezone/60);
                }
                else
                {
                    timeChosenTimezone = "-" + Math.abs(timeChosenTimezone/60);
                }

                //Put it all together and create timestamp
                var timeChosenTimestamp = Date.parse(dateChosen + " " + timeChosenHour + ":" + timeChosenMin + ":00 GMT" + timeChosenTimezone);
                substanceInputData.push(timeChosenTimestamp/1000);

                $('#newSubstanceThird').hide();
                $('#newSubstance').height("auto");

                var timeDifference = (Math.round((timeChosenTimestamp - Math.round(new Date().getTime()))/1000))/3600;
                var chosenSubstanceTimes = substancesInfo[substanceInputData[0]]["duration"]["vars"];

                $('#uploadingInputsLoading').hide();
                $('#moodInputBefore > h6').show();

                if(timeDifference >= -Math.abs(chosenSubstanceTimes["kick_in"]) && timeDifference < 4)
                {
                    //About to take the substance
                    $('#newSubstanceFourth > h5').text("How do you feel");
                    $('#moodInputBefore > h6').hide();
                    $('#moodInputBefore').show();
                    $('#moodInputDuring').hide();
                    $('#moodInputAfter').hide();
                }
                else if(timeDifference < -Math.abs(chosenSubstanceTimes["maximum_duration"]))
                {
                    //Substance effects have worn off
                    $('#newSubstanceFourth > h5').text("How did you felt");
                    $('#moodInputBefore').show();
                    $('#moodInputDuring').show();
                    $('#moodInputAfter').show();
                }
                else if(timeDifference < -Math.abs(chosenSubstanceTimes["kick_in"]))
                {
                    //On the effects of the susbtance at the moment
                    $('#newSubstanceFourth > h5').text("How did/do you feel");
                    $('#moodInputBefore').show();
                    $('#moodInputDuring').show();
                    $('#moodInputAfter').hide();
                }
                else
                {
                    //Taking the substance in the future
                    $('#dashboard').show();
                }

                $('#newSubstanceFourth').show();

                var moods = [];

                $('.moods > img').click(function(e)
                {
                    if($(e.target).parent().parent().attr('id') == "moodInputBefore")
                    {
                        if(moods[0])
                        {
                            $('#moodInputBefore > .moods').children('img').each(function()
                            {
                                $(this).attr('src', './img/moods/' + $(this).attr('class') + '.png');
                            })
                        }
                        moods[0] = $(e.target).attr('class');
                    }

                    if($(e.target).parent().parent().attr('id') == "moodInputDuring")
                    {
                        if(moods[1])
                        {
                            $('#moodInputDuring > .moods').children('img').each(function()
                            {
                                $(this).attr('src', './img/moods/' + $(this).attr('class') + '.png');
                            })
                        }
                        moods[1] = $(e.target).attr('class');
                    }

                    if($(e.target).parent().parent().attr('id') == "moodInputAfter")
                    {
                        if(moods[2])
                        {
                            $('#moodInputAfter > .moods').children('img').each(function()
                            {
                                $(this).attr('src', './img/moods/' + $(this).attr('class') + '.png');
                            })
                        }
                        moods[2] = $(e.target).attr('class');
                    }

                    $(e.target).attr('src', './img/moods/' + $(e.target).attr('class') + 'Clicked.png');
                })

                $('#skipMoodsInput').click(function()
                {
                    moods[0] = "neutral";
                    moods[1] = "neutral";
                    moods[2] = "neutral";

                    $('#submitMoods').click();
                })

                $('#submitMoods').click(function()
                {
                    if(moods[0] && moods[1] && moods[2])
                    {
                        substanceInputData.push(moods);
                        $('#submitMoods').hide();
                        $('#skipMoodsInput').hide();
                        $('#uploadingInputsLoading').show();

                        $.post('/addDose',
                        {
                            data: substanceInputData,
                            email: email
                        }, 
                        function(data, status)
                        {
                            if(data == "200")
                            {
                                $('#dashboard').show();
                                $('#newSubstanceFourth').hide();
                                $('#newSubstance').hide();
                            }
                        })
                    }
                })
            }
        })
    })

    function cancelTimers()
    {
        clearTimeout(updateNewSubstances);
    }
})

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