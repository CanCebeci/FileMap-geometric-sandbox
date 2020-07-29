function placeChildren_alt2(width, height, children) {
    // approach 2: find the largest possible legal square
        // and make all children share that size.
        // also find the largest square padding size and pad the children.
    if (width * height < children.length) {
        console.error("Too many children.. Can't be placed");
        return;
    }

    var childSize = 1;
    while (Math.floor(width / (2 * childSize)) * Math.floor(height / (2 * childSize)) >= children.length) {
        childSize *= 2;
    }

    var paddedSize = childSize;
    while (Math.floor(width / (1 + paddedSize)) * Math.floor(height / (1 + paddedSize)) >= children.length) {
        paddedSize += 1;
    }

    var childrenPerRow = Math.floor(width / paddedSize);
    var padOffset = Math.floor((paddedSize - childSize) / 2);

    console.log(" --- placeChildren1WithPadding --- ");
    console.log("\twidth: " + width);
    console.log("\theight: " + height);
    console.log("\tchildSize: " + childSize);
    console.log("\tpaddedSize: " + paddedSize);
    console.log("\tpadOffset: " + padOffset);

    for (var i = 0; i < children.length; i++) {
        children[i].topLeft = new paper.Point(i % childrenPerRow, Math.floor(i / childrenPerRow)).multiply(paddedSize).add(padOffset);
        children[i].size = new paper.Size(childSize, childSize);
    }
}

function placeChildren_alt3(width, height, children) {
    // approach 3: find the largest possible legal square
        // and make all children share that size.
        // also find the largest square padding size and pad the children.
        // limit the padded size to 1.5 the child size.
    if (width * height < children.length) {
        console.error("Too many children.. Can't be placed");
        return;
    }

    var childSize = 1;
    while (Math.floor(width / (2 * childSize)) * Math.floor(height / (2 * childSize)) >= children.length) {
        childSize *= 2;
    }

    var paddedSize = childSize;
    while (Math.floor(width / (1 + paddedSize)) * Math.floor(height / (1 + paddedSize)) >= children.length
        && paddedSize <= 1.5 * childSize ) {
        paddedSize += 1;
    }

    var childrenPerRow = Math.floor(width / paddedSize);
    var padOffset = Math.floor((paddedSize - childSize) / 2);

    console.log(" --- placeChildren1WithPadding --- ");
    console.log("\twidth: " + width);
    console.log("\theight: " + height);
    console.log("\tchildSize: " + childSize);
    console.log("\tpaddedSize: " + paddedSize);
    console.log("\tpadOffset: " + padOffset);

    for (var i = 0; i < children.length; i++) {
        children[i].topLeft = new paper.Point(i % childrenPerRow, Math.floor(i / childrenPerRow)).multiply(paddedSize).add(padOffset);
        children[i].size = new paper.Size(childSize, childSize);
    }
}

function placeChildren_variousSquares_linear_alt(width, height, children){
    // TODO:
    //  * check if fit possible. if so, no need to ever check the height again, fit is optimal



    // sort children by size
    const sortedChildren = children.sort(function(a,b){
        if (a.size < b.size) {
            return 1;
        } else {
            return -1;
        }
    });

    let nextLocStack = [{point: new paper.Point(0,0), limit: Infinity}];
    for (let i = 0; i < sortedChildren.length; i++) {
        let nextLoc;

        // pop until placement is valid
        
        do {
            nextLoc = nextLocStack[nextLocStack.length - 1];
            nextLocStack.length--;
        } while (nextLoc.point.x + sortedChildren[i].size > width);
        

        if (sortedChildren[i].size < nextLoc.limit) {
            // push bottom left
            nextLocStack[nextLocStack.length] = {
                point: nextLoc.point.add(new paper.Point(0, sortedChildren[i].size)),
                limit: nextLoc.limit - sortedChildren[i].size
            };
        }
        // push top right
        nextLocStack[nextLocStack.length] = {
            point: nextLoc.point.add(new paper.Point(sortedChildren[i].size, 0)),
            limit: sortedChildren[i].size
        };

        sortedChildren[i].topLeft = nextLoc.point;
        sortedChildren[i].size = new paper.Size(sortedChildren[i].size, sortedChildren[i].size);
        console.log(sortedChildren[i]);
    } 
}

