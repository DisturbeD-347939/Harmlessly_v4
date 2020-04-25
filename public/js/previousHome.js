//General
var substancesInfo;

$(document).ready(function()
{
    /*********************************************VARIABLES********************************************/
    //Adding substances
    var add = false;
    var inputData = [];
    var selectedSubstanceIndex;

    /***********************************************SETUP**********************************************/
    //Show elements
    $('select').show();

    //Hide elements
    $('#addUse').hide();
    $('#addMood').hide();
    $('#wikipedia').hide();
    $('#wikiCollapsible').hide();

    //Set content height and position
    var remainingScreen = ($("body").height() - ($("header").height() + 10 + $("footer").height() + 10));
    var percentageFreeScreen = Math.round(((remainingScreen * 100)/$("body").height())) + "%";
    $(".content, #wikipedia").height(percentageFreeScreen);
    $(".content, #wikipedia").css("top", $("header").height() + 10);

    //Setup add tab bottom
    $('#addUse').css("bottom", $("footer").height() + 15 + "px");
    $('#addMood').css("bottom", $("footer").height() + 15 + "px");

    //Substance dosage
    $('#doseVal').text($('#dosage').val());

    //Check if user is logged in
    if(getCookie("email") == "")
    {
        window.location.href = "/";
    }
    else
    {
        $(".content").css("justify-content", "center");
    }

    $('.collapsible').collapsible();

    //Update substances
    updateSubstances();

    /************************************************ EVENTS ***********************************************/
    
    $('#add').click(function()
    {
        if(!add)
        {
            $('#addMood').show();
            $('header, .content').css("filter","blur(3px)");
            add = true;
        }
        else
        {
            add = false;
            inputData = [];
            $('#addMood, #addUse').hide();
            $('header, .content').css("filter","none");
        }
    })

    $('.content, header').click(function()
    {
        if(add)
        {
            add = false;
            inputData = [];
            $('#addMood, #addUse').hide();
            $('header, .content').css("filter","none");
        }
    })

    $('#good, #neutral, #bad').click(function(e)
    {
        if(inputData.length < 1)
        {
            $('#substances').empty();
            inputData.push(e.target.id);

            $('#addMood').hide();
            $('#addUse').show();
            for(var i = 0; i < Object.keys(substancesInfo).length; i++)
            {
                $('#substances').append("<div class='substances btn blue lighten-1'>" + Object.keys(substancesInfo)[i] + "</div>")

                if(i+1 >= Object.keys(substancesInfo).length)
                {
                    $('.substances').click(function(e)
                    {
                        if(inputData.length >= 2)
                        {
                            $($('#substances').children('div')[selectedSubstanceIndex]).addClass("blue lighten-1");
                            $($('#substances').children('div')[selectedSubstanceIndex]).removeClass("white");
                            $($('#substances').children('div')[selectedSubstanceIndex]).css
                            ({
                                "color": "white",
                                "border": "0px"
                            })
                            inputData[1] = $(e.target).text();
                            selectedSubstanceIndex = $(e.target).index();
                        }
                        else
                        {
                            inputData.push($(e.target).text());
                            selectedSubstanceIndex = $(e.target).index();
                        
                        $(e.target).addClass("white");
                        $(e.target).removeClass("blue lighten-1");
                        $(e.target).css
                        ({
                            "color": "#42a5f5",
                            "border": "1px solid #42a5f5"
                        })
                        $('#addDose').removeClass("disabled");
                    
                        }
                    })
                }
            }
        }
    })

    $('#unknownDose').click(function()
    {
        if($(this).is(":checked"))
        {
            $('#dosage, #selectScale').prop("disabled", true);
        }
        else
        {
            $('#dosage, #selectScale').prop("disabled", false);
        }
    })

    $('#wikipediaBtn').click(function()
    {
        $('.content').hide();
        $('#wikiWelcome').empty();
        $('#wikiCollapsible').hide();
        $('#addMood, #addUse').hide();
        $('header, .content').css("filter","none");

        $('#wikiWelcome').append("<h2>Wikipedia</h2>");
        for(var i = 0; i < Object.keys(substancesInfo).length; i++)
        {
            $('#wikiWelcome').append("<div class='wikiSubstances waves-effect waves-blue btn blue lighten-1'>" + Object.keys(substancesInfo)[i] + "</div>");
        }
        $('#wikiWelcome').append("<p>More coming...</p>");
        $('#wikipedia').show();

        $('.wikiSubstances').click(function(e)
        {
            $('#wikiWelcome').empty();
            $('#wikiCollapsible').show();

            var wikiSubstanceData = substancesInfo[$(e.target).text()];

            //Add data
            $('#wikiCollapsible > h2').text($(e.target).text());
            $('#wikiCollapsible > h6').text(wikiSubstanceData["name"]);

            //Add nicknames
            var nicknames = "";
            for(var i = 0; i < wikiSubstanceData["nicknames"].length; i++)
            {
                if(i+1 >= wikiSubstanceData["nicknames"].length)
                {
                    nicknames += wikiSubstanceData["nicknames"][i] + ".";
                    $('#wikiCollapsible > ul > li:nth-child(1) > div:last-child').append("<span>Some of the most common street names for " + $(e.target).text() + " are " + nicknames + "</span>");
                }
                else if(i+2 >= wikiSubstanceData["nicknames"].length)
                {
                    nicknames += wikiSubstanceData["nicknames"][i] + " and ";
                }
                else
                {
                    nicknames += wikiSubstanceData["nicknames"][i] + ", ";
                }
            }

            //Add dosing methods
            var dosing = "";
            for(var i = 0; i < wikiSubstanceData["dosing_methods"].length; i++)
            {
                if(i+1 >= wikiSubstanceData["dosing_methods"].length)
                {
                    dosing += wikiSubstanceData["dosing_methods"][i] + ".";
                    $('#wikiCollapsible > ul > li:nth-child(2) > div:last-child').append("<span>" + $(e.target).text() + " can be consumed " + dosing + "</span>");
                }
                else if(i+2 >= wikiSubstanceData["dosing_methods"].length)
                {
                    dosing += wikiSubstanceData["dosing_methods"][i] + " or ";
                }
                else
                {
                    dosing += wikiSubstanceData["dosing_methods"][i] + ", ";
                }
            }

            //Add dosages
            var dosages = [];
            var dosageScale = "";
            for(var i = 0; i < Object.keys(wikiSubstanceData["dosages"]).length; i++)
            {
                if(i == 0)
                {
                    dosageScale = wikiSubstanceData["dosages"][Object.keys(wikiSubstanceData["dosages"])[i]];
                }
                else if(i != Object.keys(wikiSubstanceData["dosages"]).length - 1)
                {
                    dosages.push(Object.keys(wikiSubstanceData["dosages"])[i] + ": " + wikiSubstanceData["dosages"][Object.keys(wikiSubstanceData["dosages"])[i]] + dosageScale);
                    dosages[dosages.length-1] = dosages[dosages.length-1].charAt(0).toUpperCase() + dosages[dosages.length-1].slice(1);
                }
                else
                {
                    $('#wikiCollapsible > ul > li:nth-child(3) > div:last-child').append("<span><p>Usually this substance is measured in mg (milligrams). Below you can see some of the doses and their strength.</p><ul></ul></span>");
                    for(var j = 0; j < dosages.length; j++)
                    {
                        $('#wikiCollapsible > ul > li:nth-child(3) > div:last-child > span > ul').append("<li>● " + dosages[j] + "</li>");
                    }
                }
            }

            //Add sold as
            var sold_as = "";
            for(var i = 0; i < wikiSubstanceData["sold_as"].length; i++)
            {
                if(i+1 >= wikiSubstanceData["sold_as"].length)
                {
                    sold_as += wikiSubstanceData["sold_as"][i] + ".";
                    $('#wikiCollapsible > ul > li:nth-child(4) > div:last-child').append("<span>" + $(e.target).text() + " is sold as " + sold_as + "</span>");
                }
                else if(i+2 >= wikiSubstanceData["sold_as"].length)
                {
                    sold_as += wikiSubstanceData["sold_as"][i] + " or ";
                }
                else
                {
                    sold_as += wikiSubstanceData["sold_as"][i] + ", ";
                }
            }

            //Add effects
            var effects = [];
            $('#wikiCollapsible > ul > li:nth-child(5) > div:last-child').append("<span><p class='bold'>Positive Effects:</p><ul id='positiveEffects'></ul><p class='bold'>Negative Effects:</p><ul id='negativeEffects'></ul><p class='bold'>Physical Effects:</p><ul id='physicalEffects'></ul></span>");
            for(var i = 0; i < Object.keys(wikiSubstanceData["effects"]).length; i++)
            {
                for(var j = 0; j < wikiSubstanceData["effects"][Object.keys(wikiSubstanceData["effects"])[i]].length; j++)
                {
                    switch(i)
                    {
                        case 0:
                            $('#wikiCollapsible > ul > li:nth-child(5) > div:last-child > span > #positiveEffects').append("<li>● " + wikiSubstanceData["effects"][Object.keys(wikiSubstanceData["effects"])[i]][j] + "</li>");
                            break;
                        case 1:
                            $('#wikiCollapsible > ul > li:nth-child(5) > div:last-child > span > #negativeEffects').append("<li>● " + wikiSubstanceData["effects"][Object.keys(wikiSubstanceData["effects"])[i]][j] + "</li>");
                            break;
                        case 2:
                            $('#wikiCollapsible > ul > li:nth-child(5) > div:last-child > span > #physicalEffects').append("<li>● " + wikiSubstanceData["effects"][Object.keys(wikiSubstanceData["effects"])[i]][j] + "</li>");
                            break;
                    }
                    
                }
            }

            //Add durations
            var durations = [];
            for(var i = 0; i < Object.keys(wikiSubstanceData["duration"]).length; i++)
            {
                //console.log(wikiSubstanceData["duration"][Object.keys(wikiSubstanceData["duration"])[i]]);
                if(i+1 >= Object.keys(wikiSubstanceData["duration"]).length)
                {
                    console.log("finished");
                }
                else if(i+2 >= Object.keys(wikiSubstanceData["duration"]).length)
                {
                    console.log("comedown");
                }
                else
                {
                    $('#wikiCollapsible > ul > li:nth-child(6) > div:last-child').append("<p class='bold'>" + Object.keys(wikiSubstanceData["duration"])[i].charAt(0).toUpperCase() + Object.keys(wikiSubstanceData["duration"])[i].slice(1) + "</p><ul></ul>")
                    for(var j = 0; j < Object.keys(wikiSubstanceData["duration"][Object.keys(wikiSubstanceData["duration"])[i]]).length; j++)
                    {
                        console.log(Object.keys(wikiSubstanceData["duration"][Object.keys(wikiSubstanceData["duration"])[i]])[j]);
                        console.log(wikiSubstanceData["duration"][Object.keys(wikiSubstanceData["duration"])[i]][Object.keys(wikiSubstanceData["duration"][Object.keys(wikiSubstanceData["duration"])[i]])[j]]);
                    }
                    //console.log(wikiSubstanceData["duration"][Object.keys(wikiSubstanceData["duration"])[i]]);
                }
            }
        })
    })

    //INPUTS

    $('#dosage').on('input', function()
    {
        $('#doseVal').text($(this).val());
    })

    $('#selectScale').change(function()
    {
        if(this.value == "μg")
        {
            $('#dosage').attr
            ({
                "min": "5",
                "max": "995",
                "step": "5",
                "value": "5"
            })
            $('#dosage').val(5);
        }

        else if(this.value == "mg")
        {
            $('#dosage').attr
            ({
                "min": "5",
                "max": "995",
                "step": "5",
                "value": "1"
            })
            $('#dosage').val(1);
        }

        else if(this.value == "g")
        {
            $('#dosage').attr
            ({
                "min": "1",
                "max": "20",
                "step": "1",
                "value": "1"
            })
            $('#dosage').val(1);
        }
        $('#doseVal').text($('#dosage').val());
    })

    /*********************************************** SUBMISSIONS **********************************************/

    $('#addDose').click(function()
    {
        if($('#unknownDose').is(":checked"))
        {
            inputData.push("Unknown");
        }
        else
        {
            inputData.push($('#dosage').val());
            inputData.push($('#selectScale option:selected').text());
        }

        console.log(inputData);

        $.post("/addDose",
        {
            data: inputData,
            timestamp: Math.round((new Date()).getTime() / 1000),
            email: getCookie("email")
        }, 
        function(data, status)
        {
            if(data == "200")
            {
                updateSubstances();
            }
        })

        $('#add').click();
    })
})

