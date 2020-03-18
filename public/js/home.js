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

$('#add').click(function()
{
    console.log("Add new");
})