let freeChunks, freeHeap;

// these functions can be instance methods of Item (replace "r1" with "this")
function collides (r1, r2) {
    let collideInX = !(r1.x2() <= r2.x1() || r2.x2() <= r1.x1());
    let collideInY = !(r1.y2() <= r2.y1() || r2.y2() <= r1.y1());
    return collideInX && collideInY;
}

function RectItem(x1, x2, y1, y2) {
    this.location = {
        x: x1,
        y: y1
    };
    this.size = {
        width: x2 - x1,
        height: y2 - y1
    };
    this.rightNeighbours = [];
    this.downNeighbours = [];
    this.upNeighbours = [];
    this.leftNeighbours = [];
}
RectItem.prototype.x1 = function() {return this.location.x;};
RectItem.prototype.x2 = function() {return this.location.x + this.size.width;};
RectItem.prototype.y1 = function() {return this.location.y;};
RectItem.prototype.y2 = function() {return this.location.y + this.size.height;};
RectItem.prototype.isLegal = function(maxX, maxY) {
    let dimensionsPositive = (this.size.width > 0) && (this.size.height > 0);  // in the equality cases, the chunk is a line or a point (NOT APPLICABLE HERE)
    let withinBounds = (this.x2() <= maxX) && (this.y2() <= maxY);
    return dimensionsPositive && withinBounds;
}

function divideChunks(/*freeChunks,*/ occupant) {
    let collidingChunks = [];
    let okayChunks = [];
    freeChunks.forEach( chunk => {
        if (collides(occupant, chunk)) {
            collidingChunks.push(chunk);
            freeHeap.remove(chunk);
        } else {
            okayChunks.push(chunk);
        }
    })
    freeChunks = okayChunks;

    for (let i in collidingChunks) {
        let dividedChunks = [];
        let chunk = collidingChunks[i];

        /* Neighbours of "chunk" may end up as neighbours of two newly-created subchunks.
         * for each direction, a primary and a secondary subchunk is chosen as potential neighbours of
         * the neighbours of "chunk" in that direction.
         * 
         * Up -> primary: upLeft, secondary: upRight or downLeft (if upRight has height 0)
         * Right -> p: upRight, s: downRight or downLeft 
         * Down -> p: downRight, s: downLeft or upLeft
         * Left -> p: downLeft, s: upLeft or upRight
         */

        let secUp, secDown, secLeft, secRight;
        
        let upLeft = new RectItem(chunk.x1(), occupant.x1(), chunk.y1(), Math.min(occupant.y2(), chunk.y2()));
        let upRight = new RectItem(Math.max(occupant.x1(), chunk.x1()), chunk.x2(), chunk.y1(), occupant.y1());
        let downRight = new RectItem(occupant.x2(), chunk.x2(), Math.max(occupant.y1(), chunk.y1()), chunk.y2());
        let downLeft = new RectItem(chunk.x1(), Math.min(occupant.x2(), chunk.x2()), occupant.y2(), chunk.y2());

        if (upLeft.isLegal(width, height)) {
            dividedChunks[dividedChunks.length] = upLeft;
            upRight.leftNeighbours = [{neigh: upLeft, start: 0, end: upRight.size.height}];
            downLeft.upNeighbours = [{neigh: upLeft, start: 0, end: upLeft.size.width}];

            secLeft = upLeft;
            secDown = upLeft;
        }

        if (upRight.isLegal(width, height)) {
            dividedChunks[dividedChunks.length] = upRight;
            upLeft.rightNeighbours = [{neigh: upRight, start: 0, end: upRight.size.height}];
            downRight.upNeighbours = [{neigh: upRight, start: 0, end: downRight.size.width}];

            if (secLeft === undefined) {
                secLeft = upRight;
            }
            secUp = upRight;
        }
        
        if (downRight.isLegal(width, height)) {
            dividedChunks[dividedChunks.length] = downRight;
            upRight.downNeighbours = [{neigh: downRight, start: downRight.x1() - upRight.x1(), end: upRight.size.width}];
            downLeft.rightNeighbours = [{neigh: downRight, start: 0, end: downLeft.size.height}];

            if (secUp === undefined) {
                secUp = downRight;
            }
            secRight = downRight;
        }
        
        if (downLeft.isLegal(width, height)) {
            dividedChunks[dividedChunks.length] = downLeft;
            upLeft.downNeighbours = [{neigh: downLeft, start: 0, end: upLeft.size.width}];
            downRight.leftNeighbours = [{neigh: downLeft, start: downLeft.y1() - downRight.y1(), end: downRight.size.height}];

            if (secRight === undefined) {
                secRight = downLeft;
            }
            secDown = downLeft; 
        }

        chunk.leftNeighbours.forEach(n => {
            n.neigh.rightNeighbours = n.neigh.rightNeighbours.filter(e => e.neigh !== chunk);
            handleOuterNeighbour(n, downLeft, "left");   // downLeft is the primary left subchunk.
            if (secLeft !== undefined) {
                handleOuterNeighbour(n, secLeft, "left");
            }
        });

        chunk.upNeighbours.forEach(n => {
            n.neigh.downNeighbours = n.neigh.downNeighbours.filter(e => e.neigh !== chunk);
            handleOuterNeighbour(n, upLeft, "up");   // upLeft is the primary up subchunk.
            if (secUp !== undefined) {
                handleOuterNeighbour(n, secUp, "up");
            }
        });

        chunk.rightNeighbours.forEach(n => {
            n.neigh.leftNeighbours = n.neigh.leftNeighbours.filter(e => e.neigh !== chunk);
            handleOuterNeighbour(n, upRight, "right");   // upRight is the primary right subchunk.
            if (secRight !== undefined) {
                handleOuterNeighbour(n, secRight, "right");
            }
        });

        chunk.downNeighbours.forEach(n => {
            n.neigh.upNeighbours = n.neigh.upNeighbours.filter(e => e.neigh !== chunk);
            handleOuterNeighbour(n, downRight, "down");   // downRight is the primary down subchunk.
            if (secDown !== undefined) {
                handleOuterNeighbour(n, secDown, "down");
            }
        });

        dividedChunks.forEach(c => {
            freeChunks.push(c);
            freeHeap.push(c);
        });
    }

}

 // Handle outer neighbour updates
 function handleOuterNeighbour(entry, c, direction) {
    let n = entry.neigh;

    let start_abs, end_abs;     // absoulte single-axis coordinates of the start and end of the adjacency
    let offset_n;
    let offset_c
    if (direction === "up" || direction === "down") {
        start_abs = Math.max(n.x1(), c.x1());
        end_abs = Math.min(n.x2(), c.x2());
        offset_n = n.x1();
        offset_c = c.x1();

    } else if (direction === "left" || direction === "right") {
        start_abs = Math.max(n.y1(), c.y1());
        end_abs = Math.min(n.y2(), c.y2());
        offset_n = n.y1();
        offset_c = c.y1();
    }

    let n_list;
    let c_list;
    if (direction === "up") {
        if (n.x1() === c.x1() && n.x2() === c.x2()) {
            mergeChunks(c, n, "down"); // merge n downwards into c
            return;
        }
        n_list = n.downNeighbours;
        c_list = c.upNeighbours;
    } else if (direction === "down") {
        if (n.x1() === c.x1() && n.x2() === c.x2()) {
            mergeChunks(c, n, "up");
            return;
        }
        n_list = n.upNeighbours;
        c_list = c.downNeighbours;
    } else if (direction === "left") {
        if (n.y1() === c.y1() && n.y2() === c.y2()) {
            mergeChunks(c, n, "right");
            return;
        }
        n_list = n.rightNeighbours;
        c_list = c.leftNeighbours;
    } else if (direction === "right") {
        if (n.y1() === c.y1() && n.y2() === c.y2()) {
            mergeChunks(c, n, "left");
            return;
        }
        n_list = n.leftNeighbours;
        c_list = c.rightNeighbours;
    } 

    if (start_abs < end_abs) {
        n_list.push({neigh: c, start: start_abs - offset_n, end: end_abs - offset_n});
        c_list.push({neigh: n, start: start_abs - offset_c, end: end_abs - offset_c});
    }
}

