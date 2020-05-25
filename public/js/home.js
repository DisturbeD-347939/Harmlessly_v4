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
    var backgroundColor = "#EAEDED";
    var color1 = "#009FE3";
    var color2 = "#3F61AA";
    var color3 = "#31C1FF";
    var substancesInfo;
    var substancesUsage = {};
    var prices = {"MDMA": 35, "Cocaine": 80}

    //Materialize
    $('.collapsible').collapsible();
    $('.dropdown-trigger').dropdown();
    $('.timepicker').timepicker();
    $('.datepicker').datepicker();
    $('select').formSelect();
    $('.modal').modal();

    //Hide Elements - New Substance
    $('#newSubstanceSecond, #newSubstanceThird, #newSubstanceFourth').hide();

    //Hide Elements - Dashboard Nav Bar
    $('#dashboardNavBar > div:last-child > div').css('background-color', backgroundColor);

    //Hide Elements - Wikipedia
    $('#wikipediaSubstanceInfo').hide();

    //Hide Elements - Burguer
    $('#burger').hide();

    //Hide Elements - Settings
    $('#settingsColors, #settingsCurrency, #settingsSubstancePriceList').hide();

    //Hide more elements
    hideAppTabs();
    $('#dashboard').show();

    //Timers
    var updateNewSubstances;

    //Sizing/Position - Footer
    $('#footerNewSubstanceBtn').width($('#footerNewSubstanceBtn').height());
    $('#footerSocialBtn').width($('#footerSocialBtn').height());
    $('#footerBurgerBtn').width($('#footerBurgerBtn').height());
    $('#footerNewSubstanceBtnBorder').css
    ({
        width: $('#footerNewSubstanceBtn').width() + 10,
        height: $('#footerNewSubstanceBtn').height() + 10,
        top: $('#footerNewSubstanceBtn').position().top - 5,
    })

    $('#burger').css('top', screen.height - $('#burger').height() - $('#footerNavBar').height());
    
    //Sizing/Position - Dashboard Nav Bar
    $('#dashboardNavBar > div:first-child > div').css('width', $('#dashboardNavBar > div:first-child > p').width()/1.5);
    $('#dashboardNavBar > div:last-child > div').css('width', $('#dashboardNavBar > div:last-child > p').width()/1.5);
    
    //Fill up settings colors
    $('#backgroundColor').attr('value', backgroundColor);
    $('#backgroundColorPreview').css('background-color', backgroundColor);

    $('#mainColor').attr('value', color1);
    $('#mainColorPreview').css('background-color', color1);

    $('#secondaryColor').attr('value', color2);
    $('#secondaryColorPreview').css('background-color', color2);

    $('#tertiaryColor').attr('value', color3);
    $('#tertiaryColorPreview').css('background-color', color3);

    //Get data.json
    $.get('/getSubstanceData', function(data, status)
    {
        substancesInfo = data["Substances"];
    })

    $.get('/getSubstanceUsage',
    {
        email: email
    },
    function(data, status)
    {
        console.log(data);
        if(data["code"] == "200")
        {
            substancesUsage = data["data"];
            populateDashboardSubstances();
            populateSubstancesPriceList();
            populateMiniCalendar();
        }
        else if(data["code"] == "204")
        {
            $('#displayEntriesLoading').hide();
            $('#dashboardSubstances').append("<h5>No substances used! Yay! 🥳</h5>");
        }
    })

    footerResetImages("home");

    /******************************************* DASHBOARD ************************************************/
    $('#footerDashboardBtn').click(function()
    {
        cancelTimers();
        clearSubstanceInputs();
        hideAppTabs();
        footerResetImages("home");
        $('#dashboard').show();
        $('#newSubstance').hide();
    })

    $("#calendarBtn").click(function()
    {
        $('#dashboardNavBar > div:first-child > div').css('background-color', backgroundColor);
        $('#dashboardNavBar > div:last-child > div').css('background-color', color1);
    })

    $("#dashboardBtn").click(function()
    {
        $('#dashboardNavBar > div:last-child > div').css('background-color', backgroundColor);
        $('#dashboardNavBar > div:first-child > div').css('background-color', color1);
    })

    function populateDashboardSubstances()
    {
        $('#displayEntriesLoading').hide();
        $('#dashboardSubstances').css('margin-top', '15');
        $('#dashboardSubstances').empty();

        var recentTimestamp = {};
        var weekTimestamps = [];

        for(var i = 0; i < Object.keys(substancesUsage).length; i++)
        {
            recentTimestamp[Object.keys(substancesUsage)[i]] = [];
            for(var j = 0; j < substancesUsage[Object.keys(substancesUsage)[i]].length; j++)
            {
                recentTimestamp[Object.keys(substancesUsage)[i]].push(substancesUsage[Object.keys(substancesUsage)[i]][j]["timestamp"]);

                weekTimestamps[lessThanAWeek(+ new Date(), substancesUsage[Object.keys(substancesUsage)[i]][j]["timestamp"] * 1000)] = true;

                if(j+1 >= substancesUsage[Object.keys(substancesUsage)[i]].length)
                {
                    recentTimestamp[Object.keys(substancesUsage)[i]] = Math.max(...recentTimestamp[Object.keys(substancesUsage)[i]]);
                    
                }
            }
            if(i+1 >= Object.keys(substancesUsage).length)
            {
                if(weekTimestamps[0] || weekTimestamps[1])
                {
                    weekTimestamps.shift();
                    weekTimestamps[0] = true;
                }
            }
        }

        for(var i = 0; i < Object.keys(substancesUsage).length; i++)
        {
            $('#dashboardSubstances').append("<div class='dashboardSubstancesGroups backgroundColorInside z-depth-3 gradient'><div class='dashboardSubstancesGroupsData'><h5>" + Object.keys(substancesUsage)[i] + "</h5><p>Last consumed - " + timeDifference(+ new Date(), recentTimestamp[Object.keys(substancesUsage)[i]]*1000) + "</p><div class='dashboardSubstancesGroupsStatus'></div></div><i class='medium material-icons'>arrow_forward_ios</i>");

            if(i+1 >= Object.keys(substancesUsage).length)
            {
                for(var j = 0; j < 7; j++)
                {
                    $('.dashboardSubstancesGroupsStatus').append("<div class='dashboardSubstancesGroupsStatus" + j + "'></div>");

                    if(weekTimestamps[j])
                    {
                        $('.dashboardSubstancesGroupsStatus:last-child > div:last-child').css('background-color', 'red');
                    }

                    if(j+1 >= 7)
                    {
                        $('.dashboardSubstancesGroups > .dashboardSubstancesGroupsStatus').css('margin-bottom', $('.dashboardSubstancesGroups > h5').css('marginBottom'));
                    }
                }
            }
        }
    }

    /******************************************* MINI CALENDAR ************************************************/

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
                        if(days.length <= daysLength)
                        {
                            for(var k = 0; k <= daysLength; k++)
                            {
                                days.push(counterDays);
                                counterDays++;
                                if(k == daysLength)
                                {
                                    for(var r = 0; r < days.length; r++)
                                    {
                                        $('#dashboardMiniCalendar > div:last-child').append("<p class='backgroundColorInside'>" + days[r] + "</p>");
                                    }
                                }
                            }
                        }
                        else
                        {
                            for(var r = 0; r < days.length; r++)
                            {
                                $('#dashboardMiniCalendar > div:last-child').append("<p class='backgroundColorInside'>" + days[r] + "</p>");
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

    function populateMiniCalendar()
    {
        for(var i = 0; i < Object.keys(substancesUsage).length; i++)
        {
            console.log(Object.keys(substancesUsage)[i]);
            for(var j = 0; j < substancesUsage[Object.keys(substancesUsage)[i]].length; j++)
            {
                var date = new Date(substancesUsage[Object.keys(substancesUsage)[i]][j]["timestamp"] * 1000);
                var currentDate = new Date();
                if(date.getMonth() == currentDate.getMonth())
                {
                    $('#dashboardMiniCalendar > div:last-child').children('p').each(function()
                    {
                        if(date.getDate() == $(this).text())
                        {
                            var averageMood = 0;
                            var averageMoodCounter = 0;
                            for(var k = 0; k < substancesUsage[Object.keys(substancesUsage)[i]][j]["moods"].length; k++)
                            {
                                if(substancesUsage[Object.keys(substancesUsage)[i]][j]["moods"][k] == "good")
                                {
                                    averageMood += 3;
                                    averageMoodCounter++;
                                }
                                else if(substancesUsage[Object.keys(substancesUsage)[i]][j]["moods"][k] == "neutral")
                                {
                                    averageMood += 2;
                                    averageMoodCounter++;
                                }
                                else if(substancesUsage[Object.keys(substancesUsage)[i]][j]["moods"][k] == "bad")
                                {
                                    averageMood += 1;
                                    averageMoodCounter++;
                                }

                                if(k+1 >= substancesUsage[Object.keys(substancesUsage)[i]][j]["moods"].length)
                                {
                                    var finalAverage = Math.round(averageMood/averageMoodCounter);

                                    $(this).width('20px');
                                    $(this).css('text-align', 'center');
                                    $(this).css('color', "black");
                                    
                                    switch(finalAverage)
                                    {
                                        case 1:
                                            $(this).css("background-color", "red");
                                            break;
                                        case 2:
                                            $(this).css("background-color", "yellow");
                                            break;
                                        case 3:
                                            $(this).css("background-color", "green");
                                            break;

                                        default:
                                            break;
                                    }
                                }
                            }
                            
                            
                        }
                    })
                }
            }
        }
    }


    /******************************************* NEW SUBSTANCE ************************************************/
    
    var moods, substanceInputData, dosageDangerLevel;

    $('#footerNewSubstanceBtn').click(function()
    {
        if(!$("#newSubstanceFirst, #newSubstanceSecond, #newSubstanceThird, #newSubstanceFourth").is(":visible"))
        {
            moods = ["f", "f", "f"];
            substanceInputData = [];

            footerResetImages("add");
            cancelTimers();
            hideAppTabs();

            $('#displaySubstancesLoading, #newSubstance, #newSubstanceFirst').show();
            $('#newSubstance').height($(document).height() - $('footer').height());

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
                    $('#displaySubstances').css('grid-template-columns', 'repeat(' + Object.keys(substancesInfo).length + ', 1fr)   ')  ;
                }

                $('#displaySubstancesLoading')
                for(var i = 0; i < Object.keys(substancesInfo).length; i++)
                {
                    $('#displaySubstances').append("<div class='substanceCard z-depth-4'><div class='substanceCardImage'><img   src='./img/substances/" + Object.keys(substancesInfo)[i].toLowerCase() + ".png'></div><div class='substanceCardName'><p class='center'>" + Object.keys(substancesInfo)[i] + "</p></div></div");
                }
            }
            else
            {
                updateNewSubstances = setTimeout(function()
                {
                    $('#footerNewSubstanceBtn').click();
                }, 500);
            }
        }
    })

    //On first page selection, open second page
    $('body').delegate('.substanceCard', 'click', function(e)
    {
        substanceInputData.push($(e.currentTarget).children()[1].innerText);
        $('#newSubstanceFirst').hide();
        $('#newSubstanceSecond').show();
        $('#inputDoseScale').css('margin-bottom', $('#inputDose').css('marginBottom'));
        $('#inputDoseScale').text(substancesInfo[$(e.currentTarget).children()[1].innerText]["dosages"]["scale"]);
    })

    $('body').delegate('#submitDosage', 'click', function(e)
    {
        var alert = M.Modal.getInstance($('#alert'));
        if($('#inputDose').hasClass("valid"))
        {
            substanceInputData.push($('#inputDose').val());
            $('#newSubstanceSecond').hide();
            $('#newSubstanceThird').show();

            if(dosageDangerLevel == "red")
            {
                $('#alert > .modal-content > h4').text("High dose");
                $('#alert > .modal-content > p').text("You are taking a dose higher than the recommended amount. Please make sure to read the substance wikipedia to know what to expect and to gather some information on what to do in order not to have a bad time.");
                alert.open();
            }
            else if(dosageDangerLevel == "yellow")
            {
                $('#alert > .modal-content > h4').text("Be safe");
                $('#alert > .modal-content > p').text("Make sure you read more about the substance you are taking in our wikipedia for more information on what to expect and what you should do.");
                alert.open();
            }
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
            var timeChosenTimestamp = Date.parse(dateChosen + " " + timeChosenHour + ":" + timeChosenMin + ":" + new Date().getSeconds() + " GMT"+ timeChosenTimezone);

            substanceInputData.push(timeChosenTimestamp/1000);

            $('#newSubstanceThird').hide();

            var timeDifference = (Math.round((timeChosenTimestamp - Math.round(new Date().getTime()))/1000))/3600;
            var chosenSubstanceTimes = substancesInfo[substanceInputData[0]]["duration"]["vars"];

            $('#uploadingInputsLoading').hide();
            $('#moodInputBefore > h6').show();

            if(timeDifference >= -Math.abs(chosenSubstanceTimes["kick_in"]) && timeDifference < 4)
            {
                //About to take the substance
                $('#newSubstanceFourth > h5').text("How do you feel");
                $('#moodInputBefore').show();
                $('#moodInputDuring, #moodInputAfter, #moodInputBefore > h6').hide();
                displayMoodsTab();
            }
            else if(timeDifference < -Math.abs(chosenSubstanceTimes["maximum_duration"]))
            {
                //Substance effects have worn off
                $('#newSubstanceFourth > h5').text("How did you felt");
                $('#moodInputBefore, #moodInputDuring, #moodInputAfter').show();
                displayMoodsTab();
            }
            else if(timeDifference < -Math.abs(chosenSubstanceTimes["kick_in"]))
            {
                //On the effects of the susbtance at the moment
                $('#newSubstanceFourth > h5').text("How did/do you feel");
                $('#moodInputBefore, #moodInputDuring').show();
                $('#moodInputAfter').hide();
                displayMoodsTab();
            }
            else
            {
                //Taking the substance in the future
                substanceInputData.push(moods);
                submitMoods(substanceInputData);
            }
        }
    })

    $('#skipMoodsInput').click(function()
    {
        moods[0] = "f";
        moods[1] = "f";
        moods[2] = "f";
        $('#submitMoods').click();
    })

    $('#submitMoods').click(function()
    {
        if(moods[0] && moods[1] && moods[2])
        {
            substanceInputData.push(moods);
            $('#submitMoods, #skipMoodsInput').hide();
            $('#uploadingInputsLoading').show();
            submitMoods(substanceInputData);
        }
    })

    //Go back on second page
    $('#newSubstanceSecondBack').click(function(e)
    {
        substanceInputData.pop();
        $('#newSubstanceSecond').hide();
        $('#newSubstanceFirst').show();
    })

    $('#newSubstanceThirdBack').click(function(e)
    {
        substanceInputData.pop();
        $('#newSubstanceThird').hide();
        $('#newSubstanceSecond').show();
    })

    $('#newSubstanceFourthBack').click(function(e)
    {
        substanceInputData.pop();
        $('#newSubstanceFourth').hide();
        $('#newSubstanceThird').show();
        $('#newSubstance').height($(document).height() - $('footer').height());
    })

    $('#inputDose').on('input', function()
    {
        var greenLevelLimit = (parseInt(substancesInfo[substanceInputData]["dosages"]["common"]) + parseInt(substancesInfo[substanceInputData]["dosages"]["strong"])) / 2;
        var yellowLevelLimit = (parseInt(substancesInfo[substanceInputData]["dosages"]["strong"]) + parseInt(substancesInfo[substanceInputData]["dosages"]["heavy"])) / 2;
        if($(this).val() < greenLevelLimit)
        {
            dosageDangerLevel = "green";
            $(this).css('border-bottom', '2px solid green');
        }
        else if($(this).val() < yellowLevelLimit)
        {
            dosageDangerLevel = "yellow";
            $(this).css('border-bottom', '2px solid yellow');
        }
        else
        {
            dosageDangerLevel = "red";
            $(this).css('border-bottom', '2px solid red');
        }
    })

    function displayMoodsTab()
    {
        $('#newSubstance').height("auto");
        $('#newSubstanceFourth').show();

        $('.moods > img').click(function(e)
        {
            var moodInputVar = ["moodInputBefore", "moodInputDuring", "moodInputAfter"];
            for(var i = 0; i < moodInputVar.length; i++)
            {
                if($(e.target).parent().parent().attr('id') == moodInputVar[i])
                {
                    if(moods[i])
                    {
                        $('#' + moodInputVar[i] + " > .moods").children('img').each(function()
                        {
                            $(this).attr('src', './img/moods/' + $(this).attr('class') + '.png');
                        })
                    }
                    moods[i] = $(e.target).attr('class');
                }
            }
            $(e.target).attr('src', './img/moods/' + $(e.target).attr('class') + 'Clicked.png');
        })
    }

    function submitMoods(inputs)
    {
        $.post('/addDose',
        {
            data: inputs,
            email: email
        }, 
        function(data, status)
        {
            $('.moods').children('img').each(function()
            {
                $(this).attr('src', './img/moods/' + $(this).attr('class') + '.png');
            })
            if(data == "200")
            {
                if(!substancesUsage[inputs[0]])
                {
                    substancesUsage[inputs[0]] = [];
                }

                substancesUsage[inputs[0]].push({dosage: inputs[1], timestamp: inputs[2], moods: inputs[3]});
                console.log(substancesUsage);

                $('#submitMoods, #skipMoodsInput, #dashboard').show();
                $('#uploadingInputsLoading, #newSubstanceFourth, #newSubstance').hide();

                populateDashboardSubstances();
                populateMiniCalendar();
                footerResetImages("social");
                clearSubstanceInputs();
            }
        })
    }

    /******************************************* WIKIPEDIA ************************************************/

    $('#footerWikipediaBtn').click(function()
    {
        footerResetImages("wiki");
        hideAppTabs();
        $('#wikipedia').show();
        $('#wikipedia').height($(window).height() - $('footer').height());

        var substancesWikiNames = Object.keys(substancesInfo);

        $('#wikiSubstances').empty();

        for(var i = 0; i < substancesWikiNames.length; i++)
        {
            $('#wikiSubstances').append("<div class='wikiSubstance z-depth-4' name='" + substancesWikiNames[i] + "'><img src='./img/substances/" + substancesWikiNames[i].toLowerCase() + ".png'></img><p>" + substancesWikiNames[i] + "</p></div>")
        }
    })

    $('body').delegate('.wikiSubstance', 'click', function()
    {
        $('#wikipediaMenu').hide();
        $('#wikipediaSubstanceInfo').show();
        $('#wikipedia').css({"justify-content": 'flex-start'});
        $('#wikipediaSubstanceTitle').text($(this).attr('name'));

        for(var i = 0; i < $('#wikipediaSubstanceInfo > ul > li').length; i++)
        {
            var infoName = $('#wikipediaSubstanceInfo > ul > li:nth-child(' + (i + 1).toString() + ') > div:first-child').text();
            console.log(infoName);

            for(var j = 0; j < infoName.length; j++)
            {
                if(infoName[j] == infoName[j].toUpperCase() && infoName[j] != " " && infoName[j] != "_")
                {
                    if(j > 0)
                    {
                        infoName = infoName.substring(j);
                    }
                }
            }

            infoName = infoName.replace(' ', '_');
            console.log(infoName);
            var infoBody = substancesInfo[$(this).attr('name')][infoName.toLowerCase()];
            if(typeof(infoBody) == "object")
            {
                var infoBodyKeys = Object.keys(infoBody);
                infoBody = "";
                infoBody += "<p>";
                infoBody += substancesInfo[$(this).attr('name')][infoName.toLowerCase()]["info"];
                infoBody += "</p>";
                for(var j = 1; j < infoBodyKeys.length; j++)
                {
                    var ulTitle = infoBodyKeys[j].replace("_", " ");
                    ulTitle = ulTitle[0].toUpperCase() + ulTitle.slice(1);
                    
                    if(ulTitle != "Vars")
                    {
                        infoBody += "<p><h6>" + ulTitle + "</h6></p><ul>";
                        if(typeof(substancesInfo[$(this).attr('name')][infoName.toLowerCase()][infoBodyKeys[j]]) == "object")
                        {
                            for(var k = 0; k < substancesInfo[$(this).attr('name')][infoName.toLowerCase()][infoBodyKeys[j]].length; k++)
                            {
                                infoBody += "<li>" + substancesInfo[$(this).attr('name')][infoName.toLowerCase()][infoBodyKeys[j]][k] + "</li>";
                                if(k+1 >= substancesInfo[$(this).attr('name')][infoName.toLowerCase()][infoBodyKeys[j]].length)
                                {
                                    infoBody += "</ul>";
                                }
                            }
                        }
                        else
                        {
                            infoBody += "<p>" + substancesInfo[$(this).attr('name')][infoName.toLowerCase()][infoBodyKeys[j]] + "</p>";
                        }
                    }

                    if(j+1 >= infoBodyKeys.length)
                    {
                        $('#wikipediaSubstanceInfo > ul > li:nth-child(' + (i + 1).toString() + ') > div:last-child').append(infoBody);
                    }
                }
                
            }
            else
            {
                $('#wikipediaSubstanceInfo > ul > li:nth-child(' + (i + 1).toString() + ') > div:last-child').text(infoBody);
            }
        }
    })

    $('#wikipediaBack').click(function()
    {
        $('#wikipediaSubstanceInfo').hide();
        $('#wikipediaMenu').show();

        $('#wikipediaSubstanceInfo > ul > li > div:last-child').empty();
    })

    /******************************************* GROUPS INSIGHTS ************************************************/

    var editingThis;

    $('body').delegate('.dashboardSubstancesGroups', 'click', function()
    {
        hideAppTabs();
        $('#detailedSubstance').show();
        $('.detailedSubstanceRecentActivity').empty();

        var substance = $(this).children("div").children("h5").text();
        var consumed = 0;
        var timestamps = [];
        var lastUse;
        var timesUsed = substancesUsage[substance].length;

        for(var i = 0; i < timesUsed; i++)
        {
            var greenLevelLimit = (parseInt(substancesInfo[substance]["dosages"]["common"]) + parseInt(substancesInfo[substance]["dosages"]["strong"])) / 2;
            var yellowLevelLimit = (parseInt(substancesInfo[substance]["dosages"]["strong"]) + parseInt(substancesInfo[substance]["dosages"]["heavy"])) / 2;
            //var redLevelLimit = (parseInt(substancesInfo[substance]["dosages"]["heavy"]) + parseInt(substancesInfo[substance]["dosages"]["danger_level"])) / 2;
            var dangerLevel = "";

            consumed += parseInt(substancesUsage[substance][i]["dosage"]);
            timestamps.push(parseInt(substancesUsage[substance][i]["timestamp"]));

            $('.detailedSubstanceRecentActivity').append("<div id='" + i + "' name='" + substance + "' value='" + substancesUsage[substance][i]["id"] + "'' class='detailedSubstanceInput z-depth-2 gradient'><div class='detailedSubstanceData'><p>" + parseInt(substancesUsage[substance][i]["dosage"]) + "mg</p><div><p>10 seconds</p><i class='small material-icons'>arrow_forward_ios</i></div></div><div class='detailedSubstanceDanger'></div></div>")

            if(parseInt(substancesUsage[substance][i]["dosage"]) < greenLevelLimit)
            {
                dangerLevel = "green";
            }
            else if(parseInt(substancesUsage[substance][i]["dosage"]) < yellowLevelLimit)
            {
                dangerLevel = "yellow";
            }
            else
            {
                dangerLevel = "red";
            }
            
            //Set danger level color
            $('.detailedSubstanceInput:last-child > .detailedSubstanceDanger').css('background-color', dangerLevel);

            //Set timestamp
            $('.detailedSubstanceInput:last-child > .detailedSubstanceData > div > p').text(timeDifference(+ new Date(), parseInt(substancesUsage[substance][i]["timestamp"]) * 1000));

            if(i+1 >= timesUsed)
            {
                lastUse = Math.min(...timestamps) * 1000;
                lastUse = timeDifference(+ new Date(), lastUse);
                //lastUse = lastUse.replace("ago", "");
                lastUse = lastUse.replace("approximately", "");
                var totalSpent = (consumed * prices[substance]) / 1000;
                $('#detailedSubstance > h4').text(substance);
                $('#detailedSubstanceLastUse > p:last-child').text(lastUse);
                $('#detailedSubstanceConsumed > p:last-child').text(consumed + "mg");
                $('#detailedSubstanceTimesUsed > p:last-child').text(timesUsed);
                $('#detailedSubstanceTotalSpent > p:last-child').text("£" + totalSpent.toFixed(2));
            }
        }
    })

    $('#detailedSubstanceBack').click(function()
    {
        hideAppTabs();
        $('#dashboard').show();
    })

    $('body').delegate('.detailedSubstanceInput', 'click', function(e)
    {
        $('#editDetailedSubstance').show();
        $('#detailedSubstance').hide();

        var data = substancesUsage[$(this).attr('name')][$(this).attr('id')];
        var editTimestamp = new Date(data["timestamp"] * 1000);

        $('#editDetailedSubstance').attr('value', data["id"]);
        $('#editSubstanceName > p:last-child').text($(this).attr('name'));
        $('#editSubstanceDate > div > p').text(editTimestamp.toLocaleDateString());
        $('#editSubstanceTime > div > p').text(editTimestamp.getHours() + ":" + (editTimestamp.getMinutes()<10?'0':'') + editTimestamp.getMinutes());
        $('#editSubstanceDose > div > p').text(data["dosage"] + "mg");
        $('#editSubstanceCost > div > p').text("£35");

        if(data["moods"][0] != "f")
        {
            $('#editMoodBefore > div > img').show();
            $('#editMoodBefore > div > p').hide();

            $('#editMoodBefore > div > img').attr('src', './img/moods/' + data["moods"][0] + '.png');
        }
        else
        {
            $('#editMoodBefore > div > img').hide();
            $('#editMoodBefore > div > p').show();
        }

        if(data["moods"][1] != "f")
        {
            $('#editMoodWhileOnIt > div > img').show();
            $('#editMoodWhileOnIt > div > p').hide();

            $('#editMoodWhileOnIt > div > img').attr('src', './img/moods/' + data["moods"][1] + '.png');
        }
        else
        {
            $('#editMoodWhileOnIt > div > img').hide();
            $('#editMoodWhileOnIt > div > p').show();
        }

        if(data["moods"][2] != "f")
        {
            $('#editMoodAfterwards > div > img').show();
            $('#editMoodAfterwards > div > p').hide();

            $('#editMoodAfterwards > div > img').attr('src', './img/moods/' + data["moods"][2] + '.png');
        }
        else
        {
            $('#editMoodAfterwards > div > img').hide();
            $('#editMoodAfterwards > div > p').show();
        }
    })

    $('#editDetailedSubstanceBack').click(function()
    {
        hideAppTabs();
        $('#detailedSubstance').show();
    })

    var moodsEdit = {};

    $('#editDetailedSubstance > div > div').click(function(e)
    {
        hideAppTabs();
        $('#editDetailedSubstanceField').show();
        editingThis = $(this).attr('name');
        console.log($(this).attr('name'));
        $('#editDetailedSubstanceField > h4').text($(this).attr('name'));
        $('.editDetailedSubstanceFieldInput[name="' + $(this).attr('name') + '"').show();

        $('.moods > img').click(function(e)
        {
            var moodInputVar = ["moodInputBefore", "moodInputDuring", "moodInputAfter"];
            for(var i = 0; i < moodInputVar.length; i++)
            {
                if($(e.target).parent().parent().attr('id') == moodInputVar[i])
                {
                    if(moodsEdit[i])
                    {
                        $('#' + moodInputVar[i] + " > .moods").children('img').each(function()
                        {
                            $(this).attr('src', './img/moods/' + $(this).attr('class') + '.png');
                        })
                    }
                    moodsEdit[i] = $(e.target).attr('class');
                }
            }
            $(e.target).attr('src', './img/moods/' + $(e.target).attr('class') + 'Clicked.png');
        })
    })

    $('#editDetailedSubstanceFieldBack').click(function()
    {
        hideAppTabs();
        $('#editDetailedSubstance').show();
    })

    $('#submitEdit').click(function()
    {
        var inputData;

        if(editingThis == "Timestamp")
        {
            var timeChosen = $('.editDetailedSubstanceFieldInput[name="' + editingThis + '"] > .timepicker').val();
            var dateChosen = $('.editDetailedSubstanceFieldInput[name="' + editingThis + '"] > input:last-child').val();

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
            var timeChosenTimestamp = Date.parse(dateChosen + " " + timeChosenHour + ":" + timeChosenMin + ":" + new Date().getSeconds() + " GMT"+ timeChosenTimezone);
            
            inputData = timeChosenTimestamp/1000;
        }
        else if(editingThis == "Dosage")
        {
            var dose = $('#editInputDose').val();
            inputData = dose;
        }
        else if(editingThis == "Cost")
        {
            var cost = $('#editInputCost').val();
            inputData = cost;
        }
        else if(editingThis == "Moods")
        {
            inputData = moodsEdit;
        }

        $.post('/updateField',
            {
                field: editingThis,
                data: inputData,
                id: $('#editDetailedSubstance').attr('value'),
                email: getCookie("email"),
                substance: $('#editSubstanceName > p:last-child').text()
            },
            function(data, status)
            {
                if(data["code"] == "200")
                {
                    for(var i = 0; i < substancesUsage[$('#editSubstanceName > p:last-child').text()].length; i++)
                    {
                        if(substancesUsage[$('#editSubstanceName > p:last-child').text()][i]["id"] == $('#editDetailedSubstance').attr('value'))
                        {
                            substancesUsage[$('#editSubstanceName > p:last-child').text()][i][editingThis.toLowerCase()] = inputData.toString();
                            
                            if(editingThis == "Timestamp")
                            {
                                var editTimestamp = new Date(inputData * 1000);
                                $('#editSubstanceDate > div > p').text(editTimestamp.toLocaleDateString());
                                $('#editSubstanceTime > div > p').text(editTimestamp.getHours() + ":" + (editTimestamp.getMinutes()<10?'0':'') + editTimestamp.getMinutes());
                            }
                            else if(editingThis == "Moods")
                            {
                                console.log(moodsEdit);
                                if(moodsEdit[0] != "f")
                                {
                                    $('#editMoodBefore > div > img').show();
                                    $('#editMoodBefore > div > p').hide();
                                
                                    $('#editMoodBefore > div > img').attr('src', './img/moods/' + moodsEdit[0] + '.png');
                                }
                                else
                                {
                                    $('#editMoodBefore > div > img').hide();
                                    $('#editMoodBefore > div > p').show();
                                }
                            
                                if(moodsEdit[1] != "f")
                                {
                                    $('#editMoodWhileOnIt > div > img').show();
                                    $('#editMoodWhileOnIt > div > p').hide();
                                
                                    $('#editMoodWhileOnIt > div > img').attr('src', './img/moods/' + moodsEdit[1] + '.png');
                                }
                                else
                                {
                                    $('#editMoodWhileOnIt > div > img').hide();
                                    $('#editMoodWhileOnIt > div > p').show();
                                }
                            
                                if(moodsEdit[2] != "f")
                                {
                                    $('#editMoodAfterwards > div > img').show();
                                    $('#editMoodAfterwards > div > p').hide();
                                
                                    $('#editMoodAfterwards > div > img').attr('src', './img/moods/' + moodsEdit[2] + '.png');
                                }
                                else
                                {
                                    $('#editMoodAfterwards > div > img').hide();
                                    $('#editMoodAfterwards > div > p').show();
                                }
                            }
                            else
                            {
                                $('#editDetailedSubstanceInputs > div[name=' + editingThis + '] > div > p').text(inputData.toString());
                            }
                            $('#editDetailedSubstanceFieldBack').click();
                        }
                    }
                }
            })

    })


    /******************************************* SOCIAL ************************************************/

    $('#footerSocialBtn').click(function()
    {
        hideAppTabs();
        footerResetImages("social");
        $('#social').show();
    })

    $('#redditLogo').click(function()
    {
        window.location.href = "https://www.reddit.com/r/harmlessly/";
    })

    /******************************************* BURGER MENU ************************************************/

    var burgerOpen = false;

    $('#footerBurgerBtn').click(function()
    {
        burgerToggle();
        burgerOpen = true;
        $('#burger').css('left', screen.width - $('#burger').width());
    })

    function burgerToggle()
    {
        if($('#burger').is(":visible"))
        {
            $('#burger').hide();
            $("#footerBurgerBtn").attr('src', './img/icons/burger.png');
            burgerOn = true;
        }
        else
        {
            $('#burger').show();
            $("#footerBurgerBtn").attr('src', './img/icons/burgerClicked.png');
            burgerOn = true;
        }
    }

    $('body').click(function(e)
    {
        if(burgerOpen)
        {
            burgerOpen = false;
        }
        else if($(e.target).parents('#burger').length == 0)
        {
            $('#burger').hide();
            $("#footerBurgerBtn").attr('src', './img/icons/burger.png');
        }
    })

    /******************************************* SETTINGS ************************************************/

    $('#settingsBtn').click(function()
    {
        hideAppTabs();
        burgerToggle();
        footerResetImages("none");
        $('#settings').show();
    })

    $('#settingsColors > div > input').keyup(function(e)
    {
        //Check if its an hex color code
        if(/^#[0-9A-F]{6}$/i.test($(this).val()))
        {
            $(this).addClass('valid');
            $(this).removeClass('invalid');
            $('#' + $(this).attr('id') + 'Preview').css('background-color', $(this).val());
        }
        else
        {
            $(this).removeClass('valid');
            $(this).addClass('invalid');
        }
    })

    $('#applyColors').click(function()
    {
        $('.backgroundColorInside').css('color', $('#backgroundColor').val());
        $('.backgroundColorBack').css('background-color', $('#backgroundColor').val());

        $('.gradient').css('background-image', 'linear-gradient(45deg, ' + $('#secondaryColor').val() + ',' + $('#mainColor').val() + ')');
        $('.gradientFooter').css('background-image', 'linear-gradient(0deg, ' + $('#secondaryColor').val() + ',' + $('#mainColor').val() + ')');
        $('.gradientFooterBorder').css('background-image', 'linear-gradient(0deg, ' + $('#secondaryColor').val() + ',' + $('#tertiaryColor').val() + ')');

        $('.mainColorInside').css('color', $('#mainColor').val());
        $('.mainColorBack').css('background-color', $('#mainColor').val());
    })

    $('#themeBtn').click(function()
    {
        $('#settingsMenu').hide();
        $('#settingsColors').show();
    })

    $('#settingsColorBack').click(function()
    {
        $('#settingsMenu').show();
        $('#settingsColors').hide();
    })

    $('#currencyBtn').click(function()
    {
        $('#settingsMenu').hide();
        $('#settingsCurrency').show();
    })

    $('#settingsCurrencyBack').click(function()
    {
        $('#settingsMenu').show();
        $('#settingsCurrency').hide();
    })

    $('#pricesBtn').click(function()
    {
        $('#settingsMenu').hide();
        $('#settingsSubstancePriceList').show();
    })

    $('#settingsSubstancePriceListBack').click(function()
    {
        $('#settingsMenu').show();
        $('#settingsSubstancePriceList').hide();
    })

    function populateSubstancesPriceList()
    {
        for(var i = 0; i < Object.keys(substancesInfo).length; i++)
        {
            $('#substancesPriceLists').append('<div><p>' + Object.keys(substancesInfo)[i] + '</p><input type="number" value=' + "35" + '></input></div>')
        }
    }

    /******************************************* GENERAL ************************************************/

    function hideAppTabs()
    {
        $('#dashboard, #wikipedia, #newSubstance, #detailedSubstance, #editDetailedSubstance, #editDetailedSubstanceField, .editDetailedSubstanceFieldInput, #social, #settings').hide();
    }

    function footerResetImages(target)
    {
        for(var i = 0; i < $('#footerNavBar').children('img').length; i++)
        {
            if($('#footerNavBar').children('img')[i].name == target)
            {
                $($('#footerNavBar').children('img')[i]).attr('src', './img/icons/' + $('#footerNavBar').children('img')[i].name + "Clicked.png");
            }
            else
            {
                $($('#footerNavBar').children('img')[i]).attr('src', './img/icons/' + $('#footerNavBar').children('img')[i].name + ".png");
            }
        }
    }

    function cancelTimers()
    {
        clearTimeout(updateNewSubstances);
    }

    function clearSubstanceInputs()
    {
        $('#newSubstanceSecond, #newSubstanceThird, #newSubstanceFourth').hide();
        $('#inputDose, #inputDoseTime, #inputDoseDate').val("");
        $('#inputDose, #inputDoseTime, #inputDoseDate').removeClass("valid");
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

function timeDifference(current, previous) 
{

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) 
    {
        if(Math.round(elapsed/1000) != 1)
        {
            return Math.round(elapsed/1000) + ' seconds ago';
        }
        else
        {
            return Math.round(elapsed/1000) + ' second ago';
        }
    }
    else if (elapsed < msPerHour) 
    {
        if(Math.round(elapsed/msPerMinute) != 1)
        {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
        }
        else
        {
            return Math.round(elapsed/msPerMinute) + ' minute ago';
        }
    }
    else if (elapsed < msPerDay ) 
    {
        if(Math.round(elapsed/msPerHour) != 1)
        {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
        }
        else
        {
            return Math.round(elapsed/msPerHour) + ' hour ago';
        }
    }
    else if (elapsed < msPerMonth) 
    {
        if(Math.round(elapsed/msPerDay) != 1)
        {
            return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';  
        }
        else
        {
            return 'approximately ' + Math.round(elapsed/msPerDay) + ' day ago';
        }
    }
    else if (elapsed < msPerYear) 
    {
        if(Math.round(elapsed/msPerMonth) != 1)
        {
            return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';   
        }
        else
        {
            return 'approximately ' + Math.round(elapsed/msPerMonth) + ' month ago';
        }
    }
    else 
    {
        if(Math.round(elapsed/msPerYear) != 1)
        {
            return 'approximately ' + Math.round(elapsed/msPerYear) + ' years ago';   
        }
        else
        {
            return 'approximately ' + Math.round(elapsed/msPerYear) + ' year ago';
        }
    }
}

function lessThanAWeek(current, previous)
{
    var elapsed = current - previous;

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;

    if (elapsed < msPerMonth) 
    {
        if(Math.round(elapsed/msPerDay) <= 7)
        {
            return Math.round(elapsed/msPerDay);
        }   
    }
}