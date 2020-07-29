var cellSize = fm.config.cellSize;

class Panel extends Item{
    constructor(pos, width, height)
    {
        super(pos, width, height);
    }

    moveMe(delta){
    //    this.outer.position = this.outer.position.add(delta.multiply(2));
    //   this.outer.bringToFront();

     super.moveMe(delta.multiply(2))
     this.outer.fillColor = 'blue';
    }
}



