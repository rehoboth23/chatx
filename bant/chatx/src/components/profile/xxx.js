$(document).ready(function (){
    let win = $(window)

    let navLinks = $("#navbarSupportedContent")

    win.click(function (){
        navLinks.hasClass("show") ? $(".navbar-collapse").collapse("hide") : 0
    })

    win.on("load", function () {
        console.log("loaded")
    })

})