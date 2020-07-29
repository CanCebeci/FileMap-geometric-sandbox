fm.document = function(){
    var center;
    var draggingItem = null;
    var selectedItem = null;
    var targetPanel = null;

    var mouseLocation = null;
    var oldCenter = null;
    
    var items;

    var defaultCenter;

    var setup = function(){
        defaultCenter = paper.view.center.add(new paper.Point(0,0));
        cellSize = 15;
    };

    var clear = function(){
        paper.project.clear();
    };

    return{
        setup: setup,
        clear: clear
    };

}();