function placeChildren_variousSquares_linear(width, height, children) {
    // TODO:
    //  * check if fit possible. if so, no need to ever check the height again, fit is optimal

    // approximate check right now:

    // sort children by size
    const sortedChildren = children.sort(function(a,b){
        if (a.size < b.size) {
            return 1;
        } else {
            return -1;
        }
    });
    let savedEdge =  {point: new paper.Point(-1,-1), limit: 0, space: -1};
    let nextLocStack = [{point: new paper.Point(0,0), limit: Infinity}];
    for (let i = 0; i < sortedChildren.length; i++) {
        let nextLoc;
        
        // check if child can fit into saved edge
        if (savedEdge.space >= sortedChildren[i].size) {
            // push saved edge into stack
            nextLocStack[nextLocStack.length] = savedEdge;
            // reset savedEdge
            savedEdge = {point: new paper.Point(-1,-1), limit: 0, space: -1};
        }

        // Do we ever need to pop more than twice?
        nextLoc = nextLocStack[nextLocStack.length - 1];
        nextLocStack.length--;
        if (nextLoc.point.x + sortedChildren[i].size > width) {
            // update saved edge
            if (savedEdge.space <= 0) {    // no saved edge
                savedEdge = nextLoc;
                savedEdge.space = width - savedEdge.point.x;
            } else {
                savedEdge.limit += nextLoc.limit;
            }

            // pop again
            nextLoc = nextLocStack[nextLocStack.length - 1];
            nextLocStack.length--;
        }

        if (nextLoc.point.y + sortedChildren[i].size > height) {
            console.log("CHILDREN DON'T FIT....");
            return false;
        }

        if (sortedChildren[i].size < nextLoc.limit) {
            // push bottom left
            nextLocStack[nextLocStack.length] = {
                point: nextLoc.point.add(new paper.Point(0, sortedChildren[i].size)),
                limit: nextLoc.limit - sortedChildren[i].size
            };
        }
        // push top right
        nextLocStack[nextLocStack.length] = {
            point: nextLoc.point.add(new paper.Point(sortedChildren[i].size, 0)),
            limit: sortedChildren[i].size
        };

        sortedChildren[i].topLeft = nextLoc.point;
        sortedChildren[i].size = new paper.Size(sortedChildren[i].size, sortedChildren[i].size);
    }
    return true;
}

