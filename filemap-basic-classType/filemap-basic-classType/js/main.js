const width = 60
const height = 60;

let freeChunks; 
let children;
let freeHeap;


// set fm up on window load
jQuery(window).load(function() {
    
    freeChunks = [new RectItem(0, width, 0, height)];
    freeHeap = new BinaryHeap();
    freeHeap.push(freeChunks[0]);

    children = [];
    visualizeSolution(10, 10, width, height, children); // Draw the background.

    let indicator;
    let indicatorPath; 

    var newChildren = [];       // A list of of children to be added. Used by button 4.

    //tool = new paper.Tool();    // To set up the global listeners.

    


    setUpButtons();
    
    //------------------------------------------ helper functions -----------------------------------------

    

    function setUpButtons(){
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
    }
});
