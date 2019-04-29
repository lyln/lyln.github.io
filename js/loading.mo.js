var burst1 = new mojs.Burst({
    left: 0,
    top: 0,
    radius: {
        5: 40
    },
    children: {
        shape: "circle",
        fill: ["red", "cyan", "orange"],
        fillOpacity: .8,
        radiusX: 3.5,
        radiusY: 3.5
    }
});
document.addEventListener("click", function(a) {
    null == a.target.href && "footer" != a.target.className && "copyright" != a.target.className && "author__urls social-icons" != a.target.className && "author__avatar" != a.target.className && "sidebar sidebar-active" != a.target.className && burst1.tune({
        x: a.pageX,
        y: a.pageY
    }).generate().replay()
});