function placeChildren_variousSquares_BBOX_flexible(width, height, children) {
    // sort children by importance
    const sortedChildren = children.sort(function(a,b){
        if (a.importance < b.importance) {
            return 1;
        } else {
            return -1;
        }
    });
    let nextLocStack = [];
    let boundW = 0; // width of the bounding box
    let boundH = 0; // height of the bounding box

    for (let i = 0; i < sortedChildren.length; i++) {
        if (nextLocStack.length === 0) {
            // the stack is empty, the bounding box is full
            if (boundW + sortedChildren[i].size <= width) { // extend box towards right if possible
                if (sortedChildren[i].size < boundH) {
                    // push bottom left
                    nextLocStack[nextLocStack.length] = {
                        point: new paper.Point(boundW, sortedChildren[i].size),
                        limit: boundH - sortedChildren[i].size
                    };
                } else {
                    boundH = sortedChildren[i].size;
                }
                
                // place child
                sortedChildren[i].topLeft = new paper.Point(boundW, 0);
                boundW += sortedChildren[i].size;
                sortedChildren[i].size = new paper.Size(sortedChildren[i].size, sortedChildren[i].size);

            } else if (boundH + sortedChildren[i].size <= height) {    // extend box towards the bottom
                if (sortedChildren[i].size < boundW) {
                    // push top right
                    nextLocStack[nextLocStack.length] = {
                        point: new paper.Point(sortedChildren[i].size, boundH),
                        limit: sortedChildren[i].size
                    };
                } else {
                    boundW = sortedChildren[i].size;
                }

                // place child
                sortedChildren[i].topLeft = new paper.Point(0, boundH);
                boundH += sortedChildren[i].size;
                sortedChildren[i].size = new paper.Size(sortedChildren[i].size, sortedChildren[i].size);
            } else {
                // child will not fit. reduce its size as well as the sizes of the subsequent same-sized children.
                const targetSize = sortedChildren[i].size;
                if (targetSize === 1) {
                    console.log("ERROR IN LAYING OUT CHILDREN.. Total is too large"); 
                    return false;
                }
                let j = i; 
                while (j < sortedChildren.length && sortedChildren[j].size >= targetSize) {
                    sortedChildren[j].size = targetSize / 2;
                    //console.log(sortedChildren[j].importance +  " resized to " + (targetSize / 2));
                    j++;
                }
                // rollback
                i--;
                continue;
            }
        } else {
            // first pop is always valid
            let nextLoc = nextLocStack[nextLocStack.length - 1];
            nextLocStack.length--;

            if (sortedChildren[i].size < nextLoc.limit) {
                // push bottom left
                nextLocStack[nextLocStack.length] = {
                    point: nextLoc.point.add(new paper.Point(0, sortedChildren[i].size)),
                    limit: nextLoc.limit - sortedChildren[i].size
                };
            }

            if (sortedChildren[i].size + nextLoc.point.x < boundW) {
                // push top right
                nextLocStack[nextLocStack.length] = {
                    point: nextLoc.point.add(new paper.Point(sortedChildren[i].size, 0)),
                    limit: sortedChildren[i].size
                };
            }
            
            sortedChildren[i].topLeft = nextLoc.point;
            sortedChildren[i].size = new paper.Size(sortedChildren[i].size, sortedChildren[i].size);
        }
    }
    return true;
}

function placeChildren_variousSquares_linear_flexible(width, height, children) {
    // sort children by importance
    const sortedChildren = children.sort(function(a,b){
        if (a.importance < b.importance) {
            return 1;
        } else {
            return -1;
        }
    });
    let savedEdge =  {point: new paper.Point(-1,-1), limit: 0, space: -1};
    let nextLocStack = [{point: new paper.Point(0,0), limit: Infinity}];
    for (let i = 0; i < sortedChildren.length; i++) {
        //console.log("-------   i: " + i);
        let nextLoc;
        //let initialStackSize = nextLocStack.length; // used in case of rollback
        
        // check if child can fit into saved edge
        if (savedEdge.space >= sortedChildren[i].size) {
            // push saved edge into stack
            nextLocStack[nextLocStack.length] = savedEdge;
            // reset savedEdge
            savedEdge = {point: new paper.Point(-1,-1), limit: 0, space: -1};
        }

        //console.log(nextLocStack);
        // Do we ever need to pop more than twice?
        nextLoc = nextLocStack[nextLocStack.length - 1];
        nextLocStack.length--;
        if (nextLoc.point.x + sortedChildren[i].size > width) {
            if (nextLocStack[nextLocStack.length - 1].point.y + sortedChildren[i].size > height) {
                // child will not fit. reduce its size as well as the sizes of the subsequent same-sized children.
                const targetSize = sortedChildren[i].size;
                if (targetSize === 1) {
                    console.log("OVERFLOW ERROR WITH 1'S"); 
                    return false;
                }
                let j = i; 
                while (j < sortedChildren.length && sortedChildren[j].size >= targetSize) {
                    sortedChildren[j].size = targetSize / 2;
                    //console.log(sortedChildren[j].importance +  " resized to " + (targetSize / 2));
                    j++;
                }
                
                // rollback
                i--;
                nextLocStack[nextLocStack.length] = nextLoc;

                continue;
            }
            // update saved edge
            if (savedEdge.space <= 0) {    // no saved edge
                savedEdge = nextLoc;
                savedEdge.space = width - savedEdge.point.x;
            } else {
                savedEdge.limit += nextLoc.limit;
            }

            // pop again
            nextLoc = nextLocStack[nextLocStack.length - 1];
            nextLocStack.length--;
        }

        if (sortedChildren[i].size < nextLoc.limit) {
            // push bottom left
            nextLocStack[nextLocStack.length] = {
                point: nextLoc.point.add(new paper.Point(0, sortedChildren[i].size)),
                limit: nextLoc.limit - sortedChildren[i].size
            };
        }
        // push top right
        nextLocStack[nextLocStack.length] = {
            point: nextLoc.point.add(new paper.Point(sortedChildren[i].size, 0)),
            limit: sortedChildren[i].size
        };

        sortedChildren[i].topLeft = nextLoc.point;
        sortedChildren[i].size = new paper.Size(sortedChildren[i].size, sortedChildren[i].size);
    }
    return true;
}

