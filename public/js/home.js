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

    //Set content height and position
    var remainingScreen = ($("body").height() - ($("header").height() + 10 + $("footer").height() + 10));
    var percentageFreeScreen = Math.round(((remainingScreen * 100)/$("body").height())) + "%";
    $(".content").height(percentageFreeScreen);
    $(".content").css("top", $("header").height() + 10);

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

            $.get("/getSubstances", function(data, status)
            {
                if(data != "500")
                {
                    $('#addMood').hide();
                    $('#addUse').show();
                    for(var i = 0; i < data.length; i++)
                    {
                        $('#substances').append("<div class='substances btn blue lighten-1'>" + data[i] + "</div>");

                        if(i+1 >= data.length)
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
                                    });

                                    inputData[1] = $(e.target).text();
                                    selectedSubstanceIndex = $(e.target).index();
                                }
                                else
                                {
                                    inputData.push($(e.target).text());
                                    selectedSubstanceIndex = $(e.target).index();
                                }

                                $(e.target).addClass("white");
                                $(e.target).removeClass("blue lighten-1");
                                $(e.target).css
                                ({
                                    "color": "#42a5f5",
                                    "border": "1px solid #42a5f5"
                                });

                                $('#addDose').removeClass("disabled");
                            })
                        }
                    }
                }
            });
        }
    })

    $('#wikipediaBtn').click(function()
    {
        $('.content').empty();
    })

    //INPUTS

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
                $('.content').append("<div id='add' class='waves-effect waves-blue btn blue lighten-1'>Add a new entry</div>");

                for(var i = data.length-1; i >= 0; i--)
                {
                    //Card setup
                    var card = "<div class='usageCard' id='usage-" + i + "'>";
                    var cardImg = "<div class='usageCardImage'><img src='./img/moods/" + data[i]["data"]["mood"] + ".png'</img></div>";
                    var cardInfo = "<div class='verticalHr'></div><div class='usageCardContent'><p>" + data[i]["data"]["substance"] + " - " + data[i]["data"]["dosage"] + data[i]["data"]["scale"] + "</p><div class='danger'><div class='dangerLevel'></div></div></div>";

                    //Draw card
                    $('.content').append(card + cardImg + cardInfo + "</div>");

                    //Check danger levels
                    var convertScale = convert(data[i]["data"]["scale"], data[i]["data"]["dosage"], substancesInfo[data[i]["data"]["substance"]]["dosages"]["scale"]);
                    
                    var dangerLevel = (convertScale * 100) / substancesInfo[data[i]["data"]["substance"]]["dosages"]["danger_level"];

                    if(dangerLevel > 100)
                    {
                        dangerLevel = 100;
                    }

                    $('.content div:last-child > div:last-child > div > div').css
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