// direction is from c2 to c1
// merges c2 into c1
// assumes c2 is in "freeChunks"
function mergeChunks(c1, c2, direction) {
    if (direction === "up") {
        c1.downNeighbours = c2.downNeighbours;
        mergeNeighbours(c1.leftNeighbours, c2.leftNeighbours, c1.size.height);
        mergeNeighbours(c1.rightNeighbours, c2.rightNeighbours, c1.size.height);
        c1.size.height += c2.size.height;
    } else if (direction === "down") {
        c1.upNeighbours = c2.upNeighbours;
        c1.leftNeighbours = mergeNeighbours(c2.leftNeighbours, c1.leftNeighbours, c2.size.height);
        c1.rightNeighbours = mergeNeighbours(c2.rightNeighbours, c1.rightNeighbours, c2.size.height);
        c1.location.y = c2.location.y;
        c1.size.height += c2.size.height;
    } else if (direction === "left") {
        c1.rightNeighbours = c2.rightNeighbours;
        mergeNeighbours(c1.upNeighbours, c2.upNeighbours, c1.size.width);
        mergeNeighbours(c1.downNeighbours, c2.downNeighbours, c1.size.width);
        c1.size.width += c2.size.width;
    } else if (direction === "right") {
        c1.leftNeighbours = c2.leftNeighbours;
        c1.upNeighbours = mergeNeighbours(c2.upNeighbours, c1.upNeighbours, c2.size.width);
        c1.downNeighbours = mergeNeighbours(c2.downNeighbours, c1.downNeighbours, c2.size.width);
        c1.location.x = c2.location.x;
        c1.size.width += c2.size.width;
    }

    freeChunks.splice(freeChunks.indexOf(c2),1);    // remove c2 //reducible linear pass 
    freeHeap.remove(c2);

    // assume l1 precedes l2 (l1's end is at l2's beginning)
    function mergeNeighbours(l1, l2, l1EdgeLength) {
        let l1Last = l1.findIndex( n => n.end === l1EdgeLength);    // can be optimized by storing the last at a known index
        let l2First = l1.findIndex( n => n.start === 0);
        if (l1Last > 0 && l2First > 0 && l1[l1Last].neigh === l2[l2First].neigh) {
            l1[l1Last].end = l1EdgeLength + l2[l2First].end;
            l2.splice(l2First, 1);   // delete the entry
        }
        l2.forEach(n => {
            n.start += l1EdgeLength;
            n.end += l1EdgeLength;
            l1.push(n);
        })

        return l1;
    }
}

function computeFreeHeap() {
    freeChunks = [new RectItem(0, width, 0, height)];
    freeHeap = new BinaryHeap();
    freeHeap.push(freeChunks[0]);

    children.forEach(child => {
        divideChunks(child);
    });
    console.log(freeHeap);
    return freeHeap;
}