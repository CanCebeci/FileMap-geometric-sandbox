var cellSize = fm.config.cellSize;

class Item{
    constructor(pos, width, height, importance)
    {
        if (typeof Item.counter === 'undefined')
        Item.counter = 0;

        this.id = Item.counter++; // newly created Item will have different id
        this.width = width * cellSize;
        this.height = height * cellSize;
        this.importance = importance;
        
        this.pos = pos.multiply(cellSize);
    }

    initPanelEvents() {
        var self = this;
    
        this.outer.on('mousedrag', function (event) { 
            console.log('drag event')
            self.moveMe(event.delta)
        })
    
        this.outer.on('mousedown', function (event){
            console.log('mousedown...');
        })
    
        this.outer.on('mouseup', function (event){
            console.log('mouseup...');
        })
    }
    
    moveMe(delta){
        this.outer.position = this.outer.position.add(delta);
        this.outer.bringToFront();
    }
    
    draw() { // width, height, content
    
        var w = this.width,
            h = this.height;
    
        this.outer = new paper.Path.Rectangle(this.pos, new paper.Size(w, h));
        this.outer.style = fm.config.styles.outer;
        this.label = new paper.PointText({
            content: this.importance,
            fontSize: 15,
            fontWeight: 'bold',
            fillColor: "black"
            
        });
        this.label.bounds.center = this.outer.bounds.center;
    
        this.initPanelEvents();
    }

}




