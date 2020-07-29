function placeNewChildren_largestChunk(newChildren) {
    let targetChunk = freeHeap.pop();

    newChildren.forEach(c => {
        c.importance = 1;   // disregard importances
    });

    let res = autoLay(targetChunk.size.width, targetChunk.size.height, newChildren);
    if (!res) {
        // autoLay failed
        console.log("aborting placeNewChildren...");
        return false;
    }
    let ladder = res.ladder;
    let newChunks = [];
    if (ladder.length > 0) {
        newChunks[0] = new RectItem(
            targetChunk.x1() + ladder[0].x + res.rightMargin / 2,
            targetChunk.x2(),
            targetChunk.y1() + ladder[0].y + res.bottomMargin / 2,
            targetChunk.y2()
        )
    }

    for (let j = 1; j < ladder.length; j++) {
        newChunks[j] = new RectItem(
            targetChunk.x1() + ladder[j].x + res.rightMargin / 2,
            targetChunk.x1() + ladder[j - 1].x + res.rightMargin / 2,
            targetChunk.y1() + ladder[j].y + + res.bottomMargin / 2,
            targetChunk.y2()
        )
    }

    let topChunk = new RectItem(targetChunk.x1() + res.rightMargin / 2, targetChunk.x2(), targetChunk.y1(), targetChunk.y1() + res.bottomMargin / 2);
    let leftChunk = new RectItem(targetChunk.x1(), targetChunk.x1() + res.rightMargin / 2, targetChunk.y1(), targetChunk.y2());

    let leftLegal = leftChunk.isLegal(width, height);
    let topLegal = topChunk.isLegal(width, height);
    let rightChunk = newChunks[0];
    let rightLegal = rightChunk.isLegal(width, height);

    targetChunk.leftNeighbours.forEach(n => {
        n.neigh.rightNeighbours = n.neigh.rightNeighbours.filter(e => e.neigh !== targetChunk);
        if (leftLegal) {
            handleOuterNeighbour(n, leftChunk, "left");
        } else {
            if (newChunks[newChunks.length ] )
            if (topLegal) {
                handleOuterNeighbour(n, topChunk, "left");
            }
        }
    });
    targetChunk.upNeighbours.forEach(n => {
        n.neigh.rightNeighbours = n.neigh.rightNeighbours.filter(e => e.neigh !== targetChunk);
        if (leftLegal) {
            handleOuterNeighbour(n, leftChunk, "up");
        }
        if (topLegal) {
            handleOuterNeighbour(n, topChunk, "up");
        } else if (rightLegal) {
            handleOuterNeighbour(n, rightChunk, "up");
        }
    }); 

    targetChunk.rightNeighbours.forEach(n => {
        n.neigh.rightNeighbours = n.neigh.rightNeighbours.filter(e => e.neigh !== targetChunk);
        if (upLegal) {
            handleOuterNeighbour(n, leftChunk, "right");
        }
        if (topLegal) {
            handleOuterNeighbour(n, topChunk, "right");
        } else if (rightLegal) {
            handleOuterNeighbour(n, rightChunk, "up");
        }
    }); 


    
    if (newChunks[ladder.length].size.width > 0) {
        targetChunk.leftNeighbours.forEach(n => {
            n.neigh.rightNeighbours = n.neigh.rightNeighbours.filter(e => e.neigh !== targetChunk);
            handleOuterNeighbour(n, newChunks[ladder.length + 1], "left");
            if (secUp !== undefined) {
                handleOuterNeighbour(n, secUp, "up");
            }
        });
    }
    


    freeChunks.splice(freeChunks.indexOf(targetChunk),1);
    freeChunks = freeChunks.concat(newChunks);

    newChildren.forEach(c => {
        c.location.x += targetChunk.location.x + res.rightMargin / 2;
        c.location.y += targetChunk.location.y + res.bottomMargin / 2;
        c.new = true;
    });
    
    children = children.concat(newChildren);
}