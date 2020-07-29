// wrapper for the two functions that have to be called consecutively
function autoLay(width, height, children) {
    assignInitialSizes(width, height, children);
    return placeChildren(width, height, children);
}

/*
 * Assigns a "width" and a "height" to each child based on their
 * "importance" and "widthOverHeight" parameters. Also scales these sizes up or down
 * to fit the panel while making the children as large as possible.
 * 
 * The initial sizes are proportional to the smallest power of 2 that is greater than
 * or equal to the importance value. 
 */
function assignInitialSizes(width, height, children){
    let totalArea = 0;
    for (let i = 0; i < children.length; i++) {
        let childWidth;
        let childHeight;
        if (children[i].widthOverHeight === undefined) {
            childWidth = childHeight = 2 ** Math.ceil(Math.log(children[i].importance) / Math.LN2);   // round up importance to a power of 2.
        } else {
            if (children[i].widthOverHeight > 1) {
                childHeight = 2 ** Math.ceil(Math.log(children[i].importance) / Math.LN2);   // round up importance to a power of 2.
                childWidth = childHeight * children[i].widthOverHeight;
            } else {
                childWidth = 2 ** Math.ceil(Math.log(children[i].importance) / Math.LN2);   // round up importance to a power of 2.
                childHeight = childWidth / children[i].widthOverHeight;
            }
        }
        children[i].size = {width: childWidth, height: childHeight};
        
        totalArea += childWidth * childHeight;
    }

    const coeff =  Math.sqrt(4 ** Math.floor(Math.log((width * height) / totalArea ) / (2 * Math.LN2)));   // round down the coefficient to a power of 2.
    
    for (let i = 0; i < children.length; i++) {
        children[i].size.width =  Math.ceil(children[i].size.width * coeff); // ceil if < 1
        children[i].size.height =  Math.ceil(children[i].size.height * coeff);
    }

    let totalOkay = false;
    let tooManyChildren = false;
    while (!totalOkay && !tooManyChildren) {
        // check if ceiling has caused an impossible fit
        totalArea = 0;
        for (let i = 0; i < children.length; i++) {
            totalArea += children[i].size.width * children[i].size.height;
        }
        if (totalArea <= width * height) {
            totalOkay = true;
        } else {
            // shrink all children
            tooManyChildren = true; // there are too many children if they all have size 1 
            for (let i = 0; i < children.length; i++) {
                if (children[i].size.width > 1 || children[i].size.width > 1) {
                    tooManyChildren = false;
                }
                children[i].size.width =  Math.ceil(children[i].size.width / 2); // ceil if < 1
                children[i].size.height =  Math.ceil(children[i].size.height / 2);
            }
        }
    }
    
    if (!totalOkay) {
        console.log("TOO MANY CHILDREN");
        return false;
    }
    return true;
}


/*
 * Assumes "children" have been assigned initial sizes and places them within the given
 * "width" and "height" boundaries.
 * 
 * Initial sizes only ensure that the sum of the surface areas of the children is less than
 * or equal to width * height. This constraint is not sufficient to guarantee a placement 
 * that fits within the parent. Thus, placeChildren may also dynamically resize children as needed.
 * In doing so, it keeps the sizes of children with higher importance values intact if possible.
 */