// attrbibutes children with a size and a position
function placeChildren_fixedSquares(width, height, children) {
    // approach 1: find the largest possible legal square
        // and make all children share that size.
    if (width * height < children.length) {
        console.error("Too many children.. Can't be placed");
        return;
    }

    var childSize = 1;
    while (Math.floor(width / (2 * childSize)) * Math.floor(height / (2 * childSize)) >= children.length) {
        childSize *= 2;
    }

    var childrenPerRow = Math.floor(width / childSize);
    for (var i = 0; i < children.length; i++) {
        children[i].topLeft = new paper.Point(i % childrenPerRow, Math.floor(i / childrenPerRow)).multiply(childSize);
        children[i].size = new paper.Size(childSize, childSize);
    }
}


function layoutUsingImportance_squares(width, height, children){
    let totalArea = 0;
    for (let i = 0; i < children.length; i++) {
        children[i].size = 2 ** Math.ceil(Math.log(children[i].importance) / Math.LN2);   // round up importance to a power of 2.
        totalArea += children[i].size ** 2;
    }

    const coeff =  Math.sqrt(4 ** Math.floor(Math.log((width * height) / totalArea ) / (2 * Math.LN2)));   // round down the coefficient to a power of 2.
    
    for (let i = 0; i < children.length; i++) {
        children[i].size =  Math.ceil(children[i].size * coeff); // ceil if < 1
    }

    let totalOkay = false;
    let tooManyChildren = false;
    while (!totalOkay && !tooManyChildren) {
        // check if ceiling has caused an impossible fit
        totalArea = 0;
        for (let i = 0; i < children.length; i++) {
            totalArea += children[i].size ** 2;
        }
        if (totalArea <= width * height) {
            totalOkay = true;
        } else {
            // shrink all children
            tooManyChildren = true; // there are too many children if they all have size 1 
            for (let i = 0; i < children.length; i++) {
                if (children[i].size > 1) {
                    tooManyChildren = false;
                }
                children[i].size =  Math.ceil(children[i].size / 2); // ceil if < 1
            }
        }
    }
    
    if (!totalOkay) {
        console.log("TOO MANY CHILDREN");
        return false;
    }
    return true;
}

function generateRandomInput() {
    const MAX_CHILDREN = 50;   
    const MAX_IMPORTANCE = 18;  // impoertance not distributed uniformly. (GAUSSIAN)

    const numChildren =  20 +Math.floor(Math.random() * MAX_CHILDREN);
    console.log("numChildren: " + numChildren);
    const height = 20 + Math.floor(Math.random() * 40); 
    const width = 2 * height;
    //console.log("width: " + width);

    let children = [];

    for (let i = 0; i < numChildren; i++) {
        children[i] = {importance: Math.ceil(randn_bm() * 2 * MAX_IMPORTANCE)};
        let childShapeRandomizer = Math.floor(Math.random() * 10);
        if (childShapeRandomizer < 2) {
            children[i].widthOverHeight = 2;
        } else if (childShapeRandomizer < 4) {
            children[i].widthOverHeight = 1 / 2;
        } 
        
    }

    return {c: children, w: width, h: height};
}

function randn_bm() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
    return Math.abs(num - 0.5);
}


