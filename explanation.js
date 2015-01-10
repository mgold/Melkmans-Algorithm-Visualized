function lines(){
    return "<p>" + Array.prototype.slice.call(arguments).join("</p><p>") + "</p>"
}

exports.okayStop = lines( "Okay, stop.",
       "Most convex hull algorithms require the entire polygon up front, but Melkman's asks, what can we find out with <em>only three points</em>?",
       "The convex hull of the three points <em>so far</em> is just the triangle they make. But, as we get more points, we may discover that some or all of these edges aren't actually on the hull at all!",
       "Hit the <strong>spacebar<strong> to continue."
       );

exports.dequeIntro = lines("Melkman's algorithm uses a <strong>deque</strong>, or double-ended queue, to solve this problem. The deque always contains the hull of the points we know about. It is efficient to read or modify either end of the deque. Its contents are now shown above.",
        "One property of convex polygons (like the hull we're trying to find) is that if you travel the vertices in one direction, you make only right turns. If you travel in the opposite direction, you make only left turns.",
        "The deque uses this property to maintain an invariant. If you read the deque rightward, you will make only right turns. If you read leftward, you will make only left turns.",
        "Spacebar to continue..."
);

exports.yellowRegion = lines("Melkman's algorithm now asks, what could happen on the next point? What changes could be required to maintain the deque's invariants? All eyes are on point c, the last to make it on to the hull. Based on it, we draw four regions, and we respond to point d based on which region it falls in.",
        "The <strong class=yellow>yellow</strong> region is the simplest: all points in that region are already within the known hull, so they can't be on it. If point d is in this region, we simply discard it and wait for point e.",
        "Go ahead and place a point in the yellow region."
);

exports.rbpRegions = lines("We now symetrically extent the boundaries of the hull, looking on each end of the deque.",
        "A sharp left turn puts us in the <strong class=blue>blue</strong> region. A left turn could violate the invariant on the right side of the deque, where we should be making a right turn.",
        "Similarly, a sharp right turn puts us in the <strong class=red>red</strong> region. And if we go into the <strong class=purple>purple</strong> region, we may need to worry about both ends of the deque.",
        "Place a point in one of these regions and we'll figure out what we have to do."
);
