function placeNewChildren_largestChunk(newChildren) {
    var freeHeap = computeFreeHeap();

    let targetChunk = freeHeap.pop();

    newChildren.forEach(c => {
        c.importance = 1;   // disregard importances
    });

    let res = autoLay(targetChunk.size.width, targetChunk.size.height, newChildren);
    if (!res) {
        // autoLay failed
        console.log("aborting placeNewChildren...");
        return false;
    };
    
    for (let i = 0; i < newChildren.length; i++) {
        var x1 = newChildren[i].location.x + targetChunk.location.x + res.rightMargin / 2;
        var y1 = newChildren[i].location.y + targetChunk.location.y + res.bottomMargin / 2;
        newChildren[i] = new RectItem(x1, x1 + newChildren[i].size.width, y1, y1 + newChildren[i].size.height);
        newChildren[i].new = true;
    }
    children = children.concat(newChildren);
}