function visualizeSolution(x, y, width, height, children) {
    //console.log(children);
    var canvas = paper.Path.Rectangle(x * cellSize, y * cellSize, width * cellSize, height * cellSize);
    canvas.fillColor = new paper.Color(0.8);
    canvas.opacity = 1;
    canvas.strokeColor = "black";
    canvas.strokeWidth = 2;

    for (var i = 0; i < children.length; i++) {
        var item = new Item(new paper.Point(children[i].location).add(new paper.Point(x, y)), children[i].size.width, children[i].size.height, children[i].importance);
        item.draw();
        if (children[i].new !== undefined) {
            item.outer.fillColor = "blue";
        }
    }
    
    for (var i = 0; i < freeChunks.length; i++) {
        let fc = freeChunks[i];
        var ind = paper.Path.Rectangle((x + fc.location.x )* cellSize, (y + fc.location.y) * cellSize, fc.size.width * cellSize, fc.size.height * cellSize);
        ind.strokeColor = "red";
        let label = new paper.PointText({
            content: "["+i+"]\n",
            fontSize: 15,
            fontWeight: 'bold',
            fillColor: "black"
            
        });
        
        if (fc.leftNeighbours !== undefined) {
            label.content += "--L--\n"
            for (var j = 0; j < fc.leftNeighbours.length; j++) {
                label.content = label.content + "(" + fc.leftNeighbours[j].start + ", "+ fc.leftNeighbours[j].end + ")\n";
            }
        }

        if (fc.upNeighbours !== undefined) {
            label.content += "--U--\n"
            for (var j = 0; j < fc.upNeighbours.length; j++) {
                label.content = label.content + "(" + fc.upNeighbours[j].start + ", "+ fc.upNeighbours[j].end + ")\n";
            }
        }

        if (fc.rightNeighbours !== undefined) {
            label.content += "--R--\n"
            for (var j = 0; j < fc.rightNeighbours.length; j++) {
                label.content = label.content + "(" + fc.rightNeighbours[j].start + ", "+ fc.rightNeighbours[j].end + ")\n";
            }
        }
        if (fc.downNeighbours !== undefined) {
            label.content += "--D--\n"
            for (var j = 0; j < fc.downNeighbours.length; j++) {
                label.content = label.content + "(" + fc.downNeighbours[j].start + ", "+ fc.downNeighbours[j].end + ")\n";
            }
        }
        
        label.bounds.center = ind.bounds.center;
    }
    
}

