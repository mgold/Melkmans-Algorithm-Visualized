function lines(){
    return "<p>" + Array.prototype.slice.call(arguments).join("</p><p>") + "</p>"
}

exports.okayStop = lines( "Okay, stop.",
       "Most convex hull algorithms require the entire polygon up front, but Melkman's asks, what can we find out with <em>only three points</em>?",
       "The convex hull of the three points <em>so far</em> is just the triangle they make. But, as we get more points, we may discover that some or all of these edges aren't actually on the hull at all!",
       "We need a way to store the current hull that can easily be changed to accomodate new information as it arrives.",
       "Hit the <strong>spacebar<strong> to continue."
       );

exports.dequeIntro = lines("Melkman's algorithm uses a <strong>deque</strong>, or double-ended queue, to solve this problem. The deque always contains the hull of the points we know about. It is efficient to read or modify either end of the deque. Its contents are now shown above.",
        "One property of convex polygons (like the hull we're trying to find) is that if you travel the vertices in one direction, you make only right turns. If you travel in the opposite direction, you make only left turns.",
        "The deque uses this property to maintain an invariant. If you read the deque rightward, skipping the gap in the polygon, you will make only right turns. If you read leftward, you will make only left turns.",
        "Spacebar to continue..."
);

exports.pointC = function(leftTurn){
    return lines("<strong class=purple>Point c</strong> appears on both ends of the deque because it was the last point added to the hull. This is an invariant we want to maintain. But the next point in the deque, in each direction, is also important.",
            "We'll say that <strong class=blue>point " +
            (leftTurn ? "a" : "b" ) +
            "</strong> will be blue because it appears to point c's left. Notice that this means it appears on the right side of the deque. Similarly, <strong class=red> point " +
            (leftTurn ? "b" : "a" ) +
            "</strong> will be red because it appears to point c's right.",
            "Right now, the deque is small, so all points matter. Later on, we'll see that we don't need to access points deep in the deque."
            )
}

exports.rbpRegions = lines("Looking at those two outermost points on each side of the deque, we extend the lines they form to create regions, based on where point d could land.",
        "A sharp left turn puts us in the <strong class=blue>blue</strong> region. A left turn could violate the invariant on the right side of the deque, where we should be making a right turn.",
        "Similarly, a sharp right turn puts us in the <strong class=red>red</strong> region. And if we go into the <strong class=purple>purple</strong> region, we may need to worry about both ends of the deque.",
        "If point d is in any of these regions, it will be on the convex hull (of points seen thusfar) and we must modify the deque."
);

exports.yellowRegion = lines("But point d could also land within the known hull, requiring no changes to the deque. This is the <strong class=yellow>yellow</strong> region. If point d lands here, we simply discard it and wait for the next point.",
        "Finally, the remaining <strong class=white>white</strong> region is only accessible from point c by crossing an existing polygon edge. Melkman's algorithm assumes the polygon is <strong>simple</strong>, meaning that its edges don't intersect like that. It's this knowledge that allows the algorithm to operate in linear time.",
        "Notice how the four permissible regions meet at point c, the last point added to the hull. We can determine which region we land in from the turn direction of lines <em>acd</em> and <em>bcd</em>. Thus, the regions are illustrative only, and do not need to be calculated explicitly.",
        "Now place point d in one of the colored regions."
        );

exports.pointInYellow = lines("You've placed a point in the <strong class=yellow>yellow</strong> region, which is inside the known hull. Since this new point can't possibly be on the hull, we just ignore it.",
        "You can place as many points in the yellow region as you like. Just be sure to leave yourself a way out."
        );

exports.pointInRed = lines("You've placed a point in the <strong class=red>red</strong> region. We need to look at the left side of the deque, but first, we can go ahead and push this point to the right side, because we know it will keep the right turn invariant.",
        "We now need to pop from the left side of the deqeue until reading leftwards corresponds to making only left turns."
        );

exports.pointInBlue = lines("You've placed a point in the <strong class=blue>blue</strong> region. We need to look at the right side of the deque, but first, we can go ahead and push this point to the left side, because we know it will keep the left turn invariant.",
        "We now need to pop from the right side of the deqeue until reading rightwards corresponds to making only right turns."
        );

exports.pointInPurple = lines("You've placed a point in the <strong class=purple>purple</strong> region. We need to look at the both sides of the deque. In fact, the purple region is just the composition of the red and blue regions!",
        "We pop from both sides of the deque to restore the order invariant."
        );
