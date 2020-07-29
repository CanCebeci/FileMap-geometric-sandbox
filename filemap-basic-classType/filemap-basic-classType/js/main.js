const width = 60
const height = 60;

let freeChunks; 
let children;
let freeHeap;


// set fm up on window load
jQuery(window).load(function() {
        /* 

    let rand = generateRandomInput();
    assignInitialSizes(rand.w, rand.h, rand.c);
    placeChildren(rand.w, rand.h, rand.c);
    visualizeSolution(10, 10, rand.w, rand.h, rand.c);
        */
    freeChunks = [new RectItem(0, width, 0, height)];
    freeHeap = new BinaryHeap();
    freeHeap.push(freeChunks[0]);

    children = [];
    //visualizeSolution(10, 10, width, height, freeChunks);

    let indicator;
    let indicatorPath;

    var newChildren = [];


    var canvas = paper.Path.Rectangle(10 * cellSize, 10 * cellSize, width * cellSize, height * cellSize);
    canvas.fillColor = "grey";
    canvas.opacity = 0.3;
    canvas.strokeColor = "black";
    canvas.strokeWidth = 2;
    canvas.onMouseDown = function(event) {
        indicator = new paper.Rectangle(new paper.Point(Math.floor(event.point.x / cellSize) * cellSize , Math.floor(event.point.y / cellSize) * cellSize), new paper.Size(cellSize,cellSize));
        indicatorPath = new paper.Path.Rectangle(indicator);
        indicatorPath.strokeColor = "green";
        indicatorPath.strokeWidth = 6;
    }
    canvas.onMouseDrag = function(event) {
        let rm = false;
        if (2 * indicator.width <= (event.point.x - indicator.left)) {
            indicator.width *= 2; 
            rm = true;
        }
        if (2 * indicator.height <= (event.point.y - indicator.top)) {
            indicator.height *= 2;
            rm = true;
        }
        if (rm) {
            indicatorPath.remove();
            indicatorPath = new paper.Path.Rectangle(indicator);
            indicatorPath.strokeColor = "green";
            indicatorPath.strokeWidth = 6;
        }
        
    }

    canvas.onMouseUp = function(event) {
        let newChild = new RectItem(
            Math.floor((indicator.left) / cellSize) - 10,
            Math.floor((indicator.right) / cellSize) - 10 ,
            Math.floor((indicator.top) / cellSize) - 10 ,
            Math.floor((indicator.bottom) / cellSize ) - 10);

        children[children.length] = newChild;

        divideChunks(newChild, width, height);
        console.log("#chunks: " + freeChunks.length);
        visualizeSolution(10, 10, width, height, children);
        canvas.bringToFront();
    }


    var button1 = paper.Path.Rectangle(100 * cellSize, 50 * cellSize, 10 * cellSize, 10 * cellSize);
    button1.fillColor = "grey";
    button1.opacity = 0.3;
    button1.strokeColor = "black";
    button1.strokeWidth = 2;
    var label1 = new paper.PointText({
        content: 0,
        fontSize: 15,
        fontWeight: 'bold',
        fillColor: "black"
        
    });
    label1.bounds= button1.bounds;
    label1.position.y -= 200;

    button1.onMouseDown = function(event) {
        label1.content++;
        newChildren[newChildren.length] = {};
    }

    var button2 = paper.Path.Rectangle(120 * cellSize, 50 * cellSize, 20 * cellSize, 10 * cellSize);
    button2.fillColor = "grey";
    button2.opacity = 0.3;
    button2.strokeColor = "black";
    button2.strokeWidth = 2;
    var label2 = new paper.PointText({
        content: 0,
        fontSize: 15,
        fontWeight: 'bold',
        fillColor: "black"
        
    });
    label2.bounds= button2.bounds;
    label2.bounds.width /= 2;
    label2.position.y -= 200;

    button2.onMouseDown = function(event) {
        label2.content++;
        newChildren[newChildren.length] = {widthOverHeight: 2};

    }

    var button3 = paper.Path.Rectangle(150 * cellSize, 50 * cellSize, 10 * cellSize, 20 * cellSize);
    button3.fillColor = "grey";
    button3.opacity = 0.3;
    button3.strokeColor = "black";
    button3.strokeWidth = 2;

    var label3 = new paper.PointText({
        content: 0,
        fontSize: 15,
        fontWeight: 'bold',
        fillColor: "black"
        
    });
    label3.bounds= button3.bounds;
    label3.bounds.height /= 2;
    label3.position.y -= 200;

    button3.onMouseDown = function(event) {
        label3.content++;
        newChildren[newChildren.length] = {widthOverHeight: 0.5};

    }

    var button4 = paper.Path.Rectangle(170 * cellSize, 50 * cellSize, 10 * cellSize, 10 * cellSize);
    button4.fillColor = "red";
    button4.opacity = 0.3;
    button4.strokeColor = "black";
    button4.strokeWidth = 2;

    button4.onMouseDown = function(event) {
        placeNewChildren_largestChunk(newChildren);
        visualizeSolution(10, 10, width, height, children);
        newChildren = [];
        label1.content = label2.content = label3.content = 0;
        canvas.bringToFront();

    }
    
    //divideChunks(new RectItem(15, 25, 25, 35), width, height);
    //divideChunks(new RectItem(20, 30, 40, 45), width, height);
    //visualizeSolution(10, 10, width, height, freeChunks);

});