function updateSubstances()
{
    if(getCookie("email") != "")
    {
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
                $(".content").empty();
                $(".content").css("justify-content", "flex-start");
                $('.content').append("<div id='add' class='usageCards waves-effect waves-blue btn blue lighten-1'>Add a new entry</div>");

                for(var i = data.length-1; i >= 0; i--)
                {
                    //Card setup
                    var card = "<div class='usageCard' id='usage-" + i + "'>";
                    var cardImg = "<div class='usageCardImage'><img src='./img/moods/" + data[i]["data"]["mood"] + ".png'</img></div>";
                    var cardInfo = "<div class='verticalHr'></div><div class='usageCardContent'><p>" + data[i]["data"]["substance"] + " - " + data[i]["data"]["dosage"] + data[i]["data"]["scale"] + "</p><div class='danger'><div class='dangerLevel'></div></div></div>";

                    if(data[i]["data"]["scale"] == "μg or mcg")
                    {
                        data[i]["data"]["scale"] = "μg";
                    }

                    //console.log(data[i]["data"]["scale"] + " - " + data[i]["data"]["dosage"] + " - " + substancesInfo[data[i]["data"]["substance"]]["dosages"]["scale"]);

                    //Check danger levels
                    var convertScale = convert(data[i]["data"]["scale"], data[i]["data"]["dosage"], substancesInfo[data[i]["data"]["substance"]]["dosages"]["scale"]);

                    var dangerLevel = (convertScale * 100) / substancesInfo[data[i]["data"]["substance"]]["dosages"]["danger_level"];

                    if(dangerLevel > 100)
                    {
                        dangerLevel = 100;
                    }

                    var dangerBarColour;
                    var dangerBarStatus = Math.floor(dangerLevel / 33);

                    console.log(dangerLevel + " -> " + dangerLevel/33 + " -> " + dangerBarStatus);

                    switch(dangerBarStatus)
                    {
                        case 0:
                            {
                                dangerBarColour = "green";
                                break;
                            }
                        case 1:
                            {
                                dangerBarColour = "yellow";
                                break;
                            }
                        case 2:
                            {
                                dangerBarColour = "red";
                                break;
                            }
                        case 3:
                            {
                                dangerBarColour = "red";
                                break;
                            }
                        default:
                            {
                                dangerBarColour = "green";
                            }
                    }

                    var dangerBar = "<div class='sideDangerBar'></div>"

                    //Draw card
                    $('.content').append("<div class='usageCards'>" + dangerBar + card + cardImg + cardInfo + "</div></div>");

                    $('.content div:last-child > .sideDangerBar').css("background-color", dangerBarColour);

                    $('.content div:last-child > div:last-child > div:last-child > div > div').css
                    ({
                        "width": 100 - dangerLevel + "%",
                        "left": dangerLevel + "%"
                    })
                }
            }
        })
    }
}

//Get drugs info
$.get('/info', function(data, status)
{
    substancesInfo = data["Substances"];
    console.log(substancesInfo);
})

//Conversions
function convert(original, value, final)
{
    if(original == final)
    {
        return value;
    }
    else
    {
        if(original == "μg" && final == "g")
        {
            return value / 1000000;
        }
        else if(original == "μg" && final == "mg")
        {
            return value / 1000;
        }
        else if(original == "g" && final == "mg")
        {
            return value * 1000;
        }
        else if(original == "g" && final == "μg")
        {
            return value * 1000000;
        }
        else if(original == "mg" && final == "g")
        {
            return value / 1000;
        }
        else if(original = "mg" && final == "μg")
        {
            return value * 1000;
        }
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