function placeChildren_variousSquares_BBOX_flexible_largestMargin(width, height, children) {
    // sort children by importance
    const sortedChildren = children.sort(function(a,b){
        if (a.importance < b.importance) {
            return 1;
        } else {
            return -1;
        }
    });
    let nextLocStack = [];
    let boundW = 0; // width of the bounding box
    let boundH = 0; // height of the bounding box

    for (let i = 0; i < sortedChildren.length; i++) {
        if (nextLocStack.length === 0) {
            // the stack is empty, the bounding box is full
            const rightExtensionPreferred = width - boundW >= height - boundH; // ensures largest margin.
            if ( rightExtensionPreferred && (boundW + sortedChildren[i].size <= width)) { // extend box towards right if possible
                if (sortedChildren[i].size < boundH) {
                    // push bottom left
                    nextLocStack[nextLocStack.length] = {
                        point: new paper.Point(boundW, sortedChildren[i].size),
                        limit: boundH - sortedChildren[i].size
                    };
                } else {
                    boundH = sortedChildren[i].size;
                }
                
                // place child
                sortedChildren[i].topLeft = new paper.Point(boundW, 0);
                boundW += sortedChildren[i].size;
                sortedChildren[i].size = new paper.Size(sortedChildren[i].size, sortedChildren[i].size);

            } else if (boundH + sortedChildren[i].size <= height) {    // extend box towards the bottom
                if (sortedChildren[i].size < boundW) {
                    // push top right
                    nextLocStack[nextLocStack.length] = {
                        point: new paper.Point(sortedChildren[i].size, boundH),
                        limit: sortedChildren[i].size
                    };
                } else {
                    boundW = sortedChildren[i].size;
                }

                // place child
                sortedChildren[i].topLeft = new paper.Point(0, boundH);
                boundH += sortedChildren[i].size;
                sortedChildren[i].size = new paper.Size(sortedChildren[i].size, sortedChildren[i].size);
            } else {
                // child will not fit. reduce its size as well as the sizes of the subsequent same-sized children.
                const targetSize = sortedChildren[i].size;
                if (targetSize === 1) {
                    console.log("ERROR IN LAYING OUT CHILDREN.. Total is too large"); 
                    return false;
                }
                let j = i; 
                while (j < sortedChildren.length && sortedChildren[j].size >= targetSize) {
                    sortedChildren[j].size = targetSize / 2;
                    //console.log(sortedChildren[j].importance +  " resized to " + (targetSize / 2));
                    j++;
                }
                // rollback
                i--;
                continue;
            }
        } else {
            // first pop is always valid
            let nextLoc = nextLocStack[nextLocStack.length - 1];
            nextLocStack.length--;

            if (sortedChildren[i].size < nextLoc.limit) {
                // push bottom left
                nextLocStack[nextLocStack.length] = {
                    point: nextLoc.point.add(new paper.Point(0, sortedChildren[i].size)),
                    limit: nextLoc.limit - sortedChildren[i].size
                };
            }

            if (sortedChildren[i].size + nextLoc.point.x < boundW) {
                // push top right
                nextLocStack[nextLocStack.length] = {
                    point: nextLoc.point.add(new paper.Point(sortedChildren[i].size, 0)),
                    limit: sortedChildren[i].size
                };
            }
            
            sortedChildren[i].topLeft = nextLoc.point;
            sortedChildren[i].size = new paper.Size(sortedChildren[i].size, sortedChildren[i].size);
        }
    }
    return true;
}