function placeChildren(width, height, children) {
    // ----------------------------------------------------- //
    // ----------------- HELPER FUNCTIONS ------------------ //
    // ----------------------------------------------------- //

    // Places child into location and updates ladderStack and rightmostHeight where needed. 
    function placeChild(child, location) {
        if (child.size.height < location.limitH) {
            // push the bottom-left corner
            ladderStack.push({
                point: location.point.add(new paper.Point(0, child.size.height)),
                limitH: location.limitH - child.size.height
            })
        }
        if (location.point.x + child.size.width < boundW) {
            // push the top-right corner
            ladderStack.push({
                point: location.point.add(new paper.Point(child.size.width, 0)),
                limitH: child.size.height
            })
        } else {
            // right edge aligns with boundW, can not overextend
            rightmostHeight += child.size.height;
        }

        // TODO: set child properties according to the naming in the live code.
        child.location = {x: location.point.x, y: location.point.y}
    }


    let consecMisfitCounter = -1;   // number of consecutive misfits that can be handled easily
    let consecMisfitIndex = -1;     // the stack entry index where the consecutive misfits should be placed
    let consecMisfitWidth = -1;     // the common width of the same-sized children causing the consec. misfits 

    /*
     * 1 by 2 rectangles are ordinarily placed in exactly the same way as the squares
     * and the 2b1 rectangles. However, the ordinary placement may cause misalignemnt issues sometimes.
     * this function places them in such a case.
     */
    function handle1b2Misfit(child) {
        let j;
        if (consecMisfitCounter > 0 && child.size.width === consecMisfitWidth) {
            j = consecMisfitIndex;
        } else {
            // search the stack for a viable location
            j = ladderStack.length - 1;
            while (j >= 0 && child.size.height > ladderStack[j].limitH) {
                j--;
            }
            consecMisfitCounter = -1;
        }

        if (j < 0) {
            let direction = extendBoundingBox(child);
            if (direction === false) {
                return false;
            }
            if (direction === "bottom") {
                consecMisfitCounter = (ladderStack[1].point.x - ladderStack[0].point.x) / child.size.width;
                consecMisfitIndex = 0;
                consecMisfitWidth = child.size.width;
            } 
        } else {
            let topSlice = ladderStack.slice(j + 1);
            let placeLoc = ladderStack[j];
            ladderStack = ladderStack.slice(0, j);  // temporarily assigned to use directly in placeChild
            placeChild(child, placeLoc);
            
            consecMisfitCounter--;

            if (consecMisfitCounter < 0) {
                consecMisfitCounter = (topSlice[0].point.x - ladderStack[ladderStack.length - 1].point.x) / child.size.width;
                consecMisfitIndex = ladderStack.length - 1;
                consecMisfitWidth = child.size.width;
            } else if (consecMisfitCounter === 0) {
                ladderStack.pop();  // the top-right corner was pushed. Discard it
                consecMisfitCounter = -1;
                if (topSlice.length !== 0) {    // this might always hold. Think about it.
                    topSlice[0].limitH += child.size.height;
                }
            }
            ladderStack = ladderStack.concat(topSlice);
        }
        return true;
    }

    /* 
     * Extends the BB with the given child. 
     * Chooses the direction that will provide the largest mininmum margin if
     * an extension towards the bottom and towards right are both possible.
     */
    function extendBoundingBox(child) {
        const rightExtensionPreferred = (width - (boundW + child.size.width) >= height - (boundH + child.size.height)) && child.size.height <= rightmostHeight; // ensures largest margin.
        if (rightExtensionPreferred && (boundW + child.size.width <= width) &&(child.size.height <= height)) { // extend BB towards right.
            if (boundH === 0) {
                boundH = child.size.height;
                rightmostHeight = Infinity;
            }
            placeChild(child, {
                point: new paper.Point(boundW, 0),
                limitH: rightmostHeight
            });

            boundW += child.size.width;
            rightmostHeight = child.size.height;

            return "right";


        } else if ((!rightExtensionPreferred) && (child.size.width <= width) && (boundH + child.size.height <= height)) {    // extend BB bottom
            let tmp = ladderStack;
            ladderStack = [];

            placeChild(child, {
                point: new paper.Point(0, boundH),
                limitH: -1   // bottom-left should never be pushed
            });
            ladderStack = ladderStack.concat(tmp);    // need to insert to the bottom of the stack

            boundH += child.size.height;
            
            if (boundW === 0) {
                boundW = child.size.width;
                rightmostHeight = child.size.height;
            }

            return "bottom";

        } else {
            console.log("NON-FITTING CHILD... importance: " + child.importance);
            return false;
        }
    }

    // Shrinks the child at index i in sortedChildren as well as the other children 
    // of the same dimensions and moves them to the proper location in sortedChildren.
    function handleNonFit(i) {
        let problematicWidth = sortedChildren[i].size.width;
        let problematicHeight = sortedChildren[i].size.height;
        if (problematicWidth === 1 && problematicHeight === 1) {
            console.error("CAN NOT FIT CHILDREN...");
            return false;
        }
        let targetWidth = Math.ceil(problematicWidth / 2);
        let targetHeight = Math.ceil(problematicHeight / 2);


        let j = i;
        while (j < sortedChildren.length 
            && sortedChildren[j].size.width === problematicWidth 
            && sortedChildren[j].size.height === problematicHeight) {

            sortedChildren[j].size.width = targetWidth;
            sortedChildren[j].size.height = targetHeight;
            j++;
        }

        let targetIndex = j; 
        while (targetIndex < sortedChildren.length 
            && (sortedChildren[targetIndex].size.width > targetWidth
            || (sortedChildren[targetIndex].size.width === targetWidth && sortedChildren[targetIndex].size.height > targetHeight))) {

            targetIndex++;
        }
        
        let leadingSlice = sortedChildren.slice(0, i);
        let problematicSlice = sortedChildren.slice(i, j);
        let swapSlice = sortedChildren.slice(j, targetIndex);
        let trailingSlice = sortedChildren.slice(targetIndex);
        
        sortedChildren = leadingSlice.concat(swapSlice).concat(problematicSlice).concat(trailingSlice);
        return true;
    }

    // ----------------------------------------------------- //
    // -----------------   FUNCTION BODY  ------------------ //
    // ----------------------------------------------------- //

    // sort the children in the placement order
    let sortedChildren = children.sort(function(a,b){
        if (a.size.width < b.size.width ) {
            return 1;
        } else if (a.size.width > b.size.width) {
            return -1;
        } else {
            if (a.size.height < b.size.height ) {
                return 1;
            } else if (a.size.height > b.size.height) {
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

    let ladderStack = [];   // the stack of possible placement locations within
                            // the current bounding box. (inner corners of the ladder)

    let rightmostHeight = 0;    // the height of the rightmost edge of the BB.
    let boundW = 0;     // width of the BB
    let boundH = 0;     // height of the BB

    for (let i = 0; i < sortedChildren.length; i++) {
        let success;    // indicates whether the child was placed
        if (ladderStack.length === 0) {
            success = extendBoundingBox(sortedChildren[i]);

        } else {
            let nextLoc = ladderStack.pop();
            if (sortedChildren[i].size.height > nextLoc.limitH) {
                ladderStack.push(nextLoc);  // CHANGE THIS
                success = handle1b2Misfit(sortedChildren[i]);
            } else {
                placeChild(sortedChildren[i], nextLoc);
                success = true;
            }
        }

        if (success === false) {
            // The child can not be placed. 
            if (handleNonFit(i) === false) {
                return false;
            }

            i--; // rollback and retry
        }
    }
    return {
        ladder: [{x: boundW, y: 0}].concat(ladderStack.map(e => {return {x: e.point.x, y: e.point.y}})).concat([{x: 0, y: boundH}]),
        rightMargin: width - boundW,
        bottomMargin: height - boundH
    };
}