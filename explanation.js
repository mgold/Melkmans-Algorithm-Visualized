function lines(){
    return "<p>" + Array.prototype.slice.call(arguments).join("</p><p>") + "</p>"
}

exports.okayStop = lines( "Okay, stop.",
       "Most convex hull algorithms require the entire polygon up front, but Melkman's asks, what can we find out with <em>only three points</em>?",
       "Think about it, then hit the <strong>spacebar<strong> to continue."
       );

exports.dequeIntro = lines("The convex hull of the three points <em>so far</em> is just the triangle they make. But, as we get more points, we may discover that some or all of these edges aren't actually on the hull at all!",
        "Melkman's algorithm uses a <strong>deque</strong>, or double-ended queue, to solve this problem. The deque always contains the hull of the points we know about. It is efficient to read or modify either end of the deque. Its contents are now shown above.",
        "One property of convex polygons (like the hull we're trying to find) is that if you travel the vertices in one direction, you make only right turns. If you travel in the opposite direction, you make only left turns.",
        "The deque uses this property to maintain an invariant. If you read the deque rightward, you will make only right turns. If you read leftward, you will make only left turns.",
        "Spacebar to continue..."
);