function placeChildren_sq_and_2b1_BBOX_flexible_largestMargin(width, height, children) {
    let nextLocStack = [];
    let boundW = 0; // width of the bounding box
    let boundH = 0; // height of the bounding box

    let rightmostLimitH = 0;


    function extendBoundingBox(child) {
        // the stack is empty, the bounding box is full
        const rightExtensionPreferred = (width - (boundW + child.width) >= height - (boundH + child.height)) && child.height <= boundH; // ensures largest margin.
        if ( rightExtensionPreferred && (boundW + child.width <= width)) { // extend box towards right if possible
            // weird edge-case: _-- THINK OF A MORE ELEGANT WAY
            if (nextLocStack.length !== 0){
                // everything was shifter right. fix that.
                for (let k = 0; k < nextLocStack.length - 1; k++) {
                    nextLocStack[k] = nextLocStack[k + 1];
                }
                nextLocStack.length--;
            }
            if (child.height < rightmostLimitH) {

                // push bottom left
                nextLocStack[nextLocStack.length] = {
                    point: new paper.Point(boundW, child.height),
                    limitH: rightmostLimitH - child.height,
                    limitW: child.width
                };

                
            } else if (boundH === 0) {
                boundH = child.height;    // (covers initial placement)  ////// ----------------------------------------------------------   HANDLE THIS
            }

            
            // place child
            child.topLeft = new paper.Point(boundW, 0);
            boundW += child.width;
            rightmostLimitH = child.height;
            // sortedChildren[i].size = new paper.Size(sortedChildren[i].size, sortedChildren[i].size);

        } else if (boundH + child.height <= height) {    // extend box towards the bottom
            if (child.width < boundW) {
                // push top right
                nextLocStack[0] = {
                    point: new paper.Point(child.width, boundH),
                    limitH: child.height,
                    limitW: nextLocStack.length === 0 ? (boundW - child.width) : (nextLocStack[0].point.x - child.width)
                };
            } else {
                boundW = child.width;
                rightmostLimitH += child.height      ////// ----------------------------------------------------------   HANDLE THIS
            }

            // place child
            child.topLeft = new paper.Point(0, boundH);
            boundH += child.height;
            // sortedChildren[i].size = new paper.Size(sortedChildren[i].size, sortedChildren[i].size);
        } else {
            console.log("NON-FITTING CHILD..... HANDLE LATER");
        }
    }

    // sort in the placement order
    const sortedChildren = children.sort(function(a,b){
        if (a. width < b.width ) {
            return 1;
        } else if (a.width > b.width) {
            return -1;
        } else {
            if (a. height < b.height ) {
                return 1;
            } else if (a.height > b.height) {
                return -1;
            } else {
                if (a.importance < b.importance) {
                    return 1;
                } else {
                    return -1;
                }
            }
        }
    });


    for (let i = 0; i < sortedChildren.length; i++) {
        console.log("i: " + i);
        console.log("stackSize: " + nextLocStack.length);
        if (nextLocStack.length === 0) {
            extendBoundingBox(sortedChildren[i]);
        } else {
            // first pop is always valid
            let nextLoc = nextLocStack[nextLocStack.length - 1];
            nextLocStack.length--;

            if (sortedChildren[i].height > nextLoc.limitH) {
                // must be a problematic 1 x 2
                // see if it can be placed elsewhere within the bounding box 
                // trace stack towards the bottom
                nextLocStack[nextLocStack.length] = nextLoc;    // push nextLoc back
                let j = nextLocStack.length - 1;
                while (j >= 0 && sortedChildren[i].height > nextLocStack[j].limitH) {
                    nextLocStack[j + 1] = nextLocStack[j];   // move elements forward to make place for insertion
                    j--;
                }
                if (j < 0) {
                    extendBoundingBox(sortedChildren[i]);
                } else {
                    console.log("hi-yo");
                   
                    nextLoc = nextLocStack[j];
                    let inserted = 0;
                    if (sortedChildren[i].height < nextLoc.limitH) {
                        console.log("ENTEREED BL");
                        // push bottom left
                        nextLocStack[j] = {
                            point: nextLoc.point.add(new paper.Point(0, sortedChildren[i].height)),
                            limitH: nextLoc.limitH - sortedChildren[i].height,
                            limitW: sortedChildren[i].width
                        };
                        inserted++;
                    }

                    if (sortedChildren[i].width < nextLoc.limitW) {
                        console.log("ENTEREED TR");
                        // push top right
                        nextLocStack[j + inserted] = {
                            point: nextLoc.point.add(new paper.Point(sortedChildren[i].width, 0)),
                            limitH: sortedChildren[i].height,
                            limitW: nextLoc.limitW - sortedChildren[i].width
                        };
                        inserted++;
                    } else {
                        nextLocStack[j + 2].limitH += sortedChildren[i].height;
                    }
                    if (inserted != 2) {
                        for (let k = j + 1; k < nextLocStack.length - (2 - inserted); k++) {
                            nextLocStack[k] = nextLocStack[k + (2 - inserted)];
                        }

                        nextLocStack.length -= (2 - inserted);
                    }
                    sortedChildren[i].topLeft = nextLoc.point;
                }
            } else {
                if (sortedChildren[i].height < nextLoc.limitH) {
                    // push bottom left
                    nextLocStack[nextLocStack.length] = {
                        point: nextLoc.point.add(new paper.Point(0, sortedChildren[i].height)),
                        limitH: nextLoc.limitH - sortedChildren[i].height,
                        limitW: sortedChildren[i].width
                    };
                } else if (nextLocStack.length !== 0) {
                    nextLocStack[nextLocStack.length - 1].limitW += sortedChildren[i].width;
                }
    
                if (sortedChildren[i].width < nextLoc.limitW) {
                    // push top right
                    nextLocStack[nextLocStack.length] = {
                        point: nextLoc.point.add(new paper.Point(sortedChildren[i].width, 0)),
                        limitH: sortedChildren[i].height,
                        limitW: nextLoc.limitW - sortedChildren[i].width,
                    };
                } else {
                    rightmostLimitH += sortedChildren[i].height; 
                }
                sortedChildren[i].topLeft = nextLoc.point;
            }

            
            //sortedChildren[i].size = new paper.Size(sortedChildren[i].size, sortedChildren[i].size);
        }
    }
    return true;
}