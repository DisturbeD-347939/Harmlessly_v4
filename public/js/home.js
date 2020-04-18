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
        $('#welcomeHome').text("Welcome " + getCookie("name"));
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
        $(".content").empty();

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
                console.log(data);  
                for(var i = 0; i < data.length; i++)
                {
                    var date = new Date(data[i]["id"] * 1000);
                
                    $(".content").append("<div><img class='logoSubstance' src=./img/substances/" + data[i]  ["data"]["substance"] + ".png><p class='titleSubstance'>" + data[i]["data"]["substance"]  + "</p><p class='dateSubstance'>" + date.getDate() + "/" + date.getMonth()+1 + "/" + date.getFullYear() + "</p><div class='infoSubstance waves-effect   waves-blue btn white'>Info</div><div class='warningSubstance waves-effect waves-blue btn  white'>Dangers</div>");
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