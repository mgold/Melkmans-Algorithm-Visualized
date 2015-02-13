function lines(){
    return "<p>" + Array.prototype.slice.call(arguments).join("</p><p>") + "</p>"
}

exports.okayStop = lines( "Okay, stop.",
       "Most convex hull algorithms require the entire polygon up front, but Melkman's asks, what can we find out with <em>only three points</em>?",
       "The convex hull of the three points <em>so far</em> is just the triangle they make. But, as we get more points, we may discover that some or all of these edges aren't actually on the hull at all! It's possible these points are deep in a pocket, but we won't know until we see more of the polygon.",
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

exports.pointInRed = lines("You've placed a point in the <strong class=red>red</strong> region. We now need to pop from the left side of the deqeue until reading leftwards once again corresponds to making only left turns."
        );

exports.pointInBlue = lines("Since the point was placed in the blue region, we now need to pop from the right side of the deqeue until reading rightwards once again corresponds to making only right turns."
        );

exports.pointInPurple = lines("You've placed a point in the <strong class=purple>purple</strong> region, which is just the composition of the red and blue regions!",
        "We pop from both sides of the deque (starting on the left) to restore the order invariant."
        );

exports.redRight = lines("Since the point was placed in the red region, the right side of the deque does not need to be modified.",
        "In a real implementation, the algorithm would pop until these three points form a right turn when read rightward. The red region tells us humans that they already form a right turn.")

exports.blueLeft = lines("You've placed a point in the <strong class=blue>blue</strong> region. This means that the left side of the deque does not need to be modified.",
        "In a real implementation, the algorithm would pop until these three points form a left turn when read leftward. The red region tells us humans that they already form a left turn.")

exports.donePopping = lines("We have now restored the order invariant of the deque, and can now add the newly added point to both ends.",
        "The new deque is once again the convex hull of the known points. Now it's time to add another one!",
        "When you're ready, click the first point you placed to complete the polygon. You'll need an unobstructed line of sight to do so."
        );

exports.finished = lines("Now that we've seen the last point on the polygon, take a moment to read the deque while also tracing the same points on the polygon. You'll notice that it is indeed the convex hull, as it has been all along.",
        "Melkman's algorithm is <strong>online</strong>, meaning that it always has the answer for the data is has seen so far, without requiring any additional processing. Online algorithms have practical value when the data is too big to fit into memory or suffers from network latency. They also lend themselves to visualization, because the audience (that's you) can interact, predict, and respond to the dynamic presentation.",
        "Because each point was added and removed from the deque at most twice (once on each end), the algorithm has taken linear time."
        );
