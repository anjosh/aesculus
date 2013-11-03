//
//  main.js
//
//  A project template for using arbor.js
//



(function($){

    var Renderer = function(canvas){
    var canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d");
    var particleSystem

    var that = {
        init:function(system){
            //
            // the particle system will call the init function once, right before the
            // first frame is to be drawn. it's a good place to set up the canvas and
            // to pass the canvas size to the particle system
            //
            // save a reference to the particle system for use in the .redraw() loop
            particleSystem = system

    // inform the system of the screen dimensions so it can map coords for us.
    // if the canvas is ever resized, screenSize should be called again with
    // the new dimensions
    particleSystem.screenSize(canvas.width, canvas.height) 
    particleSystem.screenPadding(80) // leave an extra 80px of whitespace per side

    // set up some event handlers to allow for node-dragging
    that.initMouseHandling()
        },

        redraw:function(){
            // 
            // redraw will be called repeatedly during the run whenever the node positions
            // change. the new positions for the nodes can be accessed by looking at the
            // .p attribute of a given node. however the p.x & p.y values are in the coordinates
            // of the particle system rather than the screen. you can either map them to
            // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
            // which allow you to step through the actual node objects but also pass an
            // x,y point in the screen's coordinate system
            // 
            ctx.fillStyle = "white"
                ctx.fillRect(0,0, canvas.width, canvas.height)

                particleSystem.eachEdge(function(edge, pt1, pt2){
                    // edge: {source:Node, target:Node, length:#, data:{}}
                    // pt1:  {x:#, y:#}  source position in screen coords
                    // pt2:  {x:#, y:#}  target position in screen coords

                    // draw a line from pt1 to pt2
                    ctx.strokeStyle = "rgba(0,0,0, .333)"
                    ctx.lineWidth = 1
                    ctx.beginPath()
                    ctx.moveTo(pt1.x, pt1.y)
                    ctx.lineTo(pt2.x, pt2.y)
                    ctx.stroke()
                })

            particleSystem.eachNode(function(node, pt){

                // node: {mass:#, p:{x,y}, name:"", data:{}}
                // pt:   {x:#, y:#}  node position in screen coords


                // determine the box size and round off the coords if we'll be
                // drawing a text label (awful alignment jitter otherwise...)
                var w = ctx.measureText(node.data.label||"").width + 6
                var label = node.data.label
                if (!(label||"").match(/^[ \t]*$/)){
                    pt.x = Math.floor(pt.x)
                pt.y = Math.floor(pt.y)
                }else{
                    label = null
                }

            if(node.data.canTake || node.data.taken) {
                if (node.data.taken) {
                    ctx.fillStyle = 'red'
                } else {
                    ctx.fillStyle = 'green'
                }
            } else {
                ctx.fillStyle = 'gray'
            }

            ctx.fillRect(pt.x - w/2, pt.y - 7, w,14)

                // draw the text
                if (label){
                    ctx.font = "bold 11px Arial"
                        ctx.textAlign = "center"

                        // if (node.data.region) ctx.fillStyle = palette[node.data.region]
                        // else ctx.fillStyle = "#888888"
                        ctx.fillStyle = "#FFFFFF"            

                        ctx.fillText(label||"", pt.x, pt.y+4)
                }
            })            
        },

        findNextClasses:function(node) {
            var outgoing = sys.getEdgesFrom(node)
                var i = 0

                while (i < outgoing.length) {
                    nextNode = outgoing[i]

                        var prereqs = getEdgesTo(nextNode)
                        var j = 0

                        while (j < prereqs.length) {
                            if (!prereqs[i].taken) {
                                break
                            }
                            j++
                        }

                    if (j === prereqs.length) {
                        nextNode.canTake = true
                    }

                    i++

                }
        },

        initMouseHandling:function(){
            // no-nonsense drag and drop (thanks springy.js)
            var dragged = null;

            // set up a handler object that will initially listen for mousedowns then
            // for moves and mouseups while dragging
            var handler = {
                clicked:function(e){
                    var pos = $(canvas).offset();
                    _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
                        dragged = particleSystem.nearest(_mouseP);

                    if (dragged && dragged.node !== null){
                        // while we're dragging, don't let physics move the node
                        dragged.node.fixed = true
                    }

                    oldTakenState = dragged.node.data.taken
                        $(canvas).bind('mousemove', handler.dragged)
                        $(window).bind('mouseup', handler.dropped)

                        dragged.node.data.taken = !dragged.node.data.taken
                        findNextClasses(dragged.node)



                        return false
                },
                dragged:function(e, oldTakenState){
                    var pos = $(canvas).offset();
                    var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)

                        if (dragged && dragged.node !== null){
                            var p = particleSystem.fromScreen(s)
                                dragged.node.p = p
                        }
                    dragged.node.data.taken = oldTakenState
                        findNextClasses(dragged.node)


                        return false
                },

                dropped:function(e){
                    if (dragged===null || dragged.node===undefined) return
                        if (dragged.node !== null) dragged.node.fixed = false
                            dragged.node.tempMass = 1000
                                dragged = null
                                $(canvas).unbind('mousemove', handler.dragged)
                                $(window).unbind('mouseup', handler.dropped)
                                _mouseP = null
                                return false
                }
            }

            // start listening
            $(canvas).mousedown(handler.clicked);

        },

    }
return that
    }    

    $(document).ready(function(){
        var sys = arbor.ParticleSystem(1000, 600, 0.5) // create the system with sensible repulsion/stiffness/friction
        sys.parameters({gravity:true}) // use center-gravity to make the graph settle nicely (ymmv)
        sys.renderer = Renderer("#viewport") // our newly created renderer will have its .init() method called shortly by sys...

        // add some nodes to the graph and watch it go...
        sys.addNode('cse1223', {label: "CSE 1223: Intro to Java", mass:.25, taken: false, canTake: false})
        sys.addNode('cse2221', {label: "CSE 2221: Software I", mass:.5, taken: false, canTake : false})
        sys.addNode('cse2231', {label: "CSE 2231: Software II", mass:.25, taken: false, canTake: false})
        sys.addNode('cse2321', {label: "CSE 2321: Foundations I", mass:.25, taken: false, canTake: false})
        sys.addNode('cse2331', {label: "CSE 2331: Foundations II", mass:.25, taken: false, canTake: false})
        sys.addNode('cse2421', {label: "CSE 2421: Systems I", mass:.25, taken: false, canTake : false})
        sys.addNode('cse2431', {label: "CSE 2431: Systems II", mass:.25, taken: false, canTake: false})
        sys.addNode('ece2000', {label: "ECE 2000: Electrical and Computer Engineering I", mass:.25, taken: false, canTake: false})
        sys.addNode('ece2100', {label: "ECE 2100: Electrical and Computer Engineering II", mass:.25, taken: false, canTake: false})

        sys.addEdge('cse1223', 'cse2221')
        sys.addEdge('cse2221', 'cse2231')
        sys.addEdge('cse2221', 'cse2321')
        sys.addEdge('cse2231', 'cse2331')
        sys.addEdge('cse2321', 'cse2331')
        sys.addEdge('cse2231', 'cse2421')
        sys.addEdge('cse2321', 'cse2421')
        sys.addEdge('cse2331', 'cse2431')
        sys.addEdge('cse2421', 'cse2431')
        sys.addEdge('cse2221', 'ece2000')
        sys.addEdge('ece2000', 'ece2100')
        // or, equivalently:
        //
        // sys.graft({
        //   nodes:{
        //     f:{alone:true, mass:.25}
        //   }, 
        //   edges:{
        //     a:{ b:{},
        //         c:{},
        //         d:{},
        //         e:{}
        //     }
        //   }
        // })

    })

})(this.jQuery)

