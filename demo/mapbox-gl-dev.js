(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/buffer.js":[function(require,module,exports){
'use strict';

// a simple wrapper around a single arraybuffer

module.exports = Buffer;

function Buffer(buffer) {
    if (!buffer) {
        this.array = new ArrayBuffer(this.defaultLength);
        this.length = this.defaultLength;
        this.setupViews();

    } else {
        // we only recreate buffers after receiving them from workers for binding to gl,
        // so we only need these 2 properties
        this.array = buffer.array;
        this.pos = buffer.pos;
    }
}

Buffer.prototype = {
    pos: 0,
    itemSize: 4, // bytes in one item
    defaultLength: 8192, // initial buffer size
    arrayType: 'ARRAY_BUFFER', // gl buffer type

    get index() {
        return this.pos / this.itemSize;
    },

    setupViews: function() {
        // set up views for each type to add data of different types to the same buffer
        this.ubytes = new Uint8Array(this.array);
        this.bytes = new Int8Array(this.array);
        this.ushorts = new Uint16Array(this.array);
        this.shorts = new Int16Array(this.array);
    },

    // binds the buffer to a webgl context
    bind: function(gl) {
        var type = gl[this.arrayType];
        if (!this.buffer) {
            this.buffer = gl.createBuffer();
            gl.bindBuffer(type, this.buffer);
            gl.bufferData(type, new DataView(this.array, 0, this.pos), gl.STATIC_DRAW);

            // dump array buffer once it's bound to gl
            this.array = null;
        } else {
            gl.bindBuffer(type, this.buffer);
        }
    },

    destroy: function(gl) {
        if (this.buffer) {
            gl.deleteBuffer(this.buffer);
        }
    },

    // increase the buffer size by 50% if a new item doesn't fit
    resize: function() {
        if (this.length < this.pos + this.itemSize) {

            while (this.length < this.pos + this.itemSize) {
                // increase the length by 50% but keep it even
                this.length = Math.round(this.length * 1.5 / 2) * 2;
            }

            // array buffers can't be resized, so we create a new one and reset all bytes there
            this.array = new ArrayBuffer(this.length);

            var ubytes = new Uint8Array(this.array);
            ubytes.set(this.ubytes);

            this.setupViews();
        }
    }
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/buffer_set.js":[function(require,module,exports){
'use strict';

var LineVertexBuffer = require('./line_vertex_buffer');
var LineElementBuffer = require('./line_element_buffer');
var FillVertexBuffer = require('./fill_vertex_buffer');
var FillElementBuffer = require('./fill_elements_buffer');
var OutlineElementBuffer = require('./outline_elements_buffer');
var GlyphVertexBuffer = require('./glyph_vertex_buffer');
var IconVertexBuffer = require('./icon_vertex_buffer');

module.exports = function(bufferset) {
    bufferset = bufferset || {};
    return {
        glyphVertex: new GlyphVertexBuffer(bufferset.glyphVertex),
        iconVertex: new IconVertexBuffer(bufferset.iconVertex),
        fillVertex: new FillVertexBuffer(bufferset.fillVertex),
        fillElement: new FillElementBuffer(bufferset.fillElement),
        outlineElement: new OutlineElementBuffer(bufferset.outlineElement),
        lineVertex: new LineVertexBuffer(bufferset.lineVertex),
        lineElement: new LineElementBuffer(bufferset.lineElement)
    };
};

},{"./fill_elements_buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/fill_elements_buffer.js","./fill_vertex_buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/fill_vertex_buffer.js","./glyph_vertex_buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/glyph_vertex_buffer.js","./icon_vertex_buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/icon_vertex_buffer.js","./line_element_buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/line_element_buffer.js","./line_vertex_buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/line_vertex_buffer.js","./outline_elements_buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/outline_elements_buffer.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/fill_elements_buffer.js":[function(require,module,exports){
'use strict';

var Buffer = require('./buffer');

module.exports = FillElementsBuffer;

function FillElementsBuffer(buffer) {
    Buffer.call(this, buffer);
}

FillElementsBuffer.prototype = Object.create(Buffer.prototype);

FillElementsBuffer.prototype.itemSize = 6; // bytes per triangle (3 * unsigned short == 6 bytes)
FillElementsBuffer.prototype.arrayType = 'ELEMENT_ARRAY_BUFFER';

FillElementsBuffer.prototype.add = function(a, b, c) {
    var pos2 = this.pos / 2;

    this.resize();

    this.ushorts[pos2 + 0] = a;
    this.ushorts[pos2 + 1] = b;
    this.ushorts[pos2 + 2] = c;

    this.pos += this.itemSize;
};

},{"./buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/buffer.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/fill_vertex_buffer.js":[function(require,module,exports){
'use strict';

var Buffer = require('./buffer');

module.exports = FillVertexBuffer;

function FillVertexBuffer(buffer) {
    Buffer.call(this, buffer);
}

FillVertexBuffer.prototype = Object.create(Buffer.prototype);

FillVertexBuffer.prototype.itemSize = 4; // bytes per vertex (2 * short == 4 bytes)

FillVertexBuffer.prototype.add = function(x, y) {
    var pos2 = this.pos / 2;

    this.resize();

    this.shorts[pos2 + 0] = x;
    this.shorts[pos2 + 1] = y;

    this.pos += this.itemSize;
};

},{"./buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/buffer.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/glyph_vertex_buffer.js":[function(require,module,exports){
'use strict';

var Buffer = require('./buffer');

module.exports = GlyphVertexBuffer;

function GlyphVertexBuffer(buffer) {
    Buffer.call(this, buffer);
}

GlyphVertexBuffer.prototype = Object.create(Buffer.prototype);

GlyphVertexBuffer.prototype.defaultLength = 2048 * 16;
GlyphVertexBuffer.prototype.itemSize = 16;

// Converts the 0..2pi to an int16 range
GlyphVertexBuffer.angleFactor = 128 / Math.PI;

GlyphVertexBuffer.prototype.add = function(x, y, ox, oy, tx, ty, angle, minzoom, range, maxzoom, labelminzoom) {
    var pos = this.pos,
        pos2 = pos / 2,
        angleFactor = GlyphVertexBuffer.angleFactor;

    this.resize();

    this.shorts[pos2 + 0] = x;
    this.shorts[pos2 + 1] = y;
    this.shorts[pos2 + 2] = Math.round(ox * 64); // use 1/64 pixels for placement
    this.shorts[pos2 + 3] = Math.round(oy * 64);

    this.ubytes[pos + 8] = Math.floor((labelminzoom || 0) * 10);
    this.ubytes[pos + 9] = Math.floor((minzoom || 0) * 10); // 1/10 zoom levels: z16 == 160.
    this.ubytes[pos + 10] = Math.floor(Math.min(maxzoom || 25, 25) * 10); // 1/10 zoom levels: z16 == 160.
    this.ubytes[pos + 11] = Math.round(angle * angleFactor) % 256;
    this.ubytes[pos + 12] = Math.max(Math.round(range[0] * angleFactor), 0) % 256;
    this.ubytes[pos + 13] = Math.min(Math.round(range[1] * angleFactor), 255) % 256;

    this.ubytes[pos + 14] = Math.floor(tx / 4);
    this.ubytes[pos + 15] = Math.floor(ty / 4);

    this.pos += this.itemSize;
};

GlyphVertexBuffer.prototype.bind = function(gl, shader) {
    Buffer.prototype.bind.call(this, gl);

    var stride = this.itemSize;

    gl.vertexAttribPointer(shader.a_pos,    2, gl.SHORT, false, stride, 0);
    gl.vertexAttribPointer(shader.a_offset, 2, gl.SHORT, false, stride, 4);

    gl.vertexAttribPointer(shader.a_labelminzoom, 1, gl.UNSIGNED_BYTE, false, stride, 8);
    gl.vertexAttribPointer(shader.a_minzoom,      1, gl.UNSIGNED_BYTE, false, stride, 9);
    gl.vertexAttribPointer(shader.a_maxzoom,      1, gl.UNSIGNED_BYTE, false, stride, 10);
    gl.vertexAttribPointer(shader.a_angle,        1, gl.UNSIGNED_BYTE, false, stride, 11);
    gl.vertexAttribPointer(shader.a_rangeend,     1, gl.UNSIGNED_BYTE, false, stride, 12);
    gl.vertexAttribPointer(shader.a_rangestart,   1, gl.UNSIGNED_BYTE, false, stride, 13);

    gl.vertexAttribPointer(shader.a_tex, 2, gl.UNSIGNED_BYTE, false, stride, 14);
};

},{"./buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/buffer.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/icon_vertex_buffer.js":[function(require,module,exports){
'use strict';

var Buffer = require('./buffer');

module.exports = GlyphVertexBuffer;

function GlyphVertexBuffer(buffer) {
    Buffer.call(this, buffer);
}

GlyphVertexBuffer.prototype = Object.create(Buffer.prototype);

GlyphVertexBuffer.prototype.defaultLength = 2048 * 20;
GlyphVertexBuffer.prototype.itemSize = 20;

// Converts the 0..2pi to an int16 range
GlyphVertexBuffer.angleFactor = 128 / Math.PI;

GlyphVertexBuffer.prototype.add = function(x, y, ox, oy, tx, ty, angle, minzoom, range, maxzoom, labelminzoom) {
    var pos = this.pos,
        pos2 = pos / 2,
        angleFactor = GlyphVertexBuffer.angleFactor;

    this.resize();

    this.shorts[pos2 + 0] = x;
    this.shorts[pos2 + 1] = y;
    this.shorts[pos2 + 2] = Math.round(ox * 64); // use 1/64 pixels for placement
    this.shorts[pos2 + 3] = Math.round(oy * 64);

    this.ubytes[pos + 8] = Math.floor((labelminzoom || 0) * 10);
    this.ubytes[pos + 9] = Math.floor((minzoom || 0) * 10); // 1/10 zoom levels: z16 == 160.
    this.ubytes[pos + 10] = Math.floor(Math.min(maxzoom || 25, 25) * 10); // 1/10 zoom levels: z16 == 160.
    this.ubytes[pos + 11] = Math.round(angle * angleFactor) % 256;
    this.ubytes[pos + 12] = Math.max(Math.round(range[0] * angleFactor), 0) % 256;
    this.ubytes[pos + 13] = Math.min(Math.round(range[1] * angleFactor), 255) % 256;

    this.shorts[pos2 + 8] = tx;
    this.shorts[pos2 + 9] = ty;

    this.pos += this.itemSize;
};

GlyphVertexBuffer.prototype.bind = function(gl, shader) {
    Buffer.prototype.bind.call(this, gl);

    var stride = this.itemSize;

    gl.vertexAttribPointer(shader.a_pos,    2, gl.SHORT, false, stride, 0);
    gl.vertexAttribPointer(shader.a_offset, 2, gl.SHORT, false, stride, 4);

    gl.vertexAttribPointer(shader.a_labelminzoom, 1, gl.UNSIGNED_BYTE, false, stride, 8);
    gl.vertexAttribPointer(shader.a_minzoom,      1, gl.UNSIGNED_BYTE, false, stride, 9);
    gl.vertexAttribPointer(shader.a_maxzoom,      1, gl.UNSIGNED_BYTE, false, stride, 10);
    gl.vertexAttribPointer(shader.a_angle,        1, gl.UNSIGNED_BYTE, false, stride, 11);
    gl.vertexAttribPointer(shader.a_rangeend,     1, gl.UNSIGNED_BYTE, false, stride, 12);
    gl.vertexAttribPointer(shader.a_rangestart,   1, gl.UNSIGNED_BYTE, false, stride, 13);

    gl.vertexAttribPointer(shader.a_tex, 2, gl.SHORT, false, stride, 16);
};

},{"./buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/buffer.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/line_element_buffer.js":[function(require,module,exports){
'use strict';

var Buffer = require('./buffer');

module.exports = LineElementBuffer;

function LineElementBuffer(buffer) {
    Buffer.call(this, buffer);
}

LineElementBuffer.prototype = Object.create(Buffer.prototype);

LineElementBuffer.prototype.itemSize = 6; // bytes per triangle (3 * unsigned short == 6 bytes)
LineElementBuffer.prototype.arrayType = 'ELEMENT_ARRAY_BUFFER';

LineElementBuffer.prototype.add = function(a, b, c) {
    var pos2 = this.pos / 2;

    this.resize();

    this.ushorts[pos2 + 0] = a;
    this.ushorts[pos2 + 1] = b;
    this.ushorts[pos2 + 2] = c;

    this.pos += this.itemSize;
};

},{"./buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/buffer.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/line_vertex_buffer.js":[function(require,module,exports){
'use strict';

var Buffer = require('./buffer');

module.exports = LineVertexBuffer;

function LineVertexBuffer(buffer) {
    Buffer.call(this, buffer);
}

// scale the extrusion vector so that the normal length is this value.
// contains the "texture" normals (-1..1). this is distinct from the extrude
// normals for line joins, because the x-value remains 0 for the texture
// normal array, while the extrude normal actually moves the vertex to create
// the acute/bevelled line join.
LineVertexBuffer.extrudeScale = 63;

LineVertexBuffer.prototype = Object.create(Buffer.prototype);

LineVertexBuffer.prototype.itemSize = 8; // bytes per vertex (2 * short + 1 * short + 2 * byte = 8 bytes)
LineVertexBuffer.prototype.defaultLength = 32768;

// add a vertex to this buffer;
// x, y - vertex position
// ex, ey - extrude normal
// tx, ty - texture normal

LineVertexBuffer.prototype.add = function(point, extrude, tx, ty, linesofar) {
    var pos = this.pos,
        pos2 = pos / 2,
        index = this.index,
        extrudeScale = LineVertexBuffer.extrudeScale;

    this.resize();

    this.shorts[pos2 + 0] = (Math.floor(point.x) * 2) | tx;
    this.shorts[pos2 + 1] = (Math.floor(point.y) * 2) | ty;
    this.shorts[pos2 + 2] = Math.round(linesofar || 0);
    this.bytes[pos + 6] = Math.round(extrudeScale * extrude.x);
    this.bytes[pos + 7] = Math.round(extrudeScale * extrude.y);

    this.pos += this.itemSize;
    return index;
};

},{"./buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/buffer.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/outline_elements_buffer.js":[function(require,module,exports){
'use strict';

var Buffer = require('./buffer');

module.exports = OutlineElementsBuffer;

function OutlineElementsBuffer(buffer) {
    Buffer.call(this, buffer);
}

OutlineElementsBuffer.prototype = Object.create(Buffer.prototype);

OutlineElementsBuffer.prototype.itemSize = 4; // bytes per line (2 * unsigned short == 4 bytes)
OutlineElementsBuffer.prototype.arrayType = 'ELEMENT_ARRAY_BUFFER';

OutlineElementsBuffer.prototype.add = function(a, b) {
    var pos2 = this.pos / 2;

    this.resize();

    this.ushorts[pos2 + 0] = a;
    this.ushorts[pos2 + 1] = b;

    this.pos += this.itemSize;
};

},{"./buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/buffer.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/create_bucket.js":[function(require,module,exports){
'use strict';

module.exports = createBucket;

var LineBucket = require('./line_bucket');
var FillBucket = require('./fill_bucket');
var SymbolBucket = require('./symbol_bucket');
var RasterBucket = require('./raster_bucket');
var LayoutProperties = require('../style/layout_properties');

function createBucket(layer, buffers, collision, indices) {

    if (!LayoutProperties[layer.type]) {
        //console.warn('unknown bucket type');
        return;
    }

    var layoutProperties = new LayoutProperties[layer.type](layer.layout);

    var BucketClass =
        layer.type === 'line' ? LineBucket :
        layer.type === 'fill' ? FillBucket :
        layer.type === 'symbol' ? SymbolBucket :
        layer.type === 'raster' ? RasterBucket : null;

    var bucket = new BucketClass(layoutProperties, buffers, collision, indices);
    bucket.type = layer.type;
    bucket.interactive = layer.interactive;
    bucket.minZoom = layer.minzoom;
    bucket.maxZoom = layer.maxzoom;

    return bucket;
}

},{"../style/layout_properties":"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/layout_properties.js","./fill_bucket":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/fill_bucket.js","./line_bucket":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/line_bucket.js","./raster_bucket":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/raster_bucket.js","./symbol_bucket":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/symbol_bucket.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/element_groups.js":[function(require,module,exports){
'use strict';

module.exports = ElementGroups;

function ElementGroups(vertexBuffer, elementBuffer, secondElementBuffer) {

    this.vertexBuffer = vertexBuffer;
    this.elementBuffer = elementBuffer;
    this.secondElementBuffer = secondElementBuffer;
    this.groups = [];
}

ElementGroups.prototype.makeRoomFor = function(numVertices) {
    if (!this.current || this.current.vertexLength + numVertices > 65535) {
        this.current = new ElementGroup(this.vertexBuffer.index,
                this.elementBuffer && this.elementBuffer.index,
                this.secondElementBuffer && this.secondElementBuffer.index);
        this.groups.push(this.current);
    }
};

function ElementGroup(vertexStartIndex, elementStartIndex, secondElementStartIndex)  {
    // the offset into the vertex buffer of the first vertex in this group
    this.vertexStartIndex = vertexStartIndex;
    this.elementStartIndex = elementStartIndex;
    this.secondElementStartIndex = secondElementStartIndex;
    this.elementLength = 0;
    this.vertexLength = 0;
    this.secondElementLength = 0;
}

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/feature_tree.js":[function(require,module,exports){
'use strict';

var rbush = require('rbush'),
    Point = require('point-geometry');

module.exports = FeatureTree;

function FeatureTree(getGeometry, getType) {

    this.getGeometry = getGeometry;
    this.getType = getType;

    this.rtree = rbush(9);
    this.toBeInserted = [];
}

FeatureTree.prototype.insert = function(bbox, bucket_name, feature) {
    bbox.bucket = bucket_name;
    bbox.feature = feature;
    this.toBeInserted.push(bbox);
};

// bulk insert into tree
FeatureTree.prototype._load = function() {
    this.rtree.load(this.toBeInserted);
    this.toBeInserted = [];
};

// Finds features in this tile at a particular position.
FeatureTree.prototype.query = function(args, callback) {

    if (this.toBeInserted.length) this._load();

    var radius = args.params && args.params.radius || 0;
    radius *= 4096 / args.scale;

    var x = args.x,
        y = args.y;

    var matching = this.rtree.search([ x - radius, y - radius, x + radius, y + radius ]);

    if (args.params.buckets) {
        this.queryBuckets(matching, x, y, radius, args.params, callback);
    } else {
        this.queryFeatures(matching, x, y, radius, args.params, callback);
    }
};

FeatureTree.prototype.queryFeatures = function(matching, x, y, radius, params, callback) {
    var result = [];
    for (var i = 0; i < matching.length; i++) {
        var feature = matching[i].feature;
        var type = this.getType(feature);
        var geometry = this.getGeometry(feature);


        if (params.bucket && matching[i].bucket !== params.bucket) continue;
        if (params.type && type !== params.type) continue;

        if (geometryContainsPoint(geometry, type, new Point(x, y), radius)) {
            var props = {
                _bucket: matching[i].bucket,
                _type: type
            };

            if (params.geometry) {
                props._geometry = geometry;
            }

            for (var key in feature) {
                if (feature.hasOwnProperty(key) && key[0] !== '_') {
                    props[key] = feature[key];
                }
            }
            result.push(props);
        }
    }

    callback(null, result);
};

// Lists all buckets that at the position.
FeatureTree.prototype.queryBuckets = function(matching, x, y, radius, params, callback) {
    var buckets = [];
    for (var i = 0; i < matching.length; i++) {
        if (buckets.indexOf(matching[i].bucket) >= 0) continue;

        var feature = matching[i].feature;
        var type = this.getType(feature);
        var geometry = this.getGeometry(feature);
        if (geometryContainsPoint(geometry, type, new Point(x, y), radius)) {
            buckets.push(matching[i].bucket);
        }
    }

    callback(null, buckets);
};


function geometryContainsPoint(rings, type, p, radius) {
    if (type === 'Point') {
        return pointContainsPoint(rings, p, radius);
    } else if (type === 'LineString') {
        return lineContainsPoint(rings, p, radius);
    } else if (type === 'Polygon') {
        return polyContainsPoint(rings, p) ? true : lineContainsPoint(rings, p, radius);
    } else {
        return false;
    }
}

// Code from http://stackoverflow.com/a/1501725/331379.
function distToSegmentSquared(p, v, w) {
    var l2 = v.distSqr(w);
    if (l2 === 0) return p.distSqr(v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0) return p.distSqr(v);
    if (t > 1) return p.distSqr(w);
    return p.distSqr(w.sub(v)._mult(t)._add(v));
}

function lineContainsPoint(rings, p, radius) {
    var r = radius * radius;

    for (var i = 0; i < rings.length; i++) {
        var ring = rings[i];
        for (var j = 1; j < ring.length; j++) {
            // Find line segments that have a distance <= radius^2 to p
            // In that case, we treat the line as "containing point p".
            var v = ring[j-1], w = ring[j];
            if (distToSegmentSquared(p, v, w) < r) return true;
        }
    }
    return false;
}

// point in polygon ray casting algorithm
function polyContainsPoint(rings, p) {
    var c = false,
        ring, p1, p2;

    for (var k = 0; k < rings.length; k++) {
        ring = rings[k];
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            p1 = ring[i];
            p2 = ring[j];
            if (((p1.y > p.y) != (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
                c = !c;
            }
        }
    }
    return c;
}

function pointContainsPoint(rings, p, radius) {
    var r = radius * radius;

    for (var i = 0; i < rings.length; i++) {
        var ring = rings[i];
        for (var j = 0; j < ring.length; j++) {
            if (ring[j].distSqr(p) <= r) return true;
        }
    }
    return false;
}



},{"point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js","rbush":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/rbush/rbush.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/fill_bucket.js":[function(require,module,exports){
'use strict';

var ElementGroups = require('./element_groups');

module.exports = FillBucket;

function FillBucket(layoutProperties, buffers, placement, elementGroups) {
    this.layoutProperties = layoutProperties;
    this.buffers = buffers;
    this.elementGroups = elementGroups || new ElementGroups(buffers.fillVertex, buffers.fillElement, buffers.outlineElement);
}

FillBucket.prototype.addFeatures = function() {
    var features = this.features;
    for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        this.addFeature(feature.loadGeometry());
    }
};

FillBucket.prototype.addFeature = function(lines) {
    for (var i = 0; i < lines.length; i++) {
        this.addFill(lines[i]);
    }
};

FillBucket.prototype.addFill = function(vertices) {
    if (vertices.length < 3) {
        //console.warn('a fill must have at least three vertices');
        return;
    }

    // Calculate the total number of vertices we're going to produce so that we
    // can resize the buffer beforehand, or detect whether the current line
    // won't fit into the buffer anymore.
    // In order to be able to use the vertex buffer for drawing the antialiased
    // outlines, we separate all polygon vertices with a degenerate (out-of-
    // viewplane) vertex.

    var len = vertices.length;

    // Check whether this geometry buffer can hold all the required vertices.
    this.elementGroups.makeRoomFor(len + 1);
    var elementGroup = this.elementGroups.current;

    var fillVertex = this.buffers.fillVertex;
    var fillElement = this.buffers.fillElement;
    var outlineElement = this.buffers.outlineElement;

    // Start all lines with a degenerate vertex
    elementGroup.vertexLength++;

    // We're generating triangle fans, so we always start with the first coordinate in this polygon.
    var firstIndex = fillVertex.index - elementGroup.vertexStartIndex,
        prevIndex, currentIndex, currentVertex;

    for (var i = 0; i < vertices.length; i++) {
        currentIndex = fillVertex.index - elementGroup.vertexStartIndex;
        currentVertex = vertices[i];

        fillVertex.add(currentVertex.x, currentVertex.y);
        elementGroup.vertexLength++;

        // Only add triangles that have distinct vertices.
        if (i >= 2 && (currentVertex.x !== vertices[0].x || currentVertex.y !== vertices[0].y)) {
            fillElement.add(firstIndex, prevIndex, currentIndex);
            elementGroup.elementLength++;
        }

        if (i >= 1) {
            outlineElement.add(prevIndex, currentIndex);
            elementGroup.secondElementLength++;
        }

        prevIndex = currentIndex;
    }
};

FillBucket.prototype.hasData = function() {
    return !!this.elementGroups.current;
};

},{"./element_groups":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/element_groups.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/line_bucket.js":[function(require,module,exports){
'use strict';

var ElementGroups = require('./element_groups');

module.exports = LineBucket;

function LineBucket(layoutProperties, buffers, placement, elementGroups) {
    this.layoutProperties = layoutProperties;
    this.buffers = buffers;
    this.elementGroups = elementGroups || new ElementGroups(buffers.lineVertex, buffers.lineElement);
}

LineBucket.prototype.addFeatures = function() {
    var features = this.features;
    for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        this.addFeature(feature.loadGeometry());
    }
};

LineBucket.prototype.addFeature = function(lines) {
    var layoutProperties = this.layoutProperties;
    for (var i = 0; i < lines.length; i++) {
        this.addLine(lines[i],
            layoutProperties['line-join'],
            layoutProperties['line-cap'],
            layoutProperties['line-miter-limit'],
            layoutProperties['line-round-limit']);
    }
};

LineBucket.prototype.addLine = function(vertices, join, cap, miterLimit, roundLimit) {
    if (vertices.length < 2) {
        //console.warn('a line must have at least two vertices');
        return;
    }

    if (join === 'bevel') miterLimit = 1.05;

    var len = vertices.length,
        firstVertex = vertices[0],
        lastVertex = vertices[len - 1],
        closed = firstVertex.equals(lastVertex);

    var lineVertex = this.buffers.lineVertex;
    var lineElement = this.buffers.lineElement;

    // we could be more precies, but it would only save a negligible amount of space
    this.elementGroups.makeRoomFor(len * 4);
    var elementGroup = this.elementGroups.current;
    var vertexStartIndex = elementGroup.vertexStartIndex;

    if (len == 2 && closed) {
        // console.warn('a line may not have coincident points');
        return;
    }

    var beginCap = cap,
        endCap = closed ? 'butt' : cap,
        flip = 1,
        distance = 0,
        currentVertex, prevVertex,  nextVertex, prevNormal,  nextNormal;

    // the last three vertices added
    var e1, e2, e3;

    if (closed) {
        currentVertex = vertices[len - 2];
        nextNormal = firstVertex.sub(currentVertex)._unit()._perp();
    }

    for (var i = 0; i < len; i++) {

        nextVertex = closed && i === len - 1 ?
            vertices[1] : // if the line is closed, we treat the last vertex like the first
            vertices[i + 1]; // just the next vertex

        // if two consecutive vertices exist, skip the current one
        if (nextVertex && vertices[i].equals(nextVertex)) continue;

        if (nextNormal) prevNormal = nextNormal;
        if (currentVertex) prevVertex = currentVertex;

        currentVertex = vertices[i];

        // Calculate how far along the line the currentVertex is
        if (prevVertex) distance += currentVertex.dist(prevVertex);

        // Calculate the normal towards the next vertex in this line. In case
        // there is no next vertex, pretend that the line is continuing straight,
        // meaning that we are just using the previous normal.
        nextNormal = nextVertex ? nextVertex.sub(currentVertex)._unit()._perp() : prevNormal;

        // If we still don't have a previous normal, this is the beginning of a
        // non-closed line, so we're doing a straight "join".
        prevNormal = prevNormal || nextNormal;

        // Determine the normal of the join extrusion. It is the angle bisector
        // of the segments between the previous line and the next line.
        var joinNormal = prevNormal.add(nextNormal)._unit();

        /*  joinNormal     prevNormal
         *             ↖      ↑
         *                .________. prevVertex
         *                |
         * nextNormal  ←  |  currentVertex
         *                |
         *     nextVertex !
         *
         */

        // Calculate the length of the miter (the ratio of the miter to the width).
        // Find the cosine of the angle between the next and join normals
        // using dot product. The inverse of that is the miter length.
        var cosHalfAngle = joinNormal.x * nextNormal.x + joinNormal.y * nextNormal.y;
        var miterLength = 1 / cosHalfAngle;

        // Whether any vertices have been
        var startOfLine = e1 === undefined || e2 === undefined;

        // The join if a middle vertex, otherwise the cap.
        var middleVertex = prevVertex && nextVertex;
        var currentJoin = middleVertex ? join : nextVertex ? beginCap : endCap;

        if (middleVertex && currentJoin === 'round' && miterLength < roundLimit) {
            currentJoin = 'miter';
        }

        if (currentJoin === 'miter' && miterLength > miterLimit) {
            currentJoin = 'bevel';
        }

        if (currentJoin === 'bevel') {
            // The maximum extrude length is 63 / 256 = 4 times the width of the line
            // so if miterLength >= 4 we need to draw a different type of bevel where.
            if (miterLength > 4) currentJoin = 'flipbevel';

            // If the miterLength is really small and the line bevel wouldn't be visible,
            // just draw a miter join to save a triangle.
            if (miterLength < miterLimit) currentJoin = 'miter';
        }

        // Mitered joins
        if (currentJoin === 'miter') {
            // scale the unit vector by the miter length
            joinNormal._mult(miterLength);
            addCurrentVertex(joinNormal, 0, 0, false);

        } else if (currentJoin === 'flipbevel') {
            // miter is too big, flip the direction to make a beveled join

            if (miterLength > 100) {
                // Almost parallel lines
                flip = -flip;
                joinNormal = nextNormal;

            } else {
                var bevelLength = miterLength * prevNormal.add(nextNormal).mag() / prevNormal.sub(nextNormal).mag();
                joinNormal._perp()._mult(flip * bevelLength);
                flip = -flip;
            }
            addCurrentVertex(joinNormal, 0, 0, false);

        // All other types of joins
        } else {

            var offsetA, offsetB;
            if (currentJoin === 'bevel') {
                var dir = prevNormal.x * nextNormal.y - prevNormal.y * nextNormal.x;
                var offset = -Math.sqrt(miterLength * miterLength - 1);
                if (flip * dir > 0) {
                    offsetB = 0;
                    offsetA = offset;
                } else {
                    offsetA = 0;
                    offsetB = offset;
                }
            } else if (currentJoin === 'square') {
                offsetA = offsetB = 1;
            } else {
                offsetA = offsetB = 0;
            }

            // Close previous segment with a butt or a square cap or bevel
            if (!startOfLine) {
                addCurrentVertex(prevNormal, offsetA, offsetB, false);
            }

            // Add round cap or linejoin at end of segment
            if (!startOfLine && currentJoin === 'round') {
                addCurrentVertex(prevNormal, 1, 1, true);
            }

            // Segment include cap are done, unset vertices to disconnect segments.
            // Or leave them to create a bevel.
            if (startOfLine || currentJoin !== 'bevel') {
                e1 = e2 = -1;
                flip = 1;
            }

            // Add round cap before first segment
            if (startOfLine && beginCap === 'round') {
                addCurrentVertex(nextNormal, -1, -1, true);
            }

            // Start next segment with a butt or square cap or bevel
            if (nextVertex) {
                addCurrentVertex(nextNormal, -offsetA, -offsetB, false);
            }
        }

    }


    /*
     * Adds two vertices to the buffer that are
     * normal and -normal from the currentVertex.
     *
     * endBox moves the extrude one unit in the direction of the line
     * to create square or round cap.
     *
     * endLeft and endRight shifts the extrude along the line
     * endLeft === 1 moves the extrude in the direction of the line
     * endLeft === -1 moves the extrude in the reverse direction
     */
    function addCurrentVertex(normal, endLeft, endRight, round) {

        var tx = round ? 1 : 0;
        var extrude;

        extrude = normal.mult(flip);
        if (endLeft) extrude._sub(normal.perp()._mult(endLeft));
        e3 = lineVertex.add(currentVertex, extrude, tx, 0, distance) - vertexStartIndex;
        if (e1 >= 0 && e2 >= 0) {
            lineElement.add(e1, e2, e3);
            elementGroup.elementLength++;
        }
        e1 = e2;
        e2 = e3;

        extrude = normal.mult(-flip);
        if (endRight) extrude._sub(normal.perp()._mult(endRight));
        e3 = lineVertex.add(currentVertex, extrude, tx, 1, distance) - vertexStartIndex;
        if (e1 >= 0 && e2 >= 0) {
            lineElement.add(e1, e2, e3);
            elementGroup.elementLength++;
        }
        e1 = e2;
        e2 = e3;

        elementGroup.vertexLength += 2;
    }
};

LineBucket.prototype.hasData = function() {
    return !!this.elementGroups.current;
};

},{"./element_groups":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/element_groups.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/raster_bucket.js":[function(require,module,exports){
'use strict';

module.exports = RasterBucket;

function RasterBucket(layoutProperties) {
    this.layoutProperties = layoutProperties;
}

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/symbol_bucket.js":[function(require,module,exports){
'use strict';

var ElementGroups = require('./element_groups');
var Anchor = require('../symbol/anchor');
var interpolate = require('../symbol/interpolate');
var Point = require('point-geometry');
var resolveTokens = require('../util/token');
var Placement = require('../symbol/placement');
var Shaping = require('../symbol/shaping');
var resolveText = require('../symbol/resolve_text');

module.exports = SymbolBucket;

var fullRange = [2 * Math.PI , 0];

function SymbolBucket(layoutProperties, buffers, collision, elementGroups) {
    this.layoutProperties = layoutProperties;
    this.buffers = buffers;
    this.collision = collision;

    if (layoutProperties['symbol-placement'] === 'line') {
        if (!layoutProperties.hasOwnProperty('text-rotation-alignment')) {
            layoutProperties['text-rotation-alignment'] = 'map';
        }
        if (!layoutProperties.hasOwnProperty('icon-rotation-alignment')) {
            layoutProperties['icon-rotation-alignment'] = 'map';
        }

        layoutProperties['symbol-avoid-edges'] = true;
    }

    if (elementGroups) {
        this.elementGroups = elementGroups;
    } else {
        this.elementGroups = {
            text: new ElementGroups(buffers.glyphVertex),
            icon: new ElementGroups(buffers.iconVertex)
        };
    }
}

SymbolBucket.prototype.addFeatures = function() {
    var layoutProperties = this.layoutProperties;
    var features = this.features;
    var textFeatures = this.textFeatures;

    var horizontalAlign = 0.5,
        verticalAlign = 0.5;

    switch (layoutProperties['text-anchor']) {
        case 'right':
        case 'top-right':
        case 'bottom-right':
            horizontalAlign = 1;
            break;
        case 'left':
        case 'top-left':
        case 'bottom-left':
            horizontalAlign = 0;
            break;
    }

    switch (layoutProperties['text-anchor']) {
        case 'bottom':
        case 'bottom-right':
        case 'bottom-left':
            verticalAlign = 1;
            break;
        case 'top':
        case 'top-right':
        case 'top-left':
            verticalAlign = 0;
            break;
    }

    var justify = 0.5;
    if (layoutProperties['text-justify'] === 'right') justify = 1;
    else if (layoutProperties['text-justify'] === 'left') justify = 0;

    var oneEm = 24;
    var lineHeight = layoutProperties['text-line-height'] * oneEm;
    var maxWidth = layoutProperties['symbol-placement'] !== 'line' && layoutProperties['text-max-width'] * oneEm;
    var spacing = layoutProperties['text-letter-spacing'] * oneEm;
    var fontstack = layoutProperties['text-font'];
    var textOffset = [layoutProperties['text-offset'][0] * oneEm, layoutProperties['text-offset'][1] * oneEm];

    for (var k = 0; k < features.length; k++) {

        var feature = features[k];
        var text = textFeatures[k];
        var lines = feature.loadGeometry();

        var shaping = false;
        if (text) {
            shaping = Shaping.shape(text, fontstack, this.stacks, maxWidth,
                    lineHeight, horizontalAlign, verticalAlign, justify, spacing, textOffset);
        }

        var image = false;
        if (this.sprite && layoutProperties['icon-image']) {
            image = this.sprite[resolveTokens(feature.properties, layoutProperties['icon-image'])];

            if (image) {
                // match glyph tex object. TODO change
                image.w = image.width;
                image.h = image.height;

                if (image.sdf) this.elementGroups.sdfIcons = true;
            }
        }

        if (!shaping && !image) continue;
        this.addFeature(lines, this.stacks, shaping, image);
    }
};

function byScale(a, b) {
    return a.scale - b.scale;
}

SymbolBucket.prototype.addFeature = function(lines, faces, shaping, image) {
    var layoutProperties = this.layoutProperties;
    var collision = this.collision;

    var minScale = 0.5;
    var glyphSize = 24;

    var horizontalText = layoutProperties['text-rotation-alignment'] === 'viewport',
        horizontalIcon = layoutProperties['icon-rotation-alignment'] === 'viewport',
        fontScale = layoutProperties['text-max-size'] / glyphSize,
        textBoxScale = collision.tilePixelRatio * fontScale,
        iconBoxScale = collision.tilePixelRatio * layoutProperties['icon-max-size'],
        iconWithoutText = layoutProperties['text-optional'] || !shaping,
        textWithoutIcon = layoutProperties['icon-optional'] || !image,
        avoidEdges = layoutProperties['symbol-avoid-edges'];

    for (var i = 0; i < lines.length; i++) {

        var line = lines[i];
        var anchors;

        if (layoutProperties['symbol-placement'] === 'line') {
            // Line labels
            anchors = interpolate(line, layoutProperties['symbol-min-distance'], minScale, collision.maxPlacementScale, collision.tilePixelRatio);

            // Sort anchors by segment so that we can start placement with the
            // anchors that can be shown at the lowest zoom levels.
            anchors.sort(byScale);

        } else {
            // Point labels
            anchors = [new Anchor(line[0].x, line[0].y, 0, minScale)];
        }


        // TODO: figure out correct ascender height.
        var origin = new Point(0, -17);

        for (var j = 0, len = anchors.length; j < len; j++) {
            var anchor = anchors[j];
            var inside = !(anchor.x < 0 || anchor.x > 4096 || anchor.y < 0 || anchor.y > 4096);

            if (avoidEdges && !inside) continue;

            // Calculate the scales at which the text and icons can be first shown without overlap
            var glyph;
            var icon;
            var glyphScale = null;
            var iconScale = null;

            if (shaping) {
                glyph = Placement.getGlyphs(anchor, origin, shaping, faces, textBoxScale, horizontalText, line, layoutProperties);
                glyphScale = layoutProperties['text-allow-overlap'] ? glyph.minScale
                    : collision.getPlacementScale(glyph.boxes, glyph.minScale, avoidEdges);
                if (!glyphScale && !iconWithoutText) continue;
            }

            if (image) {
                icon = Placement.getIcon(anchor, image, iconBoxScale, line, layoutProperties);
                iconScale = layoutProperties['icon-allow-overlap'] ? icon.minScale
                    : collision.getPlacementScale(icon.boxes, icon.minScale, avoidEdges);
                if (!iconScale && !textWithoutIcon) continue;
            }

            if (!iconWithoutText && !textWithoutIcon) {
                iconScale = glyphScale = Math.max(iconScale, glyphScale);
            } else if (!textWithoutIcon && glyphScale) {
                glyphScale = Math.max(iconScale, glyphScale);
            } else if (!iconWithoutText && iconScale) {
                iconScale = Math.max(iconScale, glyphScale);
            }

            // Get the rotation ranges it is safe to show the glyphs
            var glyphRange = (!glyphScale || layoutProperties['text-allow-overlap']) ? fullRange
                : collision.getPlacementRange(glyph.boxes, glyphScale, horizontalText);
            var iconRange = (!iconScale || layoutProperties['icon-allow-overlap']) ? fullRange
                : collision.getPlacementRange(icon.boxes, iconScale, horizontalIcon);

            var maxRange = [
                Math.min(iconRange[0], glyphRange[0]),
                Math.max(iconRange[1], glyphRange[1])];

            if (!iconWithoutText && !textWithoutIcon) {
                iconRange = glyphRange = maxRange;
            } else if (!textWithoutIcon) {
                glyphRange = maxRange;
            } else if (!iconWithoutText) {
                iconRange = maxRange;
            }

            // Insert final placement into collision tree and add glyphs/icons to buffers
            if (glyphScale) {
                if (!layoutProperties['text-ignore-placement']) {
                    collision.insert(glyph.boxes, anchor, glyphScale, glyphRange, horizontalText);
                }
                if (inside) this.addSymbols(this.buffers.glyphVertex, this.elementGroups.text, glyph.shapes, glyphScale, glyphRange);
            }

            if (iconScale) {
                if (!layoutProperties['icon-ignore-placement']) {
                    collision.insert(icon.boxes, anchor, iconScale, iconRange, horizontalIcon);
                }
                if (inside) this.addSymbols(this.buffers.iconVertex, this.elementGroups.icon, icon.shapes, iconScale, iconRange);
            }

        }
    }
};

SymbolBucket.prototype.addSymbols = function(buffer, elementGroups, symbols, scale, placementRange) {

    var zoom = this.collision.zoom;

    elementGroups.makeRoomFor(0);
    var elementGroup = elementGroups.current;

    var placementZoom = Math.log(scale) / Math.LN2 + zoom;

    for (var k = 0; k < symbols.length; k++) {

        var symbol = symbols[k],
            tl = symbol.tl,
            tr = symbol.tr,
            bl = symbol.bl,
            br = symbol.br,
            tex = symbol.tex,
            angle = symbol.angle,
            anchor = symbol.anchor,


            minZoom = Math.max(zoom + Math.log(symbol.minScale) / Math.LN2, placementZoom),
            maxZoom = Math.min(zoom + Math.log(symbol.maxScale) / Math.LN2, 25);

        if (maxZoom <= minZoom) continue;

        // Lower min zoom so that while fading out the label it can be shown outside of collision-free zoom levels
        if (minZoom === placementZoom) minZoom = 0;

        // first triangle
        buffer.add(anchor.x, anchor.y, tl.x, tl.y, tex.x, tex.y, angle, minZoom, placementRange, maxZoom, placementZoom);
        buffer.add(anchor.x, anchor.y, tr.x, tr.y, tex.x + tex.w, tex.y, angle, minZoom, placementRange, maxZoom, placementZoom);
        buffer.add(anchor.x, anchor.y, bl.x, bl.y, tex.x, tex.y + tex.h, angle, minZoom, placementRange, maxZoom, placementZoom);

        // second triangle
        buffer.add(anchor.x, anchor.y, tr.x, tr.y, tex.x + tex.w, tex.y, angle, minZoom, placementRange, maxZoom, placementZoom);
        buffer.add(anchor.x, anchor.y, bl.x, bl.y, tex.x, tex.y + tex.h, angle, minZoom, placementRange, maxZoom, placementZoom);
        buffer.add(anchor.x, anchor.y, br.x, br.y, tex.x + tex.w, tex.y + tex.h, angle, minZoom, placementRange, maxZoom, placementZoom);

        elementGroup.vertexLength += 6;
    }

};

SymbolBucket.prototype.getDependencies = function(tile, actor, callback) {
    var firstdone = false;
    var firsterr;
    this.getTextDependencies(tile, actor, done);
    this.getIconDependencies(tile, actor, done);
    function done(err) {
        if (err || firstdone) callback(err);
        firstdone = true;
        firsterr = err;
    }
};

SymbolBucket.prototype.getIconDependencies = function(tile, actor, callback) {
    if (this.layoutProperties['icon-image']) {
        if (SymbolBucket.sprite) {
            this.sprite = SymbolBucket.sprite;
            callback();
        } else {
            actor.send('get sprite json', {}, function(err, data) {
                SymbolBucket.sprite = this.sprite = data.sprite;
                callback(err);
            }.bind(this));
        }
    } else {
        callback();
    }
};

SymbolBucket.prototype.getTextDependencies = function(tile, actor, callback) {
    var features = this.features;
    var layoutProperties = this.layoutProperties;

    if (tile.stacks === undefined) tile.stacks = {};
    var stacks = this.stacks = tile.stacks;
    var fontstack = layoutProperties['text-font'];
    if (stacks[fontstack] === undefined) {
        stacks[fontstack] = { glyphs: {}, rects: {} };
    }
    var stack = stacks[fontstack];

    var data = resolveText(features, layoutProperties, stack.glyphs);
    this.textFeatures = data.textFeatures;

    actor.send('get glyphs', {
        id: tile.id,
        fontstack: fontstack,
        codepoints: data.codepoints
    }, function(err, newstack) {
        if (err) return callback(err);

        var newglyphs = newstack.glyphs;
        var newrects = newstack.rects;
        var glyphs = stack.glyphs;
        var rects = stack.rects;

        for (var codepoint in newglyphs) {
            glyphs[codepoint] = newglyphs[codepoint];
            rects[codepoint] = newrects[codepoint];
        }

        callback();
    });
};

SymbolBucket.prototype.hasData = function() {
    return !!this.elementGroups.text.current || !!this.elementGroups.icon.current;
};

},{"../symbol/anchor":"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/anchor.js","../symbol/interpolate":"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/interpolate.js","../symbol/placement":"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/placement.js","../symbol/resolve_text":"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/resolve_text.js","../symbol/shaping":"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/shaping.js","../util/token":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/token.js","./element_groups":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/element_groups.js","point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/lat_lng.js":[function(require,module,exports){
'use strict';

module.exports = LatLng;

var wrap = require('../util/util').wrap;

function LatLng(lat, lng) {
    if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
    }
    this.lat = +lat;
    this.lng = +lng;
}

LatLng.prototype.wrap = function () {
    return new LatLng(this.lat, wrap(this.lng, -180, 180));
};

// constructs LatLng from an array if necessary

LatLng.convert = function (a) {
    if (a instanceof LatLng) {
        return a;
    }
    if (Array.isArray(a)) {
        return new LatLng(a[0], a[1]);
    }
    return a;
};

},{"../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/lat_lng_bounds.js":[function(require,module,exports){
'use strict';

module.exports = LatLngBounds;

var LatLng = require('./lat_lng');

function LatLngBounds(sw, ne) {
    if (!sw) return;

    var latlngs = ne ? [sw, ne] : sw;

    for (var i = 0, len = latlngs.length; i < len; i++) {
        this.extend(latlngs[i]);
    }
}

LatLngBounds.prototype = {

    // extend the bounds to contain the given point or bounds
    extend: function (obj) {
        var sw = this._sw,
            ne = this._ne,
            sw2, ne2;

        if (obj instanceof LatLng) {
            sw2 = obj;
            ne2 = obj;

        } else if (obj instanceof LatLngBounds) {
            sw2 = obj._sw;
            ne2 = obj._ne;

            if (!sw2 || !ne2) return this;

        } else {
            return obj ? this.extend(LatLng.convert(obj) || LatLngBounds.convert(obj)) : this;
        }

        if (!sw && !ne) {
            this._sw = new LatLng(sw2.lat, sw2.lng);
            this._ne = new LatLng(ne2.lat, ne2.lng);

        } else {
            sw.lat = Math.min(sw2.lat, sw.lat);
            sw.lng = Math.min(sw2.lng, sw.lng);
            ne.lat = Math.max(ne2.lat, ne.lat);
            ne.lng = Math.max(ne2.lng, ne.lng);
        }

        return this;
    },

    getCenter: function () {
        return new LatLng((this._sw.lat + this._ne.lat) / 2, (this._sw.lng + this._ne.lng) / 2);
    },

    getSouthWest: function () { return this._sw; },
    getNorthEast: function () { return this._ne; },
    getNorthWest: function () { return new LatLng(this.getNorth(), this.getWest()); },
    getSouthEast: function () { return new LatLng(this.getSouth(), this.getEast()); },

    getWest:  function () { return this._sw.lng; },
    getSouth: function () { return this._sw.lat; },
    getEast:  function () { return this._ne.lng; },
    getNorth: function () { return this._ne.lat; }
};

// constructs LatLngBounds from an array if necessary
LatLngBounds.convert = function (a) {
    if (!a || a instanceof LatLngBounds) return a;
    return new LatLngBounds(a);
};

},{"./lat_lng":"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/lat_lng.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/transform.js":[function(require,module,exports){
'use strict';

var LatLng = require('./lat_lng'),
    Point = require('point-geometry'),
    wrap = require('../util/util').wrap;

module.exports = Transform;

// A single transform, generally used for a single tile to be scaled, rotated, and zoomed.

function Transform(minZoom, maxZoom) {
    this.tileSize = 512; // constant

    this._minZoom = minZoom || 0;
    this._maxZoom = maxZoom || 22;

    this.latRange = [-85.05113, 85.05113];

    this.width = 0;
    this.height = 0;
    this.zoom = 0;
    this.center = new LatLng(0, 0);
    this.angle = 0;
}

Transform.prototype = {
    get minZoom() { return this._minZoom; },
    set minZoom(zoom) {
        this._minZoom = zoom;
        this.zoom = Math.max(this.zoom, zoom);
    },

    get maxZoom() { return this._maxZoom; },
    set maxZoom(zoom) {
        this._maxZoom = zoom;
        this.zoom = Math.min(this.zoom, zoom);
    },

    get worldSize() {
        return this.tileSize * this.scale;
    },

    get centerPoint() {
        return this.size._div(2);
    },

    get size() {
        return new Point(this.width, this.height);
    },

    get bearing() {
        return -this.angle / Math.PI * 180;
    },
    set bearing(bearing) {
        this.angle = -wrap(bearing, -180, 180) * Math.PI / 180;
    },

    get zoom() { return this._zoom; },
    set zoom(zoom) {
        zoom = Math.min(Math.max(zoom, this.minZoom), this.maxZoom);
        this._zoom = zoom;
        this.scale = this.zoomScale(zoom);
        this.tileZoom = Math.floor(zoom);
        this.zoomFraction = zoom - this.tileZoom;
        this._constrain();
    },

    zoomScale: function(zoom) { return Math.pow(2, zoom); },
    scaleZoom: function(scale) { return Math.log(scale) / Math.LN2; },

    project: function(latlng, worldSize) {
        return new Point(
            this.lngX(latlng.lng, worldSize),
            this.latY(latlng.lat, worldSize));
    },

    unproject: function(point, worldSize) {
        return new LatLng(
            this.yLat(point.y, worldSize),
            this.xLng(point.x, worldSize));
    },

    get x() { return this.lngX(this.center.lng); },
    get y() { return this.latY(this.center.lat); },

    get point() { return new Point(this.x, this.y); },

    // lat/lon <-> absolute pixel coords convertion
    lngX: function(lon, worldSize) {
        return (180 + lon) * (worldSize || this.worldSize) / 360;
    },
    // latitude to absolute y coord
    latY: function(lat, worldSize) {
        var y = 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
        return (180 - y) * (worldSize || this.worldSize) / 360;
    },

    xLng: function(x, worldSize) {
        return x * 360 / (worldSize || this.worldSize) - 180;
    },
    yLat: function(y, worldSize) {
        var y2 = 180 - y * 360 / (worldSize || this.worldSize);
        return 360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90;
    },

    panBy: function(offset) {
        var point = this.centerPoint._add(offset);
        this.center = this.pointLocation(point);
        this._constrain();
    },

    setZoomAround: function(zoom, center) {
        var p = this.locationPoint(center),
            p1 = this.size._sub(p),
            latlng = this.pointLocation(p1);
        this.zoom = zoom;
        this.panBy(p1.sub(this.locationPoint(latlng)));
    },

    setBearingAround: function(bearing, center) {
        var offset = this.locationPoint(center).sub(this.centerPoint);
        this.panBy(offset);
        this.bearing = bearing;
        this.panBy(offset.mult(-1));
    },

    locationPoint: function(latlng) {
        var p = this.project(latlng);
        return this.centerPoint._sub(this.point._sub(p)._rotate(this.angle));
    },

    pointLocation: function(p) {
        var p2 = this.centerPoint._sub(p)._rotate(-this.angle);
        return this.unproject(this.point.sub(p2));
    },

    locationCoordinate: function(latlng) {
        var k = this.zoomScale(this.tileZoom) / this.worldSize;
        return {
            column: this.lngX(latlng.lng) * k,
            row: this.latY(latlng.lat) * k,
            zoom: this.tileZoom
        };
    },

    pointCoordinate: function(tileCenter, p) {
        var zoomFactor = this.zoomScale(this.zoomFraction),
            kt = this.zoomScale(this.tileZoom - tileCenter.zoom),
            p2 = this.centerPoint._sub(p)._rotate(-this.angle)._div(this.tileSize * zoomFactor);

        return {
            column: tileCenter.column * kt - p2.x,
            row: tileCenter.row * kt - p2.y,
            zoom: this.tileZoom
        };
    },

    _constrain: function() {
        if (!this.center) return;

        var minY, maxY, minX, maxX, sy, sx, x2, y2,
            size = this.size;

        if (this.latRange) {
            minY = this.latY(this.latRange[1]);
            maxY = this.latY(this.latRange[0]);
            sy = maxY - minY < size.y ? size.y / (maxY - minY) : 0;
        }

        if (this.lngRange) {
            minX = this.lngX(this.lngRange[0]);
            maxX = this.lngX(this.lngRange[1]);
            sx = maxX - minX < size.x ? size.x / (maxX - minX) : 0;
        }

        // how much the map should scale to fit the screen into given latitude/longitude ranges
        var s = Math.max(sx || 0, sy || 0);

        if (s) {
            this.center = this.unproject(new Point(
                sx ? (maxX + minX) / 2 : this.x,
                sy ? (maxY + minY) / 2 : this.y));
            this.zoom += this.scaleZoom(s);
            return;
        }

        if (this.latRange) {
            var y = this.y,
                h2 = size.y / 2;

            if (y - h2 < minY) y2 = minY + h2;
            if (y + h2 > maxY) y2 = maxY - h2;
        }

        if (this.lngRange) {
            var x = this.x,
                w2 = size.x / 2;

            if (x - w2 < minX) x2 = minX + w2;
            if (x + w2 > maxX) x2 = maxX - w2;
        }

        // pan the map if the screen goes off the range
        if (x2 !== undefined || y2 !== undefined) {
            this.center = this.unproject(new Point(
                x2 !== undefined ? x2 : this.x,
                y2 !== undefined ? y2 : this.y));
        }
    }
};

},{"../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","./lat_lng":"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/lat_lng.js","point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/lib/debugtext.js":[function(require,module,exports){
// Font data From Hershey Simplex Font
// http://paulbourke.net/dataformats/hershey/
var simplex_font = {
    " ": [16, []],
    "!": [10, [5, 21, 5, 7, -1, -1, 5, 2, 4, 1, 5, 0, 6, 1, 5, 2]],
    "\"": [16, [4, 21, 4, 14, -1, -1, 12, 21, 12, 14]],
    "#": [21, [11, 25, 4, -7, -1, -1, 17, 25, 10, -7, -1, -1, 4, 12, 18, 12, -1, -1, 3, 6, 17, 6]],
    "$": [20, [8, 25, 8, -4, -1, -1, 12, 25, 12, -4, -1, -1, 17, 18, 15, 20, 12, 21, 8, 21, 5, 20, 3, 18, 3, 16, 4, 14, 5, 13, 7, 12, 13, 10, 15, 9, 16, 8, 17, 6, 17, 3, 15, 1, 12, 0, 8, 0, 5, 1, 3, 3]],
    "%": [24, [21, 21, 3, 0, -1, -1, 8, 21, 10, 19, 10, 17, 9, 15, 7, 14, 5, 14, 3, 16, 3, 18, 4, 20, 6, 21, 8, 21, 10, 20, 13, 19, 16, 19, 19, 20, 21, 21, -1, -1, 17, 7, 15, 6, 14, 4, 14, 2, 16, 0, 18, 0, 20, 1, 21, 3, 21, 5, 19, 7, 17, 7]],
    "&": [26, [23, 12, 23, 13, 22, 14, 21, 14, 20, 13, 19, 11, 17, 6, 15, 3, 13, 1, 11, 0, 7, 0, 5, 1, 4, 2, 3, 4, 3, 6, 4, 8, 5, 9, 12, 13, 13, 14, 14, 16, 14, 18, 13, 20, 11, 21, 9, 20, 8, 18, 8, 16, 9, 13, 11, 10, 16, 3, 18, 1, 20, 0, 22, 0, 23, 1, 23, 2]],
    "'": [10, [5, 19, 4, 20, 5, 21, 6, 20, 6, 18, 5, 16, 4, 15]],
    "(": [14, [11, 25, 9, 23, 7, 20, 5, 16, 4, 11, 4, 7, 5, 2, 7, -2, 9, -5, 11, -7]],
    ")": [14, [3, 25, 5, 23, 7, 20, 9, 16, 10, 11, 10, 7, 9, 2, 7, -2, 5, -5, 3, -7]],
    "*": [16, [8, 21, 8, 9, -1, -1, 3, 18, 13, 12, -1, -1, 13, 18, 3, 12]],
    "+": [26, [13, 18, 13, 0, -1, -1, 4, 9, 22, 9]],
    ",": [10, [6, 1, 5, 0, 4, 1, 5, 2, 6, 1, 6, -1, 5, -3, 4, -4]],
    "-": [26, [4, 9, 22, 9]],
    ".": [10, [5, 2, 4, 1, 5, 0, 6, 1, 5, 2]],
    "/": [22, [20, 25, 2, -7]],
    "0": [20, [9, 21, 6, 20, 4, 17, 3, 12, 3, 9, 4, 4, 6, 1, 9, 0, 11, 0, 14, 1, 16, 4, 17, 9, 17, 12, 16, 17, 14, 20, 11, 21, 9, 21]],
    "1": [20, [6, 17, 8, 18, 11, 21, 11, 0]],
    "2": [20, [4, 16, 4, 17, 5, 19, 6, 20, 8, 21, 12, 21, 14, 20, 15, 19, 16, 17, 16, 15, 15, 13, 13, 10, 3, 0, 17, 0]],
    "3": [20, [5, 21, 16, 21, 10, 13, 13, 13, 15, 12, 16, 11, 17, 8, 17, 6, 16, 3, 14, 1, 11, 0, 8, 0, 5, 1, 4, 2, 3, 4]],
    "4": [20, [13, 21, 3, 7, 18, 7, -1, -1, 13, 21, 13, 0]],
    "5": [20, [15, 21, 5, 21, 4, 12, 5, 13, 8, 14, 11, 14, 14, 13, 16, 11, 17, 8, 17, 6, 16, 3, 14, 1, 11, 0, 8, 0, 5, 1, 4, 2, 3, 4]],
    "6": [20, [16, 18, 15, 20, 12, 21, 10, 21, 7, 20, 5, 17, 4, 12, 4, 7, 5, 3, 7, 1, 10, 0, 11, 0, 14, 1, 16, 3, 17, 6, 17, 7, 16, 10, 14, 12, 11, 13, 10, 13, 7, 12, 5, 10, 4, 7]],
    "7": [20, [17, 21, 7, 0, -1, -1, 3, 21, 17, 21]],
    "8": [20, [8, 21, 5, 20, 4, 18, 4, 16, 5, 14, 7, 13, 11, 12, 14, 11, 16, 9, 17, 7, 17, 4, 16, 2, 15, 1, 12, 0, 8, 0, 5, 1, 4, 2, 3, 4, 3, 7, 4, 9, 6, 11, 9, 12, 13, 13, 15, 14, 16, 16, 16, 18, 15, 20, 12, 21, 8, 21]],
    "9": [20, [16, 14, 15, 11, 13, 9, 10, 8, 9, 8, 6, 9, 4, 11, 3, 14, 3, 15, 4, 18, 6, 20, 9, 21, 10, 21, 13, 20, 15, 18, 16, 14, 16, 9, 15, 4, 13, 1, 10, 0, 8, 0, 5, 1, 4, 3]],
    ":": [10, [5, 14, 4, 13, 5, 12, 6, 13, 5, 14, -1, -1, 5, 2, 4, 1, 5, 0, 6, 1, 5, 2]],
    ";": [10, [5, 14, 4, 13, 5, 12, 6, 13, 5, 14, -1, -1, 6, 1, 5, 0, 4, 1, 5, 2, 6, 1, 6, -1, 5, -3, 4, -4]],
    "<": [24, [20, 18, 4, 9, 20, 0]],
    "=": [26, [4, 12, 22, 12, -1, -1, 4, 6, 22, 6]],
    ">": [24, [4, 18, 20, 9, 4, 0]],
    "?": [18, [3, 16, 3, 17, 4, 19, 5, 20, 7, 21, 11, 21, 13, 20, 14, 19, 15, 17, 15, 15, 14, 13, 13, 12, 9, 10, 9, 7, -1, -1, 9, 2, 8, 1, 9, 0, 10, 1, 9, 2]],
    "@": [27, [18, 13, 17, 15, 15, 16, 12, 16, 10, 15, 9, 14, 8, 11, 8, 8, 9, 6, 11, 5, 14, 5, 16, 6, 17, 8, -1, -1, 12, 16, 10, 14, 9, 11, 9, 8, 10, 6, 11, 5, -1, -1, 18, 16, 17, 8, 17, 6, 19, 5, 21, 5, 23, 7, 24, 10, 24, 12, 23, 15, 22, 17, 20, 19, 18, 20, 15, 21, 12, 21, 9, 20, 7, 19, 5, 17, 4, 15, 3, 12, 3, 9, 4, 6, 5, 4, 7, 2, 9, 1, 12, 0, 15, 0, 18, 1, 20, 2, 21, 3, -1, -1, 19, 16, 18, 8, 18, 6, 19, 5]],
    "A": [18, [9, 21, 1, 0, -1, -1, 9, 21, 17, 0, -1, -1, 4, 7, 14, 7]],
    "B": [21, [4, 21, 4, 0, -1, -1, 4, 21, 13, 21, 16, 20, 17, 19, 18, 17, 18, 15, 17, 13, 16, 12, 13, 11, -1, -1, 4, 11, 13, 11, 16, 10, 17, 9, 18, 7, 18, 4, 17, 2, 16, 1, 13, 0, 4, 0]],
    "C": [21, [18, 16, 17, 18, 15, 20, 13, 21, 9, 21, 7, 20, 5, 18, 4, 16, 3, 13, 3, 8, 4, 5, 5, 3, 7, 1, 9, 0, 13, 0, 15, 1, 17, 3, 18, 5]],
    "D": [21, [4, 21, 4, 0, -1, -1, 4, 21, 11, 21, 14, 20, 16, 18, 17, 16, 18, 13, 18, 8, 17, 5, 16, 3, 14, 1, 11, 0, 4, 0]],
    "E": [19, [4, 21, 4, 0, -1, -1, 4, 21, 17, 21, -1, -1, 4, 11, 12, 11, -1, -1, 4, 0, 17, 0]],
    "F": [18, [4, 21, 4, 0, -1, -1, 4, 21, 17, 21, -1, -1, 4, 11, 12, 11]],
    "G": [21, [18, 16, 17, 18, 15, 20, 13, 21, 9, 21, 7, 20, 5, 18, 4, 16, 3, 13, 3, 8, 4, 5, 5, 3, 7, 1, 9, 0, 13, 0, 15, 1, 17, 3, 18, 5, 18, 8, -1, -1, 13, 8, 18, 8]],
    "H": [22, [4, 21, 4, 0, -1, -1, 18, 21, 18, 0, -1, -1, 4, 11, 18, 11]],
    "I": [8, [4, 21, 4, 0]],
    "J": [16, [12, 21, 12, 5, 11, 2, 10, 1, 8, 0, 6, 0, 4, 1, 3, 2, 2, 5, 2, 7]],
    "K": [21, [4, 21, 4, 0, -1, -1, 18, 21, 4, 7, -1, -1, 9, 12, 18, 0]],
    "L": [17, [4, 21, 4, 0, -1, -1, 4, 0, 16, 0]],
    "M": [24, [4, 21, 4, 0, -1, -1, 4, 21, 12, 0, -1, -1, 20, 21, 12, 0, -1, -1, 20, 21, 20, 0]],
    "N": [22, [4, 21, 4, 0, -1, -1, 4, 21, 18, 0, -1, -1, 18, 21, 18, 0]],
    "O": [22, [9, 21, 7, 20, 5, 18, 4, 16, 3, 13, 3, 8, 4, 5, 5, 3, 7, 1, 9, 0, 13, 0, 15, 1, 17, 3, 18, 5, 19, 8, 19, 13, 18, 16, 17, 18, 15, 20, 13, 21, 9, 21]],
    "P": [21, [4, 21, 4, 0, -1, -1, 4, 21, 13, 21, 16, 20, 17, 19, 18, 17, 18, 14, 17, 12, 16, 11, 13, 10, 4, 10]],
    "Q": [22, [9, 21, 7, 20, 5, 18, 4, 16, 3, 13, 3, 8, 4, 5, 5, 3, 7, 1, 9, 0, 13, 0, 15, 1, 17, 3, 18, 5, 19, 8, 19, 13, 18, 16, 17, 18, 15, 20, 13, 21, 9, 21, -1, -1, 12, 4, 18, -2]],
    "R": [21, [4, 21, 4, 0, -1, -1, 4, 21, 13, 21, 16, 20, 17, 19, 18, 17, 18, 15, 17, 13, 16, 12, 13, 11, 4, 11, -1, -1, 11, 11, 18, 0]],
    "S": [20, [17, 18, 15, 20, 12, 21, 8, 21, 5, 20, 3, 18, 3, 16, 4, 14, 5, 13, 7, 12, 13, 10, 15, 9, 16, 8, 17, 6, 17, 3, 15, 1, 12, 0, 8, 0, 5, 1, 3, 3]],
    "T": [16, [8, 21, 8, 0, -1, -1, 1, 21, 15, 21]],
    "U": [22, [4, 21, 4, 6, 5, 3, 7, 1, 10, 0, 12, 0, 15, 1, 17, 3, 18, 6, 18, 21]],
    "V": [18, [1, 21, 9, 0, -1, -1, 17, 21, 9, 0]],
    "W": [24, [2, 21, 7, 0, -1, -1, 12, 21, 7, 0, -1, -1, 12, 21, 17, 0, -1, -1, 22, 21, 17, 0]],
    "X": [20, [3, 21, 17, 0, -1, -1, 17, 21, 3, 0]],
    "Y": [18, [1, 21, 9, 11, 9, 0, -1, -1, 17, 21, 9, 11]],
    "Z": [20, [17, 21, 3, 0, -1, -1, 3, 21, 17, 21, -1, -1, 3, 0, 17, 0]],
    "[": [14, [4, 25, 4, -7, -1, -1, 5, 25, 5, -7, -1, -1, 4, 25, 11, 25, -1, -1, 4, -7, 11, -7]],
    "\\": [14, [0, 21, 14, -3]],
    "]": [14, [9, 25, 9, -7, -1, -1, 10, 25, 10, -7, -1, -1, 3, 25, 10, 25, -1, -1, 3, -7, 10, -7]],
    "^": [16, [6, 15, 8, 18, 10, 15, -1, -1, 3, 12, 8, 17, 13, 12, -1, -1, 8, 17, 8, 0]],
    "_": [16, [0, -2, 16, -2]],
    "`": [10, [6, 21, 5, 20, 4, 18, 4, 16, 5, 15, 6, 16, 5, 17]],
    "a": [19, [15, 14, 15, 0, -1, -1, 15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3]],
    "b": [19, [4, 21, 4, 0, -1, -1, 4, 11, 6, 13, 8, 14, 11, 14, 13, 13, 15, 11, 16, 8, 16, 6, 15, 3, 13, 1, 11, 0, 8, 0, 6, 1, 4, 3]],
    "c": [18, [15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3]],
    "d": [19, [15, 21, 15, 0, -1, -1, 15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3]],
    "e": [18, [3, 8, 15, 8, 15, 10, 14, 12, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3]],
    "f": [12, [10, 21, 8, 21, 6, 20, 5, 17, 5, 0, -1, -1, 2, 14, 9, 14]],
    "g": [19, [15, 14, 15, -2, 14, -5, 13, -6, 11, -7, 8, -7, 6, -6, -1, -1, 15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3]],
    "h": [19, [4, 21, 4, 0, -1, -1, 4, 10, 7, 13, 9, 14, 12, 14, 14, 13, 15, 10, 15, 0]],
    "i": [8, [3, 21, 4, 20, 5, 21, 4, 22, 3, 21, -1, -1, 4, 14, 4, 0]],
    "j": [10, [5, 21, 6, 20, 7, 21, 6, 22, 5, 21, -1, -1, 6, 14, 6, -3, 5, -6, 3, -7, 1, -7]],
    "k": [17, [4, 21, 4, 0, -1, -1, 14, 14, 4, 4, -1, -1, 8, 8, 15, 0]],
    "l": [8, [4, 21, 4, 0]],
    "m": [30, [4, 14, 4, 0, -1, -1, 4, 10, 7, 13, 9, 14, 12, 14, 14, 13, 15, 10, 15, 0, -1, -1, 15, 10, 18, 13, 20, 14, 23, 14, 25, 13, 26, 10, 26, 0]],
    "n": [19, [4, 14, 4, 0, -1, -1, 4, 10, 7, 13, 9, 14, 12, 14, 14, 13, 15, 10, 15, 0]],
    "o": [19, [8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3, 16, 6, 16, 8, 15, 11, 13, 13, 11, 14, 8, 14]],
    "p": [19, [4, 14, 4, -7, -1, -1, 4, 11, 6, 13, 8, 14, 11, 14, 13, 13, 15, 11, 16, 8, 16, 6, 15, 3, 13, 1, 11, 0, 8, 0, 6, 1, 4, 3]],
    "q": [19, [15, 14, 15, -7, -1, -1, 15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3]],
    "r": [13, [4, 14, 4, 0, -1, -1, 4, 8, 5, 11, 7, 13, 9, 14, 12, 14]],
    "s": [17, [14, 11, 13, 13, 10, 14, 7, 14, 4, 13, 3, 11, 4, 9, 6, 8, 11, 7, 13, 6, 14, 4, 14, 3, 13, 1, 10, 0, 7, 0, 4, 1, 3, 3]],
    "t": [12, [5, 21, 5, 4, 6, 1, 8, 0, 10, 0, -1, -1, 2, 14, 9, 14]],
    "u": [19, [4, 14, 4, 4, 5, 1, 7, 0, 10, 0, 12, 1, 15, 4, -1, -1, 15, 14, 15, 0]],
    "v": [16, [2, 14, 8, 0, -1, -1, 14, 14, 8, 0]],
    "w": [22, [3, 14, 7, 0, -1, -1, 11, 14, 7, 0, -1, -1, 11, 14, 15, 0, -1, -1, 19, 14, 15, 0]],
    "x": [17, [3, 14, 14, 0, -1, -1, 14, 14, 3, 0]],
    "y": [16, [2, 14, 8, 0, -1, -1, 14, 14, 8, 0, 6, -4, 4, -6, 2, -7, 1, -7]],
    "z": [17, [14, 14, 3, 0, -1, -1, 3, 14, 14, 14, -1, -1, 3, 0, 14, 0]],
    "{": [14, [9, 25, 7, 24, 6, 23, 5, 21, 5, 19, 6, 17, 7, 16, 8, 14, 8, 12, 6, 10, -1, -1, 7, 24, 6, 22, 6, 20, 7, 18, 8, 17, 9, 15, 9, 13, 8, 11, 4, 9, 8, 7, 9, 5, 9, 3, 8, 1, 7, 0, 6, -2, 6, -4, 7, -6, -1, -1, 6, 8, 8, 6, 8, 4, 7, 2, 6, 1, 5, -1, 5, -3, 6, -5, 7, -6, 9, -7]],
    "|": [8, [4, 25, 4, -7]],
    "}": [14, [5, 25, 7, 24, 8, 23, 9, 21, 9, 19, 8, 17, 7, 16, 6, 14, 6, 12, 8, 10, -1, -1, 7, 24, 8, 22, 8, 20, 7, 18, 6, 17, 5, 15, 5, 13, 6, 11, 10, 9, 6, 7, 5, 5, 5, 3, 6, 1, 7, 0, 8, -2, 8, -4, 7, -6, -1, -1, 8, 8, 6, 6, 6, 4, 7, 2, 8, 1, 9, -1, 9, -3, 8, -5, 7, -6, 5, -7]],
    "~": [24, [3, 6, 3, 8, 4, 11, 6, 12, 8, 12, 10, 11, 14, 8, 16, 7, 18, 7, 20, 8, 21, 10, -1, -1, 3, 8, 4, 10, 6, 11, 8, 11, 10, 10, 14, 7, 16, 6, 18, 6, 20, 7, 21, 10, 21, 12]],
};

module.exports = function textVertices(text, left, baseline, scale) {
    scale = scale || 1;

    var strokes = [],
        i, len, j, len2, glyph, data, x, y, prev;

    for (i = 0, len = text.length; i < len; i++) {
        glyph = simplex_font[text[i]];
        if (!glyph) continue;
        prev = null;

        for (j = 0, len2 = glyph[1].length; j < len2; j += 2) {
            if (glyph[1][j] === -1 && glyph[1][j + 1] === -1) {
                prev = null;

            } else {
                x = left + glyph[1][j] * scale;
                y = baseline - glyph[1][j + 1] * scale;
                if (prev) {
                    strokes.push(prev.x, prev.y, x, y);
                }
                prev = {x: x, y: y};
            }
        }
        left += glyph[0] * scale;
    }

    return strokes;
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/lib/glmatrix.js":[function(require,module,exports){
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.2.0
 */
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
(function(e){"use strict";var t={};typeof exports=="undefined"?typeof define=="function"&&typeof define.amd=="object"&&define.amd?(t.exports={},define(function(){return t.exports})):t.exports=typeof window!="undefined"?window:e:t.exports=exports,function(e){if(!t)var t=1e-6;if(!n)var n=typeof Float32Array!="undefined"?Float32Array:Array;if(!r)var r=Math.random;var i={};i.setMatrixArrayType=function(e){n=e},typeof e!="undefined"&&(e.glMatrix=i);var s={};s.create=function(){var e=new n(2);return e[0]=0,e[1]=0,e},s.clone=function(e){var t=new n(2);return t[0]=e[0],t[1]=e[1],t},s.fromValues=function(e,t){var r=new n(2);return r[0]=e,r[1]=t,r},s.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e},s.set=function(e,t,n){return e[0]=t,e[1]=n,e},s.add=function(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e},s.subtract=function(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e},s.sub=s.subtract,s.multiply=function(e,t,n){return e[0]=t[0]*n[0],e[1]=t[1]*n[1],e},s.mul=s.multiply,s.divide=function(e,t,n){return e[0]=t[0]/n[0],e[1]=t[1]/n[1],e},s.div=s.divide,s.min=function(e,t,n){return e[0]=Math.min(t[0],n[0]),e[1]=Math.min(t[1],n[1]),e},s.max=function(e,t,n){return e[0]=Math.max(t[0],n[0]),e[1]=Math.max(t[1],n[1]),e},s.scale=function(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e},s.scaleAndAdd=function(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e},s.distance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1];return Math.sqrt(n*n+r*r)},s.dist=s.distance,s.squaredDistance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1];return n*n+r*r},s.sqrDist=s.squaredDistance,s.length=function(e){var t=e[0],n=e[1];return Math.sqrt(t*t+n*n)},s.len=s.length,s.squaredLength=function(e){var t=e[0],n=e[1];return t*t+n*n},s.sqrLen=s.squaredLength,s.negate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e},s.normalize=function(e,t){var n=t[0],r=t[1],i=n*n+r*r;return i>0&&(i=1/Math.sqrt(i),e[0]=t[0]*i,e[1]=t[1]*i),e},s.dot=function(e,t){return e[0]*t[0]+e[1]*t[1]},s.cross=function(e,t,n){var r=t[0]*n[1]-t[1]*n[0];return e[0]=e[1]=0,e[2]=r,e},s.lerp=function(e,t,n,r){var i=t[0],s=t[1];return e[0]=i+r*(n[0]-i),e[1]=s+r*(n[1]-s),e},s.random=function(e,t){t=t||1;var n=r()*2*Math.PI;return e[0]=Math.cos(n)*t,e[1]=Math.sin(n)*t,e},s.transformMat2=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[2]*i,e[1]=n[1]*r+n[3]*i,e},s.transformMat2d=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[2]*i+n[4],e[1]=n[1]*r+n[3]*i+n[5],e},s.transformMat3=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[3]*i+n[6],e[1]=n[1]*r+n[4]*i+n[7],e},s.transformMat4=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[4]*i+n[12],e[1]=n[1]*r+n[5]*i+n[13],e},s.forEach=function(){var e=s.create();return function(t,n,r,i,s,o){var u,a;n||(n=2),r||(r=0),i?a=Math.min(i*n+r,t.length):a=t.length;for(u=r;u<a;u+=n)e[0]=t[u],e[1]=t[u+1],s(e,e,o),t[u]=e[0],t[u+1]=e[1];return t}}(),s.str=function(e){return"vec2("+e[0]+", "+e[1]+")"},typeof e!="undefined"&&(e.vec2=s);var o={};o.create=function(){var e=new n(3);return e[0]=0,e[1]=0,e[2]=0,e},o.clone=function(e){var t=new n(3);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t},o.fromValues=function(e,t,r){var i=new n(3);return i[0]=e,i[1]=t,i[2]=r,i},o.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e},o.set=function(e,t,n,r){return e[0]=t,e[1]=n,e[2]=r,e},o.add=function(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e[2]=t[2]+n[2],e},o.subtract=function(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e},o.sub=o.subtract,o.multiply=function(e,t,n){return e[0]=t[0]*n[0],e[1]=t[1]*n[1],e[2]=t[2]*n[2],e},o.mul=o.multiply,o.divide=function(e,t,n){return e[0]=t[0]/n[0],e[1]=t[1]/n[1],e[2]=t[2]/n[2],e},o.div=o.divide,o.min=function(e,t,n){return e[0]=Math.min(t[0],n[0]),e[1]=Math.min(t[1],n[1]),e[2]=Math.min(t[2],n[2]),e},o.max=function(e,t,n){return e[0]=Math.max(t[0],n[0]),e[1]=Math.max(t[1],n[1]),e[2]=Math.max(t[2],n[2]),e},o.scale=function(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e},o.scaleAndAdd=function(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e[2]=t[2]+n[2]*r,e},o.distance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2];return Math.sqrt(n*n+r*r+i*i)},o.dist=o.distance,o.squaredDistance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2];return n*n+r*r+i*i},o.sqrDist=o.squaredDistance,o.length=function(e){var t=e[0],n=e[1],r=e[2];return Math.sqrt(t*t+n*n+r*r)},o.len=o.length,o.squaredLength=function(e){var t=e[0],n=e[1],r=e[2];return t*t+n*n+r*r},o.sqrLen=o.squaredLength,o.negate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e},o.normalize=function(e,t){var n=t[0],r=t[1],i=t[2],s=n*n+r*r+i*i;return s>0&&(s=1/Math.sqrt(s),e[0]=t[0]*s,e[1]=t[1]*s,e[2]=t[2]*s),e},o.dot=function(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]},o.cross=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=n[0],u=n[1],a=n[2];return e[0]=i*a-s*u,e[1]=s*o-r*a,e[2]=r*u-i*o,e},o.lerp=function(e,t,n,r){var i=t[0],s=t[1],o=t[2];return e[0]=i+r*(n[0]-i),e[1]=s+r*(n[1]-s),e[2]=o+r*(n[2]-o),e},o.random=function(e,t){t=t||1;var n=r()*2*Math.PI,i=r()*2-1,s=Math.sqrt(1-i*i)*t;return e[0]=Math.cos(n)*s,e[1]=Math.sin(n)*s,e[2]=i*t,e},o.transformMat4=function(e,t,n){var r=t[0],i=t[1],s=t[2];return e[0]=n[0]*r+n[4]*i+n[8]*s+n[12],e[1]=n[1]*r+n[5]*i+n[9]*s+n[13],e[2]=n[2]*r+n[6]*i+n[10]*s+n[14],e},o.transformMat3=function(e,t,n){var r=t[0],i=t[1],s=t[2];return e[0]=r*n[0]+i*n[3]+s*n[6],e[1]=r*n[1]+i*n[4]+s*n[7],e[2]=r*n[2]+i*n[5]+s*n[8],e},o.transformQuat=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=n[0],u=n[1],a=n[2],f=n[3],l=f*r+u*s-a*i,c=f*i+a*r-o*s,h=f*s+o*i-u*r,p=-o*r-u*i-a*s;return e[0]=l*f+p*-o+c*-a-h*-u,e[1]=c*f+p*-u+h*-o-l*-a,e[2]=h*f+p*-a+l*-u-c*-o,e},o.forEach=function(){var e=o.create();return function(t,n,r,i,s,o){var u,a;n||(n=3),r||(r=0),i?a=Math.min(i*n+r,t.length):a=t.length;for(u=r;u<a;u+=n)e[0]=t[u],e[1]=t[u+1],e[2]=t[u+2],s(e,e,o),t[u]=e[0],t[u+1]=e[1],t[u+2]=e[2];return t}}(),o.str=function(e){return"vec3("+e[0]+", "+e[1]+", "+e[2]+")"},typeof e!="undefined"&&(e.vec3=o);var u={};u.create=function(){var e=new n(4);return e[0]=0,e[1]=0,e[2]=0,e[3]=0,e},u.clone=function(e){var t=new n(4);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t},u.fromValues=function(e,t,r,i){var s=new n(4);return s[0]=e,s[1]=t,s[2]=r,s[3]=i,s},u.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e},u.set=function(e,t,n,r,i){return e[0]=t,e[1]=n,e[2]=r,e[3]=i,e},u.add=function(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e[2]=t[2]+n[2],e[3]=t[3]+n[3],e},u.subtract=function(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e[3]=t[3]-n[3],e},u.sub=u.subtract,u.multiply=function(e,t,n){return e[0]=t[0]*n[0],e[1]=t[1]*n[1],e[2]=t[2]*n[2],e[3]=t[3]*n[3],e},u.mul=u.multiply,u.divide=function(e,t,n){return e[0]=t[0]/n[0],e[1]=t[1]/n[1],e[2]=t[2]/n[2],e[3]=t[3]/n[3],e},u.div=u.divide,u.min=function(e,t,n){return e[0]=Math.min(t[0],n[0]),e[1]=Math.min(t[1],n[1]),e[2]=Math.min(t[2],n[2]),e[3]=Math.min(t[3],n[3]),e},u.max=function(e,t,n){return e[0]=Math.max(t[0],n[0]),e[1]=Math.max(t[1],n[1]),e[2]=Math.max(t[2],n[2]),e[3]=Math.max(t[3],n[3]),e},u.scale=function(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e[3]=t[3]*n,e},u.scaleAndAdd=function(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e[2]=t[2]+n[2]*r,e[3]=t[3]+n[3]*r,e},u.distance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2],s=t[3]-e[3];return Math.sqrt(n*n+r*r+i*i+s*s)},u.dist=u.distance,u.squaredDistance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2],s=t[3]-e[3];return n*n+r*r+i*i+s*s},u.sqrDist=u.squaredDistance,u.length=function(e){var t=e[0],n=e[1],r=e[2],i=e[3];return Math.sqrt(t*t+n*n+r*r+i*i)},u.len=u.length,u.squaredLength=function(e){var t=e[0],n=e[1],r=e[2],i=e[3];return t*t+n*n+r*r+i*i},u.sqrLen=u.squaredLength,u.negate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e[3]=-t[3],e},u.normalize=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n*n+r*r+i*i+s*s;return o>0&&(o=1/Math.sqrt(o),e[0]=t[0]*o,e[1]=t[1]*o,e[2]=t[2]*o,e[3]=t[3]*o),e},u.dot=function(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]+e[3]*t[3]},u.lerp=function(e,t,n,r){var i=t[0],s=t[1],o=t[2],u=t[3];return e[0]=i+r*(n[0]-i),e[1]=s+r*(n[1]-s),e[2]=o+r*(n[2]-o),e[3]=u+r*(n[3]-u),e},u.random=function(e,t){return t=t||1,e[0]=r(),e[1]=r(),e[2]=r(),e[3]=r(),u.normalize(e,e),u.scale(e,e,t),e},u.transformMat4=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3];return e[0]=n[0]*r+n[4]*i+n[8]*s+n[12]*o,e[1]=n[1]*r+n[5]*i+n[9]*s+n[13]*o,e[2]=n[2]*r+n[6]*i+n[10]*s+n[14]*o,e[3]=n[3]*r+n[7]*i+n[11]*s+n[15]*o,e},u.transformQuat=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=n[0],u=n[1],a=n[2],f=n[3],l=f*r+u*s-a*i,c=f*i+a*r-o*s,h=f*s+o*i-u*r,p=-o*r-u*i-a*s;return e[0]=l*f+p*-o+c*-a-h*-u,e[1]=c*f+p*-u+h*-o-l*-a,e[2]=h*f+p*-a+l*-u-c*-o,e},u.forEach=function(){var e=u.create();return function(t,n,r,i,s,o){var u,a;n||(n=4),r||(r=0),i?a=Math.min(i*n+r,t.length):a=t.length;for(u=r;u<a;u+=n)e[0]=t[u],e[1]=t[u+1],e[2]=t[u+2],e[3]=t[u+3],s(e,e,o),t[u]=e[0],t[u+1]=e[1],t[u+2]=e[2],t[u+3]=e[3];return t}}(),u.str=function(e){return"vec4("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+")"},typeof e!="undefined"&&(e.vec4=u);var a={};a.create=function(){var e=new n(4);return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e},a.clone=function(e){var t=new n(4);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t},a.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e},a.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e},a.transpose=function(e,t){if(e===t){var n=t[1];e[1]=t[2],e[2]=n}else e[0]=t[0],e[1]=t[2],e[2]=t[1],e[3]=t[3];return e},a.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n*s-i*r;return o?(o=1/o,e[0]=s*o,e[1]=-r*o,e[2]=-i*o,e[3]=n*o,e):null},a.adjoint=function(e,t){var n=t[0];return e[0]=t[3],e[1]=-t[1],e[2]=-t[2],e[3]=n,e},a.determinant=function(e){return e[0]*e[3]-e[2]*e[1]},a.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=n[0],a=n[1],f=n[2],l=n[3];return e[0]=r*u+i*f,e[1]=r*a+i*l,e[2]=s*u+o*f,e[3]=s*a+o*l,e},a.mul=a.multiply,a.rotate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a+i*u,e[1]=r*-u+i*a,e[2]=s*a+o*u,e[3]=s*-u+o*a,e},a.scale=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=n[0],a=n[1];return e[0]=r*u,e[1]=i*a,e[2]=s*u,e[3]=o*a,e},a.str=function(e){return"mat2("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+")"},typeof e!="undefined"&&(e.mat2=a);var f={};f.create=function(){var e=new n(6);return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e[4]=0,e[5]=0,e},f.clone=function(e){var t=new n(6);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t},f.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e},f.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e[4]=0,e[5]=0,e},f.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=n*s-r*i;return a?(a=1/a,e[0]=s*a,e[1]=-r*a,e[2]=-i*a,e[3]=n*a,e[4]=(i*u-s*o)*a,e[5]=(r*o-n*u)*a,e):null},f.determinant=function(e){return e[0]*e[3]-e[1]*e[2]},f.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=n[0],l=n[1],c=n[2],h=n[3],p=n[4],d=n[5];return e[0]=r*f+i*c,e[1]=r*l+i*h,e[2]=s*f+o*c,e[3]=s*l+o*h,e[4]=f*u+c*a+p,e[5]=l*u+h*a+d,e},f.mul=f.multiply,f.rotate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=Math.sin(n),l=Math.cos(n);return e[0]=r*l+i*f,e[1]=-r*f+i*l,e[2]=s*l+o*f,e[3]=-s*f+l*o,e[4]=l*u+f*a,e[5]=l*a-f*u,e},f.scale=function(e,t,n){var r=n[0],i=n[1];return e[0]=t[0]*r,e[1]=t[1]*i,e[2]=t[2]*r,e[3]=t[3]*i,e[4]=t[4]*r,e[5]=t[5]*i,e},f.translate=function(e,t,n){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4]+n[0],e[5]=t[5]+n[1],e},f.str=function(e){return"mat2d("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+", "+e[4]+", "+e[5]+")"},typeof e!="undefined"&&(e.mat2d=f);var l={};l.create=function(){var e=new n(9);return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=1,e[5]=0,e[6]=0,e[7]=0,e[8]=1,e},l.fromMat4=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[4],e[4]=t[5],e[5]=t[6],e[6]=t[8],e[7]=t[9],e[8]=t[10],e},l.clone=function(e){var t=new n(9);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t},l.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e},l.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=1,e[5]=0,e[6]=0,e[7]=0,e[8]=1,e},l.transpose=function(e,t){if(e===t){var n=t[1],r=t[2],i=t[5];e[1]=t[3],e[2]=t[6],e[3]=n,e[5]=t[7],e[6]=r,e[7]=i}else e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8];return e},l.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=l*o-u*f,h=-l*s+u*a,p=f*s-o*a,d=n*c+r*h+i*p;return d?(d=1/d,e[0]=c*d,e[1]=(-l*r+i*f)*d,e[2]=(u*r-i*o)*d,e[3]=h*d,e[4]=(l*n-i*a)*d,e[5]=(-u*n+i*s)*d,e[6]=p*d,e[7]=(-f*n+r*a)*d,e[8]=(o*n-r*s)*d,e):null},l.adjoint=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8];return e[0]=o*l-u*f,e[1]=i*f-r*l,e[2]=r*u-i*o,e[3]=u*a-s*l,e[4]=n*l-i*a,e[5]=i*s-n*u,e[6]=s*f-o*a,e[7]=r*a-n*f,e[8]=n*o-r*s,e},l.determinant=function(e){var t=e[0],n=e[1],r=e[2],i=e[3],s=e[4],o=e[5],u=e[6],a=e[7],f=e[8];return t*(f*s-o*a)+n*(-f*i+o*u)+r*(a*i-s*u)},l.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=n[0],p=n[1],d=n[2],v=n[3],m=n[4],g=n[5],y=n[6],b=n[7],w=n[8];return e[0]=h*r+p*o+d*f,e[1]=h*i+p*u+d*l,e[2]=h*s+p*a+d*c,e[3]=v*r+m*o+g*f,e[4]=v*i+m*u+g*l,e[5]=v*s+m*a+g*c,e[6]=y*r+b*o+w*f,e[7]=y*i+b*u+w*l,e[8]=y*s+b*a+w*c,e},l.mul=l.multiply,l.translate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=n[0],p=n[1];return e[0]=r,e[1]=i,e[2]=s,e[3]=o,e[4]=u,e[5]=a,e[6]=h*r+p*o+f,e[7]=h*i+p*u+l,e[8]=h*s+p*a+c,e},l.rotate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=Math.sin(n),p=Math.cos(n);return e[0]=p*r+h*o,e[1]=p*i+h*u,e[2]=p*s+h*a,e[3]=p*o-h*r,e[4]=p*u-h*i,e[5]=p*a-h*s,e[6]=f,e[7]=l,e[8]=c,e},l.scale=function(e,t,n){var r=n[0],i=n[1];return e[0]=r*t[0],e[1]=r*t[1],e[2]=r*t[2],e[3]=i*t[3],e[4]=i*t[4],e[5]=i*t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e},l.fromMat2d=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=0,e[3]=t[2],e[4]=t[3],e[5]=0,e[6]=t[4],e[7]=t[5],e[8]=1,e},l.fromQuat=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n+n,u=r+r,a=i+i,f=n*o,l=n*u,c=n*a,h=r*u,p=r*a,d=i*a,v=s*o,m=s*u,g=s*a;return e[0]=1-(h+d),e[3]=l+g,e[6]=c-m,e[1]=l-g,e[4]=1-(f+d),e[7]=p+v,e[2]=c+m,e[5]=p-v,e[8]=1-(f+h),e},l.normalFromMat4=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=t[9],h=t[10],p=t[11],d=t[12],v=t[13],m=t[14],g=t[15],y=n*u-r*o,b=n*a-i*o,w=n*f-s*o,E=r*a-i*u,S=r*f-s*u,x=i*f-s*a,T=l*v-c*d,N=l*m-h*d,C=l*g-p*d,k=c*m-h*v,L=c*g-p*v,A=h*g-p*m,O=y*A-b*L+w*k+E*C-S*N+x*T;return O?(O=1/O,e[0]=(u*A-a*L+f*k)*O,e[1]=(a*C-o*A-f*N)*O,e[2]=(o*L-u*C+f*T)*O,e[3]=(i*L-r*A-s*k)*O,e[4]=(n*A-i*C+s*N)*O,e[5]=(r*C-n*L-s*T)*O,e[6]=(v*x-m*S+g*E)*O,e[7]=(m*w-d*x-g*b)*O,e[8]=(d*S-v*w+g*y)*O,e):null},l.str=function(e){return"mat3("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+", "+e[4]+", "+e[5]+", "+e[6]+", "+e[7]+", "+e[8]+")"},typeof e!="undefined"&&(e.mat3=l);var c={};c.create=function(){var e=new n(16);return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e},c.clone=function(e){var t=new n(16);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t[9]=e[9],t[10]=e[10],t[11]=e[11],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15],t},c.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e},c.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e},c.transpose=function(e,t){if(e===t){var n=t[1],r=t[2],i=t[3],s=t[6],o=t[7],u=t[11];e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=n,e[6]=t[9],e[7]=t[13],e[8]=r,e[9]=s,e[11]=t[14],e[12]=i,e[13]=o,e[14]=u}else e[0]=t[0],e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=t[1],e[5]=t[5],e[6]=t[9],e[7]=t[13],e[8]=t[2],e[9]=t[6],e[10]=t[10],e[11]=t[14],e[12]=t[3],e[13]=t[7],e[14]=t[11],e[15]=t[15];return e},c.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=t[9],h=t[10],p=t[11],d=t[12],v=t[13],m=t[14],g=t[15],y=n*u-r*o,b=n*a-i*o,w=n*f-s*o,E=r*a-i*u,S=r*f-s*u,x=i*f-s*a,T=l*v-c*d,N=l*m-h*d,C=l*g-p*d,k=c*m-h*v,L=c*g-p*v,A=h*g-p*m,O=y*A-b*L+w*k+E*C-S*N+x*T;return O?(O=1/O,e[0]=(u*A-a*L+f*k)*O,e[1]=(i*L-r*A-s*k)*O,e[2]=(v*x-m*S+g*E)*O,e[3]=(h*S-c*x-p*E)*O,e[4]=(a*C-o*A-f*N)*O,e[5]=(n*A-i*C+s*N)*O,e[6]=(m*w-d*x-g*b)*O,e[7]=(l*x-h*w+p*b)*O,e[8]=(o*L-u*C+f*T)*O,e[9]=(r*C-n*L-s*T)*O,e[10]=(d*S-v*w+g*y)*O,e[11]=(c*w-l*S-p*y)*O,e[12]=(u*N-o*k-a*T)*O,e[13]=(n*k-r*N+i*T)*O,e[14]=(v*b-d*E-m*y)*O,e[15]=(l*E-c*b+h*y)*O,e):null},c.adjoint=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=t[9],h=t[10],p=t[11],d=t[12],v=t[13],m=t[14],g=t[15];return e[0]=u*(h*g-p*m)-c*(a*g-f*m)+v*(a*p-f*h),e[1]=-(r*(h*g-p*m)-c*(i*g-s*m)+v*(i*p-s*h)),e[2]=r*(a*g-f*m)-u*(i*g-s*m)+v*(i*f-s*a),e[3]=-(r*(a*p-f*h)-u*(i*p-s*h)+c*(i*f-s*a)),e[4]=-(o*(h*g-p*m)-l*(a*g-f*m)+d*(a*p-f*h)),e[5]=n*(h*g-p*m)-l*(i*g-s*m)+d*(i*p-s*h),e[6]=-(n*(a*g-f*m)-o*(i*g-s*m)+d*(i*f-s*a)),e[7]=n*(a*p-f*h)-o*(i*p-s*h)+l*(i*f-s*a),e[8]=o*(c*g-p*v)-l*(u*g-f*v)+d*(u*p-f*c),e[9]=-(n*(c*g-p*v)-l*(r*g-s*v)+d*(r*p-s*c)),e[10]=n*(u*g-f*v)-o*(r*g-s*v)+d*(r*f-s*u),e[11]=-(n*(u*p-f*c)-o*(r*p-s*c)+l*(r*f-s*u)),e[12]=-(o*(c*m-h*v)-l*(u*m-a*v)+d*(u*h-a*c)),e[13]=n*(c*m-h*v)-l*(r*m-i*v)+d*(r*h-i*c),e[14]=-(n*(u*m-a*v)-o*(r*m-i*v)+d*(r*a-i*u)),e[15]=n*(u*h-a*c)-o*(r*h-i*c)+l*(r*a-i*u),e},c.determinant=function(e){var t=e[0],n=e[1],r=e[2],i=e[3],s=e[4],o=e[5],u=e[6],a=e[7],f=e[8],l=e[9],c=e[10],h=e[11],p=e[12],d=e[13],v=e[14],m=e[15],g=t*o-n*s,y=t*u-r*s,b=t*a-i*s,w=n*u-r*o,E=n*a-i*o,S=r*a-i*u,x=f*d-l*p,T=f*v-c*p,N=f*m-h*p,C=l*v-c*d,k=l*m-h*d,L=c*m-h*v;return g*L-y*k+b*C+w*N-E*T+S*x},c.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=t[9],p=t[10],d=t[11],v=t[12],m=t[13],g=t[14],y=t[15],b=n[0],w=n[1],E=n[2],S=n[3];return e[0]=b*r+w*u+E*c+S*v,e[1]=b*i+w*a+E*h+S*m,e[2]=b*s+w*f+E*p+S*g,e[3]=b*o+w*l+E*d+S*y,b=n[4],w=n[5],E=n[6],S=n[7],e[4]=b*r+w*u+E*c+S*v,e[5]=b*i+w*a+E*h+S*m,e[6]=b*s+w*f+E*p+S*g,e[7]=b*o+w*l+E*d+S*y,b=n[8],w=n[9],E=n[10],S=n[11],e[8]=b*r+w*u+E*c+S*v,e[9]=b*i+w*a+E*h+S*m,e[10]=b*s+w*f+E*p+S*g,e[11]=b*o+w*l+E*d+S*y,b=n[12],w=n[13],E=n[14],S=n[15],e[12]=b*r+w*u+E*c+S*v,e[13]=b*i+w*a+E*h+S*m,e[14]=b*s+w*f+E*p+S*g,e[15]=b*o+w*l+E*d+S*y,e},c.mul=c.multiply,c.translate=function(e,t,n){var r=n[0],i=n[1],s=n[2],o,u,a,f,l,c,h,p,d,v,m,g;return t===e?(e[12]=t[0]*r+t[4]*i+t[8]*s+t[12],e[13]=t[1]*r+t[5]*i+t[9]*s+t[13],e[14]=t[2]*r+t[6]*i+t[10]*s+t[14],e[15]=t[3]*r+t[7]*i+t[11]*s+t[15]):(o=t[0],u=t[1],a=t[2],f=t[3],l=t[4],c=t[5],h=t[6],p=t[7],d=t[8],v=t[9],m=t[10],g=t[11],e[0]=o,e[1]=u,e[2]=a,e[3]=f,e[4]=l,e[5]=c,e[6]=h,e[7]=p,e[8]=d,e[9]=v,e[10]=m,e[11]=g,e[12]=o*r+l*i+d*s+t[12],e[13]=u*r+c*i+v*s+t[13],e[14]=a*r+h*i+m*s+t[14],e[15]=f*r+p*i+g*s+t[15]),e},c.scale=function(e,t,n){var r=n[0],i=n[1],s=n[2];return e[0]=t[0]*r,e[1]=t[1]*r,e[2]=t[2]*r,e[3]=t[3]*r,e[4]=t[4]*i,e[5]=t[5]*i,e[6]=t[6]*i,e[7]=t[7]*i,e[8]=t[8]*s,e[9]=t[9]*s,e[10]=t[10]*s,e[11]=t[11]*s,e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e},c.rotate=function(e,n,r,i){var s=i[0],o=i[1],u=i[2],a=Math.sqrt(s*s+o*o+u*u),f,l,c,h,p,d,v,m,g,y,b,w,E,S,x,T,N,C,k,L,A,O,M,_;return Math.abs(a)<t?null:(a=1/a,s*=a,o*=a,u*=a,f=Math.sin(r),l=Math.cos(r),c=1-l,h=n[0],p=n[1],d=n[2],v=n[3],m=n[4],g=n[5],y=n[6],b=n[7],w=n[8],E=n[9],S=n[10],x=n[11],T=s*s*c+l,N=o*s*c+u*f,C=u*s*c-o*f,k=s*o*c-u*f,L=o*o*c+l,A=u*o*c+s*f,O=s*u*c+o*f,M=o*u*c-s*f,_=u*u*c+l,e[0]=h*T+m*N+w*C,e[1]=p*T+g*N+E*C,e[2]=d*T+y*N+S*C,e[3]=v*T+b*N+x*C,e[4]=h*k+m*L+w*A,e[5]=p*k+g*L+E*A,e[6]=d*k+y*L+S*A,e[7]=v*k+b*L+x*A,e[8]=h*O+m*M+w*_,e[9]=p*O+g*M+E*_,e[10]=d*O+y*M+S*_,e[11]=v*O+b*M+x*_,n!==e&&(e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15]),e)},c.rotateX=function(e,t,n){var r=Math.sin(n),i=Math.cos(n),s=t[4],o=t[5],u=t[6],a=t[7],f=t[8],l=t[9],c=t[10],h=t[11];return t!==e&&(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[4]=s*i+f*r,e[5]=o*i+l*r,e[6]=u*i+c*r,e[7]=a*i+h*r,e[8]=f*i-s*r,e[9]=l*i-o*r,e[10]=c*i-u*r,e[11]=h*i-a*r,e},c.rotateY=function(e,t,n){var r=Math.sin(n),i=Math.cos(n),s=t[0],o=t[1],u=t[2],a=t[3],f=t[8],l=t[9],c=t[10],h=t[11];return t!==e&&(e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[0]=s*i-f*r,e[1]=o*i-l*r,e[2]=u*i-c*r,e[3]=a*i-h*r,e[8]=s*r+f*i,e[9]=o*r+l*i,e[10]=u*r+c*i,e[11]=a*r+h*i,e},c.rotateZ=function(e,t,n){var r=Math.sin(n),i=Math.cos(n),s=t[0],o=t[1],u=t[2],a=t[3],f=t[4],l=t[5],c=t[6],h=t[7];return t!==e&&(e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[0]=s*i+f*r,e[1]=o*i+l*r,e[2]=u*i+c*r,e[3]=a*i+h*r,e[4]=f*i-s*r,e[5]=l*i-o*r,e[6]=c*i-u*r,e[7]=h*i-a*r,e},c.fromRotationTranslation=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=r+r,a=i+i,f=s+s,l=r*u,c=r*a,h=r*f,p=i*a,d=i*f,v=s*f,m=o*u,g=o*a,y=o*f;return e[0]=1-(p+v),e[1]=c+y,e[2]=h-g,e[3]=0,e[4]=c-y,e[5]=1-(l+v),e[6]=d+m,e[7]=0,e[8]=h+g,e[9]=d-m,e[10]=1-(l+p),e[11]=0,e[12]=n[0],e[13]=n[1],e[14]=n[2],e[15]=1,e},c.fromQuat=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n+n,u=r+r,a=i+i,f=n*o,l=n*u,c=n*a,h=r*u,p=r*a,d=i*a,v=s*o,m=s*u,g=s*a;return e[0]=1-(h+d),e[1]=l+g,e[2]=c-m,e[3]=0,e[4]=l-g,e[5]=1-(f+d),e[6]=p+v,e[7]=0,e[8]=c+m,e[9]=p-v,e[10]=1-(f+h),e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e},c.frustum=function(e,t,n,r,i,s,o){var u=1/(n-t),a=1/(i-r),f=1/(s-o);return e[0]=s*2*u,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=s*2*a,e[6]=0,e[7]=0,e[8]=(n+t)*u,e[9]=(i+r)*a,e[10]=(o+s)*f,e[11]=-1,e[12]=0,e[13]=0,e[14]=o*s*2*f,e[15]=0,e},c.perspective=function(e,t,n,r,i){var s=1/Math.tan(t/2),o=1/(r-i);return e[0]=s/n,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=s,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=(i+r)*o,e[11]=-1,e[12]=0,e[13]=0,e[14]=2*i*r*o,e[15]=0,e},c.ortho=function(e,t,n,r,i,s,o){var u=1/(t-n),a=1/(r-i),f=1/(s-o);return e[0]=-2*u,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=-2*a,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=2*f,e[11]=0,e[12]=(t+n)*u,e[13]=(i+r)*a,e[14]=(o+s)*f,e[15]=1,e},c.lookAt=function(e,n,r,i){var s,o,u,a,f,l,h,p,d,v,m=n[0],g=n[1],y=n[2],b=i[0],w=i[1],E=i[2],S=r[0],x=r[1],T=r[2];return Math.abs(m-S)<t&&Math.abs(g-x)<t&&Math.abs(y-T)<t?c.identity(e):(h=m-S,p=g-x,d=y-T,v=1/Math.sqrt(h*h+p*p+d*d),h*=v,p*=v,d*=v,s=w*d-E*p,o=E*h-b*d,u=b*p-w*h,v=Math.sqrt(s*s+o*o+u*u),v?(v=1/v,s*=v,o*=v,u*=v):(s=0,o=0,u=0),a=p*u-d*o,f=d*s-h*u,l=h*o-p*s,v=Math.sqrt(a*a+f*f+l*l),v?(v=1/v,a*=v,f*=v,l*=v):(a=0,f=0,l=0),e[0]=s,e[1]=a,e[2]=h,e[3]=0,e[4]=o,e[5]=f,e[6]=p,e[7]=0,e[8]=u,e[9]=l,e[10]=d,e[11]=0,e[12]=-(s*m+o*g+u*y),e[13]=-(a*m+f*g+l*y),e[14]=-(h*m+p*g+d*y),e[15]=1,e)},c.str=function(e){return"mat4("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+", "+e[4]+", "+e[5]+", "+e[6]+", "+e[7]+", "+e[8]+", "+e[9]+", "+e[10]+", "+e[11]+", "+e[12]+", "+e[13]+", "+e[14]+", "+e[15]+")"},typeof e!="undefined"&&(e.mat4=c);var h={};h.create=function(){var e=new n(4);return e[0]=0,e[1]=0,e[2]=0,e[3]=1,e},h.rotationTo=function(){var e=o.create(),t=o.fromValues(1,0,0),n=o.fromValues(0,1,0);return function(r,i,s){var u=o.dot(i,s);return u<-0.999999?(o.cross(e,t,i),o.length(e)<1e-6&&o.cross(e,n,i),o.normalize(e,e),h.setAxisAngle(r,e,Math.PI),r):u>.999999?(r[0]=0,r[1]=0,r[2]=0,r[3]=1,r):(o.cross(e,i,s),r[0]=e[0],r[1]=e[1],r[2]=e[2],r[3]=1+u,h.normalize(r,r))}}(),h.setAxes=function(){var e=l.create();return function(t,n,r,i){return e[0]=r[0],e[3]=r[1],e[6]=r[2],e[1]=i[0],e[4]=i[1],e[7]=i[2],e[2]=n[0],e[5]=n[1],e[8]=n[2],h.normalize(t,h.fromMat3(t,e))}}(),h.clone=u.clone,h.fromValues=u.fromValues,h.copy=u.copy,h.set=u.set,h.identity=function(e){return e[0]=0,e[1]=0,e[2]=0,e[3]=1,e},h.setAxisAngle=function(e,t,n){n*=.5;var r=Math.sin(n);return e[0]=r*t[0],e[1]=r*t[1],e[2]=r*t[2],e[3]=Math.cos(n),e},h.add=u.add,h.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=n[0],a=n[1],f=n[2],l=n[3];return e[0]=r*l+o*u+i*f-s*a,e[1]=i*l+o*a+s*u-r*f,e[2]=s*l+o*f+r*a-i*u,e[3]=o*l-r*u-i*a-s*f,e},h.mul=h.multiply,h.scale=u.scale,h.rotateX=function(e,t,n){n*=.5;var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a+o*u,e[1]=i*a+s*u,e[2]=s*a-i*u,e[3]=o*a-r*u,e},h.rotateY=function(e,t,n){n*=.5;var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a-s*u,e[1]=i*a+o*u,e[2]=s*a+r*u,e[3]=o*a-i*u,e},h.rotateZ=function(e,t,n){n*=.5;var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a+i*u,e[1]=i*a-r*u,e[2]=s*a+o*u,e[3]=o*a-s*u,e},h.calculateW=function(e,t){var n=t[0],r=t[1],i=t[2];return e[0]=n,e[1]=r,e[2]=i,e[3]=-Math.sqrt(Math.abs(1-n*n-r*r-i*i)),e},h.dot=u.dot,h.lerp=u.lerp,h.slerp=function(e,t,n,r){var i=t[0],s=t[1],o=t[2],u=t[3],a=n[0],f=n[1],l=n[2],c=n[3],h,p,d,v,m;return p=i*a+s*f+o*l+u*c,p<0&&(p=-p,a=-a,f=-f,l=-l,c=-c),1-p>1e-6?(h=Math.acos(p),d=Math.sin(h),v=Math.sin((1-r)*h)/d,m=Math.sin(r*h)/d):(v=1-r,m=r),e[0]=v*i+m*a,e[1]=v*s+m*f,e[2]=v*o+m*l,e[3]=v*u+m*c,e},h.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n*n+r*r+i*i+s*s,u=o?1/o:0;return e[0]=-n*u,e[1]=-r*u,e[2]=-i*u,e[3]=s*u,e},h.conjugate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e[3]=t[3],e},h.length=u.length,h.len=h.length,h.squaredLength=u.squaredLength,h.sqrLen=h.squaredLength,h.normalize=u.normalize,h.fromMat3=function(){var e=typeof Int8Array!="undefined"?new Int8Array([1,2,0]):[1,2,0];return function(t,n){var r=n[0]+n[4]+n[8],i;if(r>0)i=Math.sqrt(r+1),t[3]=.5*i,i=.5/i,t[0]=(n[7]-n[5])*i,t[1]=(n[2]-n[6])*i,t[2]=(n[3]-n[1])*i;else{var s=0;n[4]>n[0]&&(s=1),n[8]>n[s*3+s]&&(s=2);var o=e[s],u=e[o];i=Math.sqrt(n[s*3+s]-n[o*3+o]-n[u*3+u]+1),t[s]=.5*i,i=.5/i,t[3]=(n[u*3+o]-n[o*3+u])*i,t[o]=(n[o*3+s]+n[s*3+o])*i,t[u]=(n[u*3+s]+n[s*3+u])*i}return t}}(),h.str=function(e){return"quat("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+")"},typeof e!="undefined"&&(e.quat=h)}(t.exports)})(this);

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/mapbox-gl.js":[function(require,module,exports){
'use strict';

if (typeof window === 'undefined') {
    new (require('./source/worker'))(self);
} else {
    // jshint -W079
    var mapboxgl = module.exports = window.mapboxgl = {};

    mapboxgl.Map = require('./ui/map');
    mapboxgl.Navigation = require('./ui/control/navigation');
    mapboxgl.Attribution = require('./ui/control/attribution');

    mapboxgl.Source = require('./source/source');
    mapboxgl.GeoJSONSource = require('./source/geojson_source');
    mapboxgl.VideoSource = require('./source/video_source');

    mapboxgl.Style = require('./style/style');

    mapboxgl.LatLng = require('./geo/lat_lng');
    mapboxgl.LatLngBounds = require('./geo/lat_lng_bounds');
    mapboxgl.Point = require('point-geometry');

    mapboxgl.Evented = require('./util/evented');
    mapboxgl.util = require('./util/util');

    var browser = require('./util/browser');
    mapboxgl.util.supported = browser.supported;

    var ajax = require('./util/ajax');
    mapboxgl.util.getJSON = ajax.getJSON;
    mapboxgl.util.getArrayBuffer = ajax.getArrayBuffer;

    var config = require('./util/config');
    mapboxgl.config = config;

    Object.defineProperty(mapboxgl, 'accessToken', {
        get: function() { return config.ACCESS_TOKEN; },
        set: function(token) { config.ACCESS_TOKEN = token; }
    });
}

},{"./geo/lat_lng":"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/lat_lng.js","./geo/lat_lng_bounds":"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/lat_lng_bounds.js","./source/geojson_source":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/geojson_source.js","./source/source":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/source.js","./source/video_source":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/video_source.js","./source/worker":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/worker.js","./style/style":"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/style.js","./ui/control/attribution":"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/control/attribution.js","./ui/control/navigation":"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/control/navigation.js","./ui/map":"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/map.js","./util/ajax":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/ajax.js","./util/browser":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/browser.js","./util/config":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/config.js","./util/evented":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/evented.js","./util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/draw_background.js":[function(require,module,exports){
'use strict';

var mat3 = require('../lib/glmatrix').mat3;

module.exports = drawBackground;

function drawBackground(gl, painter, bucket, layerStyle, posMatrix, params, imageSprite) {
    var color = layerStyle['background-color'];
    var image = layerStyle['background-image'];
    var opacity = layerStyle['background-opacity'];
    var shader;

    if (image) {
        // Draw texture fill
        var imagePos = imageSprite.getPosition(image, true);
        if (!imagePos) return;

        shader = painter.patternShader;
        gl.switchShader(shader, posMatrix);
        gl.uniform1i(shader.u_image, 0);
        gl.uniform2fv(shader.u_pattern_tl, imagePos.tl);
        gl.uniform2fv(shader.u_pattern_br, imagePos.br);
        gl.uniform1f(shader.u_mix, painter.transform.zoomFraction);
        gl.uniform1f(shader.u_opacity, opacity);

        var transform = painter.transform;
        var size = imagePos.size;
        var center = transform.locationCoordinate(transform.center);
        var scale = 1 / Math.pow(2, transform.zoomFraction);
        var matrix = mat3.create();

        mat3.scale(matrix, matrix, [
            1 / size[0],
            1 / size[1]
        ]);
        mat3.translate(matrix, matrix, [
            (center.column * transform.tileSize) % size[0],
            (center.row    * transform.tileSize) % size[1]
        ]);
        mat3.rotate(matrix, matrix, -transform.angle);
        mat3.scale(matrix, matrix, [
            scale * transform.width  / 2,
           -scale * transform.height / 2
        ]);

        gl.uniformMatrix3fv(shader.u_patternmatrix, false, matrix);

        imageSprite.bind(gl, true);

    } else {
        // Draw filling rectangle.
        shader = painter.fillShader;
        gl.switchShader(shader, params.padded || posMatrix);
        gl.uniform4fv(shader.u_color, color);
    }

    gl.disable(gl.STENCIL_TEST);
    gl.bindBuffer(gl.ARRAY_BUFFER, painter.backgroundBuffer);
    gl.vertexAttribPointer(shader.a_pos, painter.backgroundBuffer.itemSize, gl.SHORT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, painter.backgroundBuffer.itemCount);
    gl.enable(gl.STENCIL_TEST);

    gl.stencilMask(0x00);
    gl.stencilFunc(gl.EQUAL, 0x80, 0x80);
}

},{"../lib/glmatrix":"/home/pnorman/vector_tiles/mapbox-gl-js/js/lib/glmatrix.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/draw_debug.js":[function(require,module,exports){
'use strict';

var textVertices = require('../lib/debugtext');
var browser = require('../util/browser');

module.exports = drawDebug;

function drawDebug(gl, painter, tile, params) {
    // Blend to the front, not the back.
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.switchShader(painter.debugShader, painter.tile.posMatrix, painter.tile.exMatrix);

    // draw bounding rectangle
    gl.bindBuffer(gl.ARRAY_BUFFER, painter.debugBuffer);
    gl.vertexAttribPointer(painter.debugShader.a_pos, painter.debugBuffer.itemSize, gl.SHORT, false, 0, 0);
    gl.uniform4f(painter.debugShader.u_color, 1, 0, 0, 1);
    gl.lineWidth(4);
    gl.drawArrays(gl.LINE_STRIP, 0, painter.debugBuffer.itemCount);

    // draw tile coordinate
    var coord = params.z + '/' + params.x + '/' + params.y;

    var vertices = textVertices(coord, 50, 200, 5);

    gl.bindBuffer(gl.ARRAY_BUFFER, painter.debugTextBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Int16Array(vertices), gl.STREAM_DRAW);
    gl.vertexAttribPointer(painter.debugShader.a_pos, painter.debugTextBuffer.itemSize, gl.SHORT, false, 0, 0);
    gl.lineWidth(8 * browser.devicePixelRatio);
    gl.uniform4f(painter.debugShader.u_color, 1, 1, 1, 1);
    gl.drawArrays(gl.LINES, 0, vertices.length / painter.debugTextBuffer.itemSize);
    gl.lineWidth(2 * browser.devicePixelRatio);
    gl.uniform4f(painter.debugShader.u_color, 0, 0, 0, 1);
    gl.drawArrays(gl.LINES, 0, vertices.length / painter.debugTextBuffer.itemSize);

    // Revert blending mode to blend to the back.
    gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);
}

},{"../lib/debugtext":"/home/pnorman/vector_tiles/mapbox-gl-js/js/lib/debugtext.js","../util/browser":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/browser.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/draw_fill.js":[function(require,module,exports){
'use strict';

var browser = require('../util/browser');
var mat3 = require('../lib/glmatrix').mat3;

module.exports = drawFill;

function drawFill(gl, painter, bucket, layerStyle, posMatrix, params, imageSprite) {

    var translatedPosMatrix = painter.translateMatrix(posMatrix, params.z, layerStyle['fill-translate'], layerStyle['fill-translate-anchor']);

    var color = layerStyle['fill-color'];

    var vertex, elements, group, count;

    // Draw the stencil mask.

    // We're only drawing to the first seven bits (== support a maximum of
    // 127 overlapping polygons in one place before we get rendering errors).
    gl.stencilMask(0x3F);
    gl.clear(gl.STENCIL_BUFFER_BIT);

    // Draw front facing triangles. Wherever the 0x80 bit is 1, we are
    // increasing the lower 7 bits by one if the triangle is a front-facing
    // triangle. This means that all visible polygons should be in CCW
    // orientation, while all holes (see below) are in CW orientation.
    gl.stencilFunc(gl.NOTEQUAL, 0x80, 0x80);

    // When we do a nonzero fill, we count the number of times a pixel is
    // covered by a counterclockwise polygon, and subtract the number of
    // times it is "uncovered" by a clockwise polygon.
    gl.stencilOpSeparate(gl.FRONT, gl.INCR_WRAP, gl.KEEP, gl.KEEP);
    gl.stencilOpSeparate(gl.BACK, gl.DECR_WRAP, gl.KEEP, gl.KEEP);

    // When drawing a shape, we first draw all shapes to the stencil buffer
    // and incrementing all areas where polygons are
    gl.colorMask(false, false, false, false);

    // Draw the actual triangle fan into the stencil buffer.
    gl.switchShader(painter.fillShader, translatedPosMatrix, painter.tile.exMatrix);

    // Draw all buffers
    vertex = bucket.buffers.fillVertex;
    vertex.bind(gl);
    elements = bucket.buffers.fillElement;
    elements.bind(gl);

    var offset, elementOffset;
    for (var i = 0; i < bucket.elementGroups.groups.length; i++) {
        group = bucket.elementGroups.groups[i];
        offset = group.vertexStartIndex * vertex.itemSize;
        gl.vertexAttribPointer(painter.fillShader.a_pos, 2, gl.SHORT, false, 4, offset + 0);

        count = group.elementLength * 3;
        elementOffset = group.elementStartIndex * elements.itemSize;
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, elementOffset);
    }

    // Now that we have the stencil mask in the stencil buffer, we can start
    // writing to the color buffer.
    gl.colorMask(true, true, true, true);

    // From now on, we don't want to update the stencil buffer anymore.
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    gl.stencilMask(0x0);

    var strokeColor = layerStyle['fill-outline-color'];

    // Because we're drawing top-to-bottom, and we update the stencil mask
    // below, we have to draw the outline first (!)
    if (layerStyle['fill-antialias'] === true && params.antialiasing && !(layerStyle['fill-image'] && !strokeColor)) {
        gl.switchShader(painter.outlineShader, translatedPosMatrix, painter.tile.exMatrix);
        gl.lineWidth(2 * browser.devicePixelRatio);

        if (strokeColor) {
            // If we defined a different color for the fill outline, we are
            // going to ignore the bits in 0x3F and just care about the global
            // clipping mask.
            gl.stencilFunc(gl.EQUAL, 0x80, 0x80);
        } else {
            // Otherwise, we only want to draw the antialiased parts that are
            // *outside* the current shape. This is important in case the fill
            // or stroke color is translucent. If we wouldn't clip to outside
            // the current shape, some pixels from the outline stroke overlapped
            // the (non-antialiased) fill.
            gl.stencilFunc(gl.EQUAL, 0x80, 0xBF);
        }

        gl.uniform2f(painter.outlineShader.u_world, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.uniform4fv(painter.outlineShader.u_color, strokeColor ? strokeColor : color);

        // Draw all buffers
        vertex = bucket.buffers.fillVertex;
        elements = bucket.buffers.outlineElement;
        elements.bind(gl);

        for (var k = 0; k < bucket.elementGroups.groups.length; k++) {
            group = bucket.elementGroups.groups[k];
            offset = group.vertexStartIndex * vertex.itemSize;
            gl.vertexAttribPointer(painter.outlineShader.a_pos, 2, gl.SHORT, false, 4, offset + 0);

            count = group.secondElementLength * 2;
            elementOffset = group.secondElementStartIndex * elements.itemSize;
            gl.drawElements(gl.LINES, count, gl.UNSIGNED_SHORT, elementOffset);
        }
    }

    var image = layerStyle['fill-image'];
    var opacity = layerStyle['fill-opacity'] || 1;
    var shader;

    if (image) {
        // Draw texture fill
        var imagePos = imageSprite.getPosition(image, true);
        if (!imagePos) return;

        shader = painter.patternShader;
        gl.switchShader(shader, posMatrix);
        gl.uniform1i(shader.u_image, 0);
        gl.uniform2fv(shader.u_pattern_tl, imagePos.tl);
        gl.uniform2fv(shader.u_pattern_br, imagePos.br);
        gl.uniform1f(shader.u_mix, painter.transform.zoomFraction);
        gl.uniform1f(shader.u_opacity, opacity);

        var factor = 8 / Math.pow(2, painter.transform.tileZoom - params.z);

        var matrix = mat3.create();
        mat3.scale(matrix, matrix, [
            1 / (imagePos.size[0] * factor),
            1 / (imagePos.size[1] * factor)
        ]);

        gl.uniformMatrix3fv(shader.u_patternmatrix, false, matrix);

        imageSprite.bind(gl, true);

    } else {
        // Draw filling rectangle.
        shader = painter.fillShader;
        gl.switchShader(shader, params.padded || posMatrix);
        gl.uniform4fv(shader.u_color, color);
    }

    // Only draw regions that we marked
    gl.stencilFunc(gl.NOTEQUAL, 0x0, 0x3F);
    gl.bindBuffer(gl.ARRAY_BUFFER, painter.tileExtentBuffer);
    gl.vertexAttribPointer(shader.a_pos, painter.tileExtentBuffer.itemSize, gl.SHORT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, painter.tileExtentBuffer.itemCount);

    gl.stencilMask(0x00);
    gl.stencilFunc(gl.EQUAL, 0x80, 0x80);
}

},{"../lib/glmatrix":"/home/pnorman/vector_tiles/mapbox-gl-js/js/lib/glmatrix.js","../util/browser":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/browser.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/draw_line.js":[function(require,module,exports){
'use strict';

var browser = require('../util/browser');

module.exports = function drawLine(gl, painter, bucket, layerStyle, posMatrix, params, imageSprite) {
    // don't draw zero-width lines
    if (layerStyle['line-width'] <= 0) return;

    var antialiasing = 1 / browser.devicePixelRatio;
    var width = layerStyle['line-width'];
    var offset = layerStyle['line-gap-width'] > 0 ? layerStyle['line-gap-width'] / 2 + width / 2 : 0;
    var blur = layerStyle['line-blur'] + antialiasing;

    var inset = Math.max(-1, offset - width / 2 - antialiasing / 2) + 1;
    var outset = offset + width / 2 + antialiasing / 2;

    var color = layerStyle['line-color'];
    var ratio = painter.transform.scale / (1 << params.z) / 8;
    var vtxMatrix = painter.translateMatrix(posMatrix, params.z, layerStyle['line-translate'], layerStyle['line-translate-anchor']);

    var shader;

    var imagePos = layerStyle['line-image'] && imageSprite.getPosition(layerStyle['line-image']);
    if (imagePos) {
        var factor = 8 / Math.pow(2, painter.transform.tileZoom - params.z);

        imageSprite.bind(gl, true);

        shader = painter.linepatternShader;
        gl.switchShader(shader, vtxMatrix, painter.tile.exMatrix);

        gl.uniform2fv(shader.u_linewidth, [ outset, inset ]);
        gl.uniform1f(shader.u_ratio, ratio);
        gl.uniform1f(shader.u_blur, blur);

        gl.uniform2fv(shader.u_pattern_size, [imagePos.size[0] * factor, imagePos.size[1] ]);
        gl.uniform2fv(shader.u_pattern_tl, imagePos.tl);
        gl.uniform2fv(shader.u_pattern_br, imagePos.br);
        gl.uniform1f(shader.u_fade, painter.transform.zoomFraction);

    } else {
        shader = painter.lineShader;
        gl.switchShader(shader, vtxMatrix, painter.tile.exMatrix);

        gl.uniform2fv(shader.u_linewidth, [ outset, inset ]);
        gl.uniform1f(shader.u_ratio, ratio);
        gl.uniform1f(shader.u_blur, blur);

        gl.uniform4fv(shader.u_color, color);
        gl.uniform2fv(shader.u_dasharray, layerStyle['line-dasharray']);
    }

    var vertex = bucket.buffers.lineVertex;
    vertex.bind(gl);
    var element = bucket.buffers.lineElement;
    element.bind(gl);

    var groups = bucket.elementGroups.groups;
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var vtxOffset = group.vertexStartIndex * vertex.itemSize;
        gl.vertexAttribPointer(shader.a_pos, 4, gl.SHORT, false, 8, vtxOffset + 0);
        gl.vertexAttribPointer(shader.a_extrude, 2, gl.BYTE, false, 8, vtxOffset + 6);
        gl.vertexAttribPointer(shader.a_linesofar, 2, gl.SHORT, false, 8, vtxOffset + 4);

        var count = group.elementLength * 3;
        var elementOffset = group.elementStartIndex * element.itemSize;
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, elementOffset);
    }

};

},{"../util/browser":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/browser.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/draw_raster.js":[function(require,module,exports){
'use strict';

var TileCoord = require('../source/tile_coord');
var PrerenderedTexture = require('./prerendered');
var mat4 = require('../lib/glmatrix').mat4;
var util = require('../util/util');

module.exports = drawRaster;

function drawRaster(gl, painter, bucket, layerStyle, params, style, layer, tile) {
    var texture;

    if (layer && layer.layers) {
        if (!bucket.prerendered) {
            bucket.prerendered = new PrerenderedTexture(gl, bucket.layoutProperties, painter);
            bucket.prerendered.bindFramebuffer();

            gl.clearStencil(0x80);
            gl.stencilMask(0xFF);
            gl.clear(gl.STENCIL_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
            gl.stencilMask(0x00);

            gl.viewport(0, 0, bucket.prerendered.size, bucket.prerendered.size);

            var buffer = bucket.prerendered.buffer * 4096;

            var matrix = mat4.create();
            mat4.ortho(matrix, -buffer, 4096 + buffer, -4096 - buffer, buffer, 0, 1);
            mat4.translate(matrix, matrix, [0, -4096, 0]);

            params.padded = mat4.create();
            mat4.ortho(params.padded, 0, 4096, -4096, 0, 0, 1);
            mat4.translate(params.padded, params.padded, [0, -4096, 0]);

            painter.drawLayers(tile, style, layer.layers, params, matrix);

            delete params.padded;

            if (bucket.layoutProperties['raster-blur'] > 0) {
                bucket.prerendered.blur(painter, bucket.layoutProperties['raster-blur']);
            }

            bucket.prerendered.unbindFramebuffer();
            gl.viewport(0, 0, painter.width, painter.height);
        }

        texture = bucket.prerendered;
    } else {
        texture = bucket.tile;
    }

    gl.disable(gl.STENCIL_TEST);

    var shader = painter.rasterShader;
    gl.switchShader(shader, painter.tile.posMatrix, painter.tile.exMatrix);

    // color parameters
    gl.uniform1f(shader.u_brightness_low, layerStyle['raster-brightness'][0]);
    gl.uniform1f(shader.u_brightness_high, layerStyle['raster-brightness'][1]);
    gl.uniform1f(shader.u_saturation_factor, saturationFactor(layerStyle['raster-saturation']));
    gl.uniform1f(shader.u_contrast_factor, contrastFactor(layerStyle['raster-contrast']));
    gl.uniform3fv(shader.u_spin_weights, spinWeights(layerStyle['raster-hue-rotate']));

    var parentTile, opacities;
    if (layer && layer.layers) {
        parentTile = null;
        opacities = [layerStyle['raster-opacity'], 0];
    } else {
        parentTile = texture.source && texture.source._findLoadedParent(texture.id, 0, {});
        opacities = getOpacities(texture, parentTile, layerStyle);
    }
    var parentScaleBy, parentTL;

    gl.activeTexture(gl.TEXTURE0);
    texture.bind(gl);

    if (parentTile) {
        gl.activeTexture(gl.TEXTURE1);
        parentTile.bind(gl);

        var tilePos = TileCoord.fromID(texture.id);
        var parentPos = parentTile && TileCoord.fromID(parentTile.id);
        parentScaleBy = Math.pow(2, parentPos.z - tilePos.z);
        parentTL = [tilePos.x * parentScaleBy % 1, tilePos.y * parentScaleBy % 1];
    } else {
        opacities[1] = 0;
    }

    var bufferScale = bucket.prerendered ? (4096 * (1 + 2 * bucket.prerendered.buffer)) / 4096 : 1;

    // cross-fade parameters
    gl.uniform2fv(shader.u_tl_parent, parentTL || [0, 0]);
    gl.uniform1f(shader.u_scale_parent, parentScaleBy || 1);
    gl.uniform1f(shader.u_buffer_scale, bufferScale);
    gl.uniform1f(shader.u_opacity0, opacities[0]);
    gl.uniform1f(shader.u_opacity1, opacities[1]);
    gl.uniform1i(shader.u_image0, 0);
    gl.uniform1i(shader.u_image1, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, texture.boundsBuffer || painter.tileExtentBuffer);

    gl.vertexAttribPointer(shader.a_pos,         2, gl.SHORT, false, 8, 0);
    gl.vertexAttribPointer(shader.a_texture_pos, 2, gl.SHORT, false, 8, 4);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.enable(gl.STENCIL_TEST);
}

function spinWeights(angle) {
    angle *= Math.PI / 180;
    var s = Math.sin(angle);
    var c = Math.cos(angle);
    return [
        (2 * c + 1) / 3,
        (-Math.sqrt(3) * s - c + 1) / 3,
        (Math.sqrt(3) * s - c + 1) / 3
    ];
}

function contrastFactor(contrast) {
    return contrast > 0 ?
        1 / (1 - contrast) :
        1 + contrast;
}

function saturationFactor(saturation) {
    return saturation > 0 ?
        1 - 1 / (1.001 - saturation) :
        -saturation;
}

function getOpacities(tile, parentTile, layerStyle) {
    if (!tile.source) return [1, 0];

    var now = new Date().getTime();

    var fadeDuration = layerStyle['raster-fade-duration'];
    var sinceTile = (now - tile.timeAdded) / fadeDuration;
    var sinceParent = parentTile ? (now - parentTile.timeAdded) / fadeDuration : -1;

    var tilePos = TileCoord.fromID(tile.id);
    var parentPos = parentTile && TileCoord.fromID(parentTile.id);

    var idealZ = tile.source._coveringZoomLevel();
    var parentFurther = parentTile ? Math.abs(parentPos.z - idealZ) > Math.abs(tilePos.z - idealZ) : false;

    var opacity = [];
    if (!parentTile || parentFurther) {
        // if no parent or parent is older
        opacity[0] = util.clamp(sinceTile, 0, 1);
        opacity[1] = 1 - opacity[0];
    } else {
        // parent is younger, zooming out
        opacity[0] = util.clamp(1 - sinceParent, 0, 1);
        opacity[1] = 1 - opacity[0];
    }

    var op = layerStyle['raster-opacity'];
    opacity[0] *= op;
    opacity[1] *= op;

    return opacity;
}

},{"../lib/glmatrix":"/home/pnorman/vector_tiles/mapbox-gl-js/js/lib/glmatrix.js","../source/tile_coord":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/tile_coord.js","../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","./prerendered":"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/prerendered.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/draw_symbol.js":[function(require,module,exports){
'use strict';

var browser = require('../util/browser');
var mat4 = require('../lib/glmatrix').mat4;

module.exports = drawSymbols;

function drawSymbols(gl, painter, bucket, layerStyle, posMatrix, params, imageSprite) {
    gl.disable(gl.STENCIL_TEST);
    if (bucket.elementGroups.text.groups.length) {
        drawSymbol(gl, painter, bucket, layerStyle, posMatrix, params, imageSprite, 'text');
    }
    if (bucket.elementGroups.icon.groups.length) {
        drawSymbol(gl, painter, bucket, layerStyle, posMatrix, params, imageSprite, 'icon');
    }
    gl.enable(gl.STENCIL_TEST);
}

var defaultSizes = {
    icon: 1,
    text: 24
};

function drawSymbol(gl, painter, bucket, layerStyle, posMatrix, params, imageSprite, prefix) {

    posMatrix = painter.translateMatrix(posMatrix, params.z, layerStyle[prefix + '-translate'], layerStyle[prefix + '-translate-anchor']);

    var layoutProperties = bucket.layoutProperties;

    var exMatrix = mat4.clone(painter.projectionMatrix);
    var alignedWithMap = layoutProperties[prefix + '-rotation-alignment'] === 'map';
    var angleOffset = (alignedWithMap ? painter.transform.angle : 0);

    if (angleOffset) {
        mat4.rotateZ(exMatrix, exMatrix, angleOffset);
    }

    // If layerStyle.size > layoutProperties[prefix + '-max-size'] then labels may collide
    var fontSize = layerStyle[prefix + '-size'] || layoutProperties[prefix + '-max-size'];
    var fontScale = fontSize / defaultSizes[prefix];
    mat4.scale(exMatrix, exMatrix, [ fontScale, fontScale, 1 ]);

    var text = prefix === 'text';
    var sdf = text || bucket.elementGroups.sdfIcons;
    var shader, buffer, texsize;

    if (!text && !imageSprite.loaded())
        return;

    gl.activeTexture(gl.TEXTURE0);

    if (sdf) {
        shader = painter.sdfShader;
    } else {
        shader = painter.iconShader;
    }

    if (text) {
        painter.glyphAtlas.updateTexture(gl);
        buffer = bucket.buffers.glyphVertex;
        texsize = [painter.glyphAtlas.width / 4, painter.glyphAtlas.height / 4];
    } else {
        imageSprite.bind(gl, alignedWithMap || params.rotating || params.zooming || fontScale != 1 || sdf);
        buffer = bucket.buffers.iconVertex;
        texsize = [imageSprite.img.width, imageSprite.img.height];
    }

    gl.switchShader(shader, posMatrix, exMatrix);
    gl.uniform1i(shader.u_texture, 0);
    gl.uniform2fv(shader.u_texsize, texsize);

    buffer.bind(gl, shader);

    // Convert the -pi..pi to an int8 range.
    var angle = Math.round(painter.transform.angle / Math.PI * 128);

    // adjust min/max zooms for variable font sies
    var zoomAdjust = Math.log(fontSize / layoutProperties[prefix + '-max-size']) / Math.LN2 || 0;

    var flip = alignedWithMap && layoutProperties[prefix + '-keep-upright'];
    gl.uniform1f(shader.u_flip, flip ? 1 : 0);
    gl.uniform1f(shader.u_angle, (angle + 256) % 256);
    gl.uniform1f(shader.u_zoom, (painter.transform.zoom - zoomAdjust) * 10); // current zoom level

    var f = painter.frameHistory.getFadeProperties(300);
    gl.uniform1f(shader.u_fadedist, f.fadedist * 10);
    gl.uniform1f(shader.u_minfadezoom, Math.floor(f.minfadezoom * 10));
    gl.uniform1f(shader.u_maxfadezoom, Math.floor(f.maxfadezoom * 10));
    gl.uniform1f(shader.u_fadezoom, (painter.transform.zoom + f.bump) * 10);

    var begin = bucket.elementGroups[prefix].groups[0].vertexStartIndex,
        len = bucket.elementGroups[prefix].groups[0].vertexLength;

    if (sdf) {
        var sdfPx = 8;
        var blurOffset = 1.19;
        var haloOffset = 6;
        var gamma = 0.105 * defaultSizes[prefix] / fontSize / browser.devicePixelRatio;

        gl.uniform1f(shader.u_gamma, gamma);
        gl.uniform4fv(shader.u_color, layerStyle[prefix + '-color']);
        gl.uniform1f(shader.u_buffer, (256 - 64) / 256);
        gl.drawArrays(gl.TRIANGLES, begin, len);

        if (layerStyle[prefix + '-halo-color']) {
            // Draw halo underneath the text.
            gl.uniform1f(shader.u_gamma, layerStyle[prefix + '-halo-blur'] * blurOffset / fontScale / sdfPx + gamma);
            gl.uniform4fv(shader.u_color, layerStyle[prefix + '-halo-color']);
            gl.uniform1f(shader.u_buffer, (haloOffset - layerStyle[prefix + '-halo-width'] / fontScale) / sdfPx);
            gl.drawArrays(gl.TRIANGLES, begin, len);
        }
    } else {
        gl.uniform1f(shader.u_opacity, layerStyle['icon-opacity']);
        gl.drawArrays(gl.TRIANGLES, begin, len);
    }
}

},{"../lib/glmatrix":"/home/pnorman/vector_tiles/mapbox-gl-js/js/lib/glmatrix.js","../util/browser":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/browser.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/draw_vertices.js":[function(require,module,exports){
'use strict';

var browser = require('../util/browser');
var mat4 = require('../lib/glmatrix').mat4;

module.exports = drawVertices;

function drawVertices(gl, painter, bucket) {
    // Blend to the front, not the back.
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.switchShader(painter.dotShader, painter.tile.posMatrix, painter.tile.exMatrix);

    // // Draw debug points.
    gl.uniform1f(painter.dotShader.u_size, 4 * browser.devicePixelRatio);
    gl.uniform1f(painter.dotShader.u_blur, 0.25);
    gl.uniform4fv(painter.dotShader.u_color, [0.25, 0, 0, 0.25]);

    // Draw the actual triangle fan into the stencil buffer.

    var vertex, groups, group, begin, count;

    // Draw all buffers
    if (bucket.layoutProperties.fill) {
        vertex = bucket.buffers.fillVertex;
        vertex.bind(gl);
        groups = bucket.elementGroups.groups;
        for (var i = 0; i < groups.length; i++) {
            group = groups[i];
            begin = group.vertexStartIndex;
            count = group.vertexLength;
            gl.vertexAttribPointer(painter.dotShader.a_pos, 2, gl.SHORT, false, 0, 0);
            gl.drawArrays(gl.POINTS, begin, count);
        }
    }

    var newPosMatrix = mat4.clone(painter.tile.posMatrix);
    mat4.scale(newPosMatrix, newPosMatrix, [0.5, 0.5, 1]);

    gl.switchShader(painter.dotShader, newPosMatrix, painter.tile.exMatrix);

    // Draw all line buffers
    if (bucket.layoutProperties.line) {
        vertex = bucket.buffers.lineVertex;
        vertex.bind(gl);
        groups = bucket.elementGroups.groups;
        for (var k = 0; k < groups.length; k++) {
            group = groups[k];
            begin = group.vertexStartIndex;
            count = group.vertexLength;
            gl.vertexAttribPointer(painter.dotShader.a_pos, 2, gl.SHORT, false, 0, 0);
            gl.drawArrays(gl.POINTS, begin, count);
        }

    }

    // Revert blending mode to blend to the back.
    gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);
}

},{"../lib/glmatrix":"/home/pnorman/vector_tiles/mapbox-gl-js/js/lib/glmatrix.js","../util/browser":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/browser.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/frame_history.js":[function(require,module,exports){
'use strict';

module.exports = FrameHistory;

function FrameHistory() {
    this.frameHistory = [];
}

FrameHistory.prototype.getFadeProperties = function(duration) {
    if (duration === undefined) duration = 300;
    var currentTime = (new Date()).getTime();

    // Remove frames until only one is outside the duration, or until there are only three
    while (this.frameHistory.length > 3 && this.frameHistory[1].time + duration < currentTime) {
        this.frameHistory.shift();
    }

    if (this.frameHistory[1].time + duration < currentTime) {
        this.frameHistory[0].z = this.frameHistory[1].z;
    }

    var frameLen = this.frameHistory.length;
    if (frameLen < 3) console.warn('there should never be less than three frames in the history');

    // Find the range of zoom levels we want to fade between
    var startingZ = this.frameHistory[0].z,
        lastFrame = this.frameHistory[frameLen - 1],
        endingZ = lastFrame.z,
        lowZ = Math.min(startingZ, endingZ),
        highZ = Math.max(startingZ, endingZ);

    // Calculate the speed of zooming, and how far it would zoom in terms of zoom levels in one duration
    var zoomDiff = lastFrame.z - this.frameHistory[1].z,
        timeDiff = lastFrame.time - this.frameHistory[1].time;
    var fadedist = zoomDiff / (timeDiff / duration);

    if (isNaN(fadedist)) console.warn('fadedist should never be NaN');

    // At end of a zoom when the zoom stops changing continue pretending to zoom at that speed
    // bump is how much farther it would have been if it had continued zooming at the same rate
    var bump = (currentTime - lastFrame.time) / duration * fadedist;

    return {
        fadedist: fadedist,
        minfadezoom: lowZ,
        maxfadezoom: highZ,
        bump: bump
    };
};

// Record frame history that will be used to calculate fading params
FrameHistory.prototype.record = function(zoom) {
    var currentTime = (new Date()).getTime();

    // first frame ever
    if (!this.frameHistory.length) {
        this.frameHistory.push({time: 0, z: zoom }, {time: 0, z: zoom });
    }

    if (this.frameHistory.length === 2 || this.frameHistory[this.frameHistory.length - 1].z !== zoom) {
        this.frameHistory.push({
            time: currentTime,
            z: zoom
        });
    }
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/gl_util.js":[function(require,module,exports){
'use strict';

var shaders = require('./shaders');

exports.extend = function(context) {
    context.getShader = function(name, type) {
        var kind = type == this.FRAGMENT_SHADER ? 'fragment' : 'vertex';
        if (!shaders[name] || !shaders[name][kind]) {
            throw new Error("Could not find shader " + name);
        }

        var shader = this.createShader(type);
        this.shaderSource(shader, shaders[name][kind]);
        this.compileShader(shader);
        if (!this.getShaderParameter(shader, this.COMPILE_STATUS)) {
            throw new Error(this.getShaderInfoLog(shader));
        }
        return shader;
    };

    context.initializeShader = function(name, attributes, uniforms) {
        var shader = {
            program: this.createProgram(),
            fragment: this.getShader(name, this.FRAGMENT_SHADER),
            vertex: this.getShader(name, this.VERTEX_SHADER),
            attributes: []
        };
        this.attachShader(shader.program, shader.vertex);
        this.attachShader(shader.program, shader.fragment);
        this.linkProgram(shader.program);

        if (!this.getProgramParameter(shader.program, this.LINK_STATUS)) {
            console.error(this.getProgramInfoLog(shader.program));
            alert("Could not initialize shader " + name);
        } else {
            for (var i = 0; i < attributes.length; i++) {
                shader[attributes[i]] = this.getAttribLocation(shader.program, attributes[i]);
                shader.attributes.push(shader[attributes[i]]);
            }
            for (var k = 0; k < uniforms.length; k++) {
                shader[uniforms[k]] = this.getUniformLocation(shader.program, uniforms[k]);
            }
        }

        return shader;
    };

    // Switches to a different shader program.
    context.switchShader = function(shader, posMatrix, exMatrix) {
        if (!posMatrix) {
            console.trace('posMatrix does not have required argument');
        }

        if (this.currentShader !== shader) {
            this.useProgram(shader.program);

            // Disable all attributes from the existing shader that aren't used in
            // the new shader. Note: attribute indices are *not* program specific!
            var enabled = this.currentShader ? this.currentShader.attributes : [];
            var required = shader.attributes;

            for (var i = 0; i < enabled.length; i++) {
                if (required.indexOf(enabled[i]) < 0) {
                    this.disableVertexAttribArray(enabled[i]);
                }
            }

            // Enable all attributes for the new shader.
            for (var j = 0; j < required.length; j++) {
                if (enabled.indexOf(required[j]) < 0) {
                    this.enableVertexAttribArray(required[j]);
                }
            }

            this.currentShader = shader;
        }

        // Update the matrices if necessary. Note: This relies on object identity!
        // This means changing the matrix values without the actual matrix object
        // will FAIL to update the matrix properly.
        if (shader.posMatrix !== posMatrix) {
            this.uniformMatrix4fv(shader.u_matrix, false, posMatrix);
            shader.posMatrix = posMatrix;
        }
        if (exMatrix && shader.exMatrix !== exMatrix && shader.u_exmatrix) {
            this.uniformMatrix4fv(shader.u_exmatrix, false, exMatrix);
            shader.exMatrix = exMatrix;
        }
    };

    return context;
};

},{"./shaders":"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/shaders.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/painter.js":[function(require,module,exports){
'use strict';

var glutil = require('./gl_util');
var browser = require('../util/browser');
var GlyphAtlas = require('../symbol/glyph_atlas');
var mat4 = require('../lib/glmatrix').mat4;
var FrameHistory = require('./frame_history');

var drawSymbol = require('./draw_symbol');
var drawLine = require('./draw_line');
var drawFill = require('./draw_fill');
var drawRaster = require('./draw_raster');
var drawDebug = require('./draw_debug');
var drawBackground = require('./draw_background');
var drawVertices = require('./draw_vertices');

/*
 * Initialize a new painter object.
 *
 * @param {Canvas} gl an experimental-webgl drawing context
 */
module.exports = GLPainter;
function GLPainter(gl, transform) {
    this.gl = glutil.extend(gl);
    this.transform = transform;

    this.reusableTextures = {};
    this.preFbos = {};

    this.tileExtent = 4096;
    this.frameHistory = new FrameHistory();

    this.setup();
}

/*
 * Update the GL viewport, projection matrix, and transforms to compensate
 * for a new width and height value.
 */
GLPainter.prototype.resize = function(width, height) {
    var gl = this.gl;
    // Initialize projection matrix
    this.projectionMatrix = mat4.create();
    mat4.ortho(this.projectionMatrix, 0, width, height, 0, 0, -1);

    this.width = width * browser.devicePixelRatio;
    this.height = height * browser.devicePixelRatio;
    gl.viewport(0, 0, this.width, this.height);

};


GLPainter.prototype.setup = function() {
    var gl = this.gl;

    gl.verbose = true;

    // We are blending the new pixels *behind* the existing pixels. That way we can
    // draw front-to-back and use then stencil buffer to cull opaque pixels early.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);

    gl.enable(gl.STENCIL_TEST);

    this.glyphAtlas = new GlyphAtlas(1024, 1024);
    // this.glyphAtlas.debug = true;
    this.glyphAtlas.bind(gl);

    // Initialize shaders
    this.debugShader = gl.initializeShader('debug',
        ['a_pos'],
        ['u_matrix', 'u_pointsize', 'u_color']);

    this.gaussianShader = gl.initializeShader('gaussian',
        ['a_pos'],
        ['u_matrix', 'u_image', 'u_offset']);

    this.rasterShader = gl.initializeShader('raster',
        ['a_pos', 'a_texture_pos'],
        ['u_matrix', 'u_brightness_low', 'u_brightness_high', 'u_saturation_factor', 'u_spin_weights', 'u_contrast_factor', 'u_opacity0', 'u_opacity1', 'u_image0', 'u_image1', 'u_tl_parent', 'u_scale_parent', 'u_buffer_scale']);

    this.lineShader = gl.initializeShader('line',
        ['a_pos', 'a_extrude', 'a_linesofar'],
        ['u_matrix', 'u_exmatrix', 'u_linewidth', 'u_color', 'u_ratio', 'u_dasharray', 'u_blur']);

    this.linepatternShader = gl.initializeShader('linepattern',
        ['a_pos', 'a_extrude', 'a_linesofar'],
        ['u_matrix', 'u_exmatrix', 'u_linewidth', 'u_ratio', 'u_pattern_size', 'u_pattern_tl', 'u_pattern_br', 'u_point', 'u_blur', 'u_fade']);

    this.dotShader = gl.initializeShader('dot',
        ['a_pos'],
        ['u_matrix', 'u_size', 'u_color', 'u_blur']);

    this.sdfShader = gl.initializeShader('sdf',
        ['a_pos', 'a_tex', 'a_offset', 'a_angle', 'a_minzoom', 'a_maxzoom', 'a_rangeend', 'a_rangestart', 'a_labelminzoom'],
        ['u_matrix', 'u_exmatrix', 'u_texture', 'u_texsize', 'u_color', 'u_gamma', 'u_buffer', 'u_angle', 'u_zoom', 'u_flip', 'u_fadedist', 'u_minfadezoom', 'u_maxfadezoom', 'u_fadezoom']);

    this.iconShader = gl.initializeShader('icon',
        ['a_pos', 'a_tex', 'a_offset', 'a_angle', 'a_minzoom', 'a_maxzoom', 'a_rangeend', 'a_rangestart', 'a_labelminzoom'],
        ['u_matrix', 'u_exmatrix', 'u_texture', 'u_texsize', 'u_angle', 'u_zoom', 'u_flip', 'u_fadedist', 'u_minfadezoom', 'u_maxfadezoom', 'u_fadezoom', 'u_opacity']);

    this.outlineShader = gl.initializeShader('outline',
        ['a_pos'],
        ['u_matrix', 'u_color', 'u_world']
    );

    this.patternShader = gl.initializeShader('pattern',
        ['a_pos'],
        ['u_matrix', 'u_pattern_tl', 'u_pattern_br', 'u_mix', 'u_patternmatrix', 'u_opacity', 'u_image']
    );

    this.fillShader = gl.initializeShader('fill',
        ['a_pos'],
        ['u_matrix', 'u_color']
    );

    this.identityMatrix = mat4.create();

    // The backgroundBuffer is used when drawing to the full *canvas*
    this.backgroundBuffer = gl.createBuffer();
    this.backgroundBuffer.itemSize = 2;
    this.backgroundBuffer.itemCount = 4;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.backgroundBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Int16Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    // The tileExtentBuffer is used when drawing to a full *tile*
    this.tileExtentBuffer = gl.createBuffer();
    this.tileExtentBuffer.itemSize = 4;
    this.tileExtentBuffer.itemCount = 4;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tileExtentBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Int16Array([
        // tile coord x, tile coord y, texture coord x, texture coord y
                      0, 0,                    0, 0,
        this.tileExtent, 0,                32767, 0,
                      0, this.tileExtent,      0, 32767,
        this.tileExtent, this.tileExtent,  32767, 32767
    ]), gl.STATIC_DRAW);

    // The debugBuffer is used to draw tile outlines for debugging
    this.debugBuffer = gl.createBuffer();
    this.debugBuffer.itemSize = 2;
    this.debugBuffer.itemCount = 5;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.debugBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Int16Array([0, 0, 4095, 0, 4095, 4095, 0, 4095, 0, 0]), gl.STATIC_DRAW);

    // The debugTextBuffer is used to draw tile IDs for debugging
    this.debugTextBuffer = gl.createBuffer();
    this.debugTextBuffer.itemSize = 2;
};

/*
 * Reset the color buffers of the drawing canvas.
 */
GLPainter.prototype.clearColor = function() {
    var gl = this.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
};

/*
 * Reset the drawing canvas by clearing the stencil buffer so that we can draw
 * new tiles at the same location, while retaining previously drawn pixels.
 */
GLPainter.prototype.clearStencil = function() {
    var gl = this.gl;
    gl.clearStencil(0x0);
    gl.stencilMask(0xFF);
    gl.clear(gl.STENCIL_BUFFER_BIT);
};

GLPainter.prototype.drawClippingMask = function() {
    var gl = this.gl;
    gl.switchShader(this.fillShader, this.tile.posMatrix, this.tile.exMatrix);
    gl.colorMask(false, false, false, false);

    // Clear the entire stencil buffer, except for the 7th bit, which stores
    // the global clipping mask that allows us to avoid drawing in regions of
    // tiles we've already painted in.
    gl.clearStencil(0x0);
    gl.stencilMask(0xBF);
    gl.clear(gl.STENCIL_BUFFER_BIT);

    // The stencil test will fail always, meaning we set all pixels covered
    // by this geometry to 0x80. We use the highest bit 0x80 to mark the regions
    // we want to draw in. All pixels that have this bit *not* set will never be
    // drawn in.
    gl.stencilFunc(gl.EQUAL, 0xC0, 0x40);
    gl.stencilMask(0xC0);
    gl.stencilOp(gl.REPLACE, gl.KEEP, gl.KEEP);

    // Draw the clipping mask
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tileExtentBuffer);
    gl.vertexAttribPointer(this.fillShader.a_pos, this.tileExtentBuffer.itemSize, gl.SHORT, false, 8, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.tileExtentBuffer.itemCount);

    gl.stencilFunc(gl.EQUAL, 0x80, 0x80);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
    gl.stencilMask(0x00);
    gl.colorMask(true, true, true, true);
};

// Overridden by headless tests.
GLPainter.prototype.prepareBuffers = function() {};
GLPainter.prototype.bindDefaultFramebuffer = function() {
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

/*
 * Draw a new tile to the context, assuming that the viewport is
 * already correctly set.
 */
GLPainter.prototype.draw = function glPainterDraw(tile, style, layers, params) {
    this.tile = tile;

    if (tile) {
        this.drawClippingMask();
    }

    this.frameHistory.record(this.transform.zoom);
    this.drawLayers(tile, style, layers, params);

    if (params.debug) {
        drawDebug(this.gl, this, tile, params);
    }
};

GLPainter.prototype.drawLayers = function(tile, style, layers, params, matrix) {
    // Draw layers front-to-back.
    // Layers are already in reverse order from style.restructure()
    for (var i = 0; i < layers.length; i++) {
        this.drawLayer(tile, style, layers[i], params, matrix, tile && tile.buckets);
    }
};

GLPainter.prototype.drawLayer = function(tile, style, layer, params, matrix, buckets) {
    var gl = this.gl;

    var layerStyle = style.computed[layer.id];
    if (!layerStyle || layerStyle.hidden) return;

    if (layer.layers && layer.type === 'raster') {
        drawRaster(gl, this, buckets[layer.bucket], layerStyle, params, style, layer, tile);
    } else if (params.background) {
        drawBackground(gl, this, undefined, layerStyle, this.identityMatrix, params, style.sprite);
    } else {

        var bucket = buckets[layer.bucket];
        // There are no vertices yet for this layer.
        if (!bucket || (bucket.hasData && !bucket.hasData())) return;

        var type = bucket.type;

        if (bucket.minZoom && this.transform.zoom < bucket.minZoom) return;
        if (bucket.maxZoom && this.transform.zoom >= bucket.maxZoom) return;

        var draw = type === 'symbol' ? drawSymbol :
                   type === 'fill' ? drawFill :
                   type === 'line' ? drawLine :
                   type === 'raster' ? drawRaster : null;

        if (draw) {
            var useMatrix = matrix || this.tile.posMatrix;
            draw(gl, this, bucket, layerStyle, useMatrix, params, style.sprite);
        } else {
            console.warn('No bucket type specified');
        }

        if (params.vertices && !layer.layers) {
            drawVertices(gl, this, bucket);
        }
    }
};

// Draws non-opaque areas. This is for debugging purposes.
GLPainter.prototype.drawStencilBuffer = function() {
    var gl = this.gl;
    gl.switchShader(this.fillShader, this.identityMatrix);

    // Blend to the front, not the back.
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.stencilMask(0x00);
    gl.stencilFunc(gl.EQUAL, 0x80, 0x80);

    // Drw the filling quad where the stencil buffer isn't set.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.backgroundBuffer);
    gl.vertexAttribPointer(this.fillShader.a_pos, this.backgroundBuffer.itemSize, gl.SHORT, false, 0, 0);
    gl.uniform4fv(this.fillShader.u_color, [0, 0, 0, 0.5]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.backgroundBuffer.itemCount);

    // Revert blending mode to blend to the back.
    gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);
};

GLPainter.prototype.translateMatrix = function(matrix, z, translate, anchor) {
    if (!translate[0] && !translate[1]) return matrix;

    if (anchor === 'viewport') {
        var sin_a = Math.sin(-this.transform.angle);
        var cos_a = Math.cos(-this.transform.angle);
        translate = [
            translate[0] * cos_a - translate[1] * sin_a,
            translate[0] * sin_a + translate[1] * cos_a
        ];
    }

    var tilePixelRatio = this.transform.scale / (1 << z) / 8;
    var translation = [
        translate[0] / tilePixelRatio,
        translate[1] / tilePixelRatio,
        0
    ];

    var translatedMatrix = new Float32Array(16);
    mat4.translate(translatedMatrix, matrix, translation);
    return translatedMatrix;
};

GLPainter.prototype.saveTexture = function(texture) {
    var textures = this.reusableTextures[texture.size];
    if (!textures) {
        this.reusableTextures[texture.size] = [texture];
    } else {
        textures.push(texture);
    }
};


GLPainter.prototype.getTexture = function(size) {
    var textures = this.reusableTextures[size];
    return textures && textures.length > 0 ? textures.pop() : null;
};

},{"../lib/glmatrix":"/home/pnorman/vector_tiles/mapbox-gl-js/js/lib/glmatrix.js","../symbol/glyph_atlas":"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/glyph_atlas.js","../util/browser":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/browser.js","./draw_background":"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/draw_background.js","./draw_debug":"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/draw_debug.js","./draw_fill":"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/draw_fill.js","./draw_line":"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/draw_line.js","./draw_raster":"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/draw_raster.js","./draw_symbol":"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/draw_symbol.js","./draw_vertices":"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/draw_vertices.js","./frame_history":"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/frame_history.js","./gl_util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/gl_util.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/prerendered.js":[function(require,module,exports){
'use strict';

var mat4 = require('../lib/glmatrix').mat4;

module.exports = PrerenderedTexture;

function PrerenderedTexture(gl, layoutProperties, painter) {
    this.gl = gl;
    this.buffer = layoutProperties['raster-buffer'] || (1/32);
    this.size = (layoutProperties['raster-size'] || 512) * (1 + 2 * this.buffer);
    this.painter = painter;

    this.texture = null;
    this.fbo = null;
    this.fbos = this.painter.preFbos[this.size];
}

PrerenderedTexture.prototype.bindFramebuffer = function() {
    var gl = this.gl;

    // try to reuse available raster textures
    this.texture = this.painter.getTexture(this.size);

    if (!this.texture) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.size, this.size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        this.texture.size = this.size;
    } else {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    if (!this.fbos) {
        this.fbo = gl.createFramebuffer();
        var stencil = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, stencil);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, this.size, this.size);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, stencil);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    } else {
        this.fbo = this.fbos.pop();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    }
};

PrerenderedTexture.prototype.unbindFramebuffer = function() {
    this.painter.bindDefaultFramebuffer();
    if (this.fbos) {
        this.fbos.push(this.fbo);
    } else {
        this.painter.preFbos[this.size] = [this.fbo];
    }
};

PrerenderedTexture.prototype.bind = function() {
    if (!this.texture) throw('pre-rendered texture does not exist');
    var gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
};

PrerenderedTexture.prototype.blur = function(painter, passes) {
    var gl = this.gl;
    var originalTexture = this.texture;
    var secondaryTexture = this.painter.getTexture(this.size);
    if (!secondaryTexture) {
        secondaryTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, secondaryTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.size, this.size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        secondaryTexture.size = this.size;
    } else {
        gl.bindTexture(gl.TEXTURE_2D, secondaryTexture);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);

    var matrix = mat4.create();
    mat4.ortho(matrix, 0, 4096, -4096, 0, 0, 1);
    mat4.translate(matrix, matrix, [0, -4096, 0]);

    gl.switchShader(painter.gaussianShader, matrix);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(painter.gaussianShader.u_image, 0);

    for (var i = 0; i < passes; i++) {

        // Render horizontal
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, secondaryTexture, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2fv(painter.gaussianShader.u_offset, [1 / this.size, 0]);
        gl.bindTexture(gl.TEXTURE_2D, originalTexture);
        gl.bindBuffer(gl.ARRAY_BUFFER, painter.tileExtentBuffer);
        gl.vertexAttribPointer(painter.gaussianShader.a_pos, 2, gl.SHORT, false, 8, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);


        // Render vertical
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, originalTexture, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2fv(painter.gaussianShader.u_offset, [0, 1 / this.size]);
        gl.bindTexture(gl.TEXTURE_2D, secondaryTexture);
        gl.bindBuffer(gl.ARRAY_BUFFER, painter.tileExtentBuffer);
        gl.vertexAttribPointer(painter.gaussianShader.a_pos, 2, gl.SHORT, false, 8, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    this.painter.saveTexture(secondaryTexture);
};

},{"../lib/glmatrix":"/home/pnorman/vector_tiles/mapbox-gl-js/js/lib/glmatrix.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/shaders.js":[function(require,module,exports){
'use strict';

var glify = undefined;

module.exports = {
    "debug": {"vertex":"precision mediump float;\nattribute vec2 a_pos;\nuniform float u_pointsize;\nuniform mat4 u_matrix;\nvoid main ()\n{\n  vec4 tmpvar_1;\n  tmpvar_1.w = 1.0;\n  tmpvar_1.xy = a_pos;\n  tmpvar_1.z = float((a_pos.x >= 32767.0));\n  gl_Position = (u_matrix * tmpvar_1);\n  gl_PointSize = u_pointsize;\n}\n\n","fragment":"precision mediump float;\nuniform vec4 u_color;\nvoid main ()\n{\n  gl_FragColor = u_color;\n}\n\n"},
    "dot": {"vertex":"precision mediump float;\nuniform mat4 u_matrix;\nuniform float u_size;\nattribute vec2 a_pos;\nvoid main ()\n{\n  vec4 tmpvar_1;\n  tmpvar_1.zw = vec2(0.0, 1.0);\n  tmpvar_1.xy = a_pos;\n  gl_Position = (u_matrix * tmpvar_1);\n  gl_PointSize = u_size;\n}\n\n","fragment":"precision mediump float;\nuniform vec4 u_color;\nuniform float u_blur;\nvoid main ()\n{\n  mediump vec2 x_1;\n  x_1 = (gl_PointCoord - 0.5);\n  mediump float tmpvar_2;\n  tmpvar_2 = clamp (((\n    sqrt(dot (x_1, x_1))\n   - 0.5) / (\n    (0.5 - u_blur)\n   - 0.5)), 0.0, 1.0);\n  gl_FragColor = (u_color * (tmpvar_2 * (tmpvar_2 * \n    (3.0 - (2.0 * tmpvar_2))\n  )));\n}\n\n"},
    "fill": {"vertex":"precision mediump float;\nattribute vec2 a_pos;\nuniform mat4 u_matrix;\nvoid main ()\n{\n  vec4 tmpvar_1;\n  tmpvar_1.zw = vec2(0.0, 1.0);\n  tmpvar_1.xy = a_pos;\n  gl_Position = (u_matrix * tmpvar_1);\n  gl_PointSize = 2.0;\n}\n\n","fragment":"precision mediump float;\nuniform vec4 u_color;\nvoid main ()\n{\n  gl_FragColor = u_color;\n}\n\n"},
    "gaussian": {"vertex":"precision mediump float;\nattribute vec2 a_pos;\nuniform mat4 u_matrix;\nuniform vec2 u_offset;\nvarying highp vec2 a[3];\nvoid main ()\n{\n  vec4 tmpvar_1;\n  tmpvar_1.zw = vec2(0.0, 1.0);\n  tmpvar_1.xy = a_pos;\n  vec4 tmpvar_2;\n  tmpvar_2 = (u_matrix * tmpvar_1);\n  gl_Position = tmpvar_2;\n  highp vec2 tmpvar_3;\n  tmpvar_3 = ((tmpvar_2.xy / 2.0) + 0.5);\n  a[0] = tmpvar_3;\n  vec2 cse_4;\n  cse_4 = (u_offset * 1.18243);\n  a[1] = (tmpvar_3 + cse_4);\n  a[2] = (tmpvar_3 - cse_4);\n}\n\n","fragment":"precision mediump float;\nuniform sampler2D u_image;\nvarying vec2 a[3];\nvoid main ()\n{\n  lowp vec4 tmpvar_1;\n  tmpvar_1 = (((texture2D (u_image, a[0]) * 0.40262) + (texture2D (u_image, a[1]) * 0.29869)) + (texture2D (u_image, a[2]) * 0.29869));\n  gl_FragColor = tmpvar_1;\n}\n\n"},
    "line": {"vertex":"precision mediump float;\nattribute vec2 a_pos;\nattribute vec2 a_extrude;\nattribute float a_linesofar;\nuniform mat4 u_matrix;\nuniform mat4 u_exmatrix;\nuniform float u_ratio;\nuniform vec2 u_linewidth;\nvarying vec2 a;\nvarying float b;\nvoid main ()\n{\n  vec2 c_1;\n  vec2 tmpvar_2;\n  tmpvar_2 = (vec2(mod (a_pos, 2.0)));\n  c_1.x = tmpvar_2.x;\n  c_1.y = sign((tmpvar_2.y - 0.5));\n  a = c_1;\n  vec4 tmpvar_3;\n  tmpvar_3.zw = vec2(0.0, 0.0);\n  tmpvar_3.xy = ((u_linewidth.x * a_extrude) * 0.015873);\n  vec4 tmpvar_4;\n  tmpvar_4.zw = vec2(0.0, 1.0);\n  tmpvar_4.xy = floor((a_pos * 0.5));\n  gl_Position = ((u_matrix * tmpvar_4) + (u_exmatrix * tmpvar_3));\n  b = (a_linesofar * u_ratio);\n}\n\n","fragment":"precision mediump float;\nuniform vec2 u_linewidth;\nuniform vec2 u_dasharray;\nuniform vec4 u_color;\nuniform float u_blur;\nvarying vec2 a;\nvarying float b;\nvoid main ()\n{\n  float tmpvar_1;\n  tmpvar_1 = (sqrt(dot (a, a)) * u_linewidth.x);\n  float tmpvar_2;\n  tmpvar_2 = (float(mod (b, (u_dasharray.x + u_dasharray.y))));\n  gl_FragColor = (u_color * (clamp (\n    (min ((tmpvar_1 - (u_linewidth.y - u_blur)), (u_linewidth.x - tmpvar_1)) / u_blur)\n  , 0.0, 1.0) * max (\n    float((-(u_dasharray.y) >= 0.0))\n  , \n    clamp (min (tmpvar_2, (u_dasharray.x - tmpvar_2)), 0.0, 1.0)\n  )));\n}\n\n"},
    "linepattern": {"vertex":"precision mediump float;\nattribute vec2 a_pos;\nattribute vec2 a_extrude;\nattribute float a_linesofar;\nuniform mat4 u_matrix;\nuniform mat4 u_exmatrix;\nuniform float u_point;\nuniform vec2 u_linewidth;\nvarying vec2 a;\nvarying float b;\nvoid main ()\n{\n  vec2 c_1;\n  vec2 tmpvar_2;\n  tmpvar_2 = (vec2(mod (a_pos, 2.0)));\n  c_1.x = tmpvar_2.x;\n  c_1.y = sign((tmpvar_2.y - 0.5));\n  a = c_1;\n  vec4 tmpvar_3;\n  tmpvar_3.zw = vec2(0.0, 1.0);\n  tmpvar_3.xy = floor((a_pos / 2.0));\n  vec4 tmpvar_4;\n  tmpvar_4.w = 0.0;\n  tmpvar_4.xy = ((u_linewidth.x * (a_extrude / 63.0)) * (1.0 - u_point));\n  tmpvar_4.z = (float((a_pos.x >= 32767.0)) + (u_point * float(\n    (c_1.y >= 1.0)\n  )));\n  gl_Position = ((u_matrix * tmpvar_3) + (u_exmatrix * tmpvar_4));\n  b = a_linesofar;\n  gl_PointSize = ((2.0 * u_linewidth.x) - 1.0);\n}\n\n","fragment":"precision mediump float;\nuniform vec2 u_linewidth;\nuniform vec2 u_pattern_size;\nuniform vec2 u_pattern_tl;\nuniform vec2 u_pattern_br;\nuniform float u_point;\nuniform float u_blur;\nuniform float u_fade;\nuniform sampler2D u_image;\nvarying vec2 a;\nvarying float b;\nvoid main ()\n{\n  lowp vec4 j_1;\n  mediump vec2 x_2;\n  x_2 = ((gl_PointCoord * 2.0) - 1.0);\n  mediump float tmpvar_3;\n  tmpvar_3 = (((\n    sqrt(dot (a, a))\n   * \n    (1.0 - u_point)\n  ) + (u_point * \n    sqrt(dot (x_2, x_2))\n  )) * u_linewidth.x);\n  float tmpvar_4;\n  tmpvar_4 = (float(mod ((b / u_pattern_size.x), 1.0)));\n  float tmpvar_5;\n  tmpvar_5 = (0.5 + ((a.y * u_linewidth.x) / u_pattern_size.y));\n  vec2 tmpvar_6;\n  tmpvar_6.x = tmpvar_4;\n  tmpvar_6.y = tmpvar_5;\n  vec2 tmpvar_7;\n  tmpvar_7.x = (float(mod ((tmpvar_4 * 2.0), 1.0)));\n  tmpvar_7.y = tmpvar_5;\n  lowp vec4 tmpvar_8;\n  tmpvar_8 = ((texture2D (u_image, mix (u_pattern_tl, u_pattern_br, tmpvar_6)) * (1.0 - u_fade)) + (u_fade * texture2D (u_image, mix (u_pattern_tl, u_pattern_br, tmpvar_7))));\n  j_1.w = tmpvar_8.w;\n  j_1.xyz = (tmpvar_8.xyz * tmpvar_8.w);\n  gl_FragColor = (j_1 * clamp ((\n    min ((tmpvar_3 - (u_linewidth.y - u_blur)), (u_linewidth.x - tmpvar_3))\n   / u_blur), 0.0, 1.0));\n}\n\n"},
    "outline": {"vertex":"precision mediump float;\nattribute vec2 a_pos;\nuniform mat4 u_matrix;\nuniform vec2 u_world;\nvarying highp vec2 a;\nvoid main ()\n{\n  vec4 tmpvar_1;\n  tmpvar_1.zw = vec2(0.0, 1.0);\n  tmpvar_1.xy = a_pos;\n  vec4 tmpvar_2;\n  tmpvar_2 = (u_matrix * tmpvar_1);\n  gl_Position = tmpvar_2;\n  a = (((tmpvar_2.xy + 1.0) / 2.0) * u_world);\n}\n\n","fragment":"precision mediump float;\nuniform vec4 u_color;\nvarying vec2 a;\nvoid main ()\n{\n  highp vec2 x_1;\n  x_1 = (a - gl_FragCoord.xy);\n  highp float tmpvar_2;\n  tmpvar_2 = clamp (((\n    sqrt(dot (x_1, x_1))\n   - 1.0) / -1.0), 0.0, 1.0);\n  highp vec4 tmpvar_3;\n  tmpvar_3 = (u_color * (tmpvar_2 * (tmpvar_2 * \n    (3.0 - (2.0 * tmpvar_2))\n  )));\n  gl_FragColor = tmpvar_3;\n}\n\n"},
    "pattern": {"vertex":"precision mediump float;\nuniform mat4 u_matrix;\nuniform mat3 u_patternmatrix;\nattribute vec2 a_pos;\nvarying vec2 a;\nvoid main ()\n{\n  vec4 tmpvar_1;\n  tmpvar_1.zw = vec2(0.0, 1.0);\n  tmpvar_1.xy = a_pos;\n  gl_Position = (u_matrix * tmpvar_1);\n  vec3 tmpvar_2;\n  tmpvar_2.z = 1.0;\n  tmpvar_2.xy = a_pos;\n  a = (u_patternmatrix * tmpvar_2).xy;\n}\n\n","fragment":"precision mediump float;\nuniform float u_opacity;\nuniform float u_mix;\nuniform vec2 u_pattern_tl;\nuniform vec2 u_pattern_br;\nuniform sampler2D u_image;\nvarying vec2 a;\nvoid main ()\n{\n  vec2 tmpvar_1;\n  tmpvar_1 = (vec2(mod (a, 1.0)));\n  lowp vec4 tmpvar_2;\n  tmpvar_2 = (mix (texture2D (u_image, mix (u_pattern_tl, u_pattern_br, tmpvar_1)), texture2D (u_image, mix (u_pattern_tl, u_pattern_br, \n    (vec2(mod ((tmpvar_1 * 2.0), 1.0)))\n  )), u_mix) * u_opacity);\n  gl_FragColor = tmpvar_2;\n}\n\n"},
    "raster": {"vertex":"precision mediump float;\nuniform mat4 u_matrix;\nuniform vec2 u_tl_parent;\nuniform float u_scale_parent;\nuniform float u_buffer_scale;\nattribute vec2 a_pos;\nattribute vec2 a_texture_pos;\nvarying vec2 a;\nvarying vec2 b;\nvoid main ()\n{\n  vec4 tmpvar_1;\n  tmpvar_1.zw = vec2(0.0, 1.0);\n  tmpvar_1.xy = a_pos;\n  gl_Position = (u_matrix * tmpvar_1);\n  vec2 tmpvar_2;\n  tmpvar_2 = (((\n    (a_texture_pos / 32767.0)\n   - 0.5) / u_buffer_scale) + 0.5);\n  a = tmpvar_2;\n  b = ((tmpvar_2 * u_scale_parent) + u_tl_parent);\n}\n\n","fragment":"precision mediump float;\nuniform float u_opacity0;\nuniform float u_opacity1;\nuniform float u_brightness_low;\nuniform float u_brightness_high;\nuniform float u_saturation_factor;\nuniform float u_contrast_factor;\nuniform sampler2D u_image0;\nuniform sampler2D u_image1;\nvarying vec2 a;\nvarying vec2 b;\nuniform vec3 u_spin_weights;\nvoid main ()\n{\n  lowp vec4 tmpvar_1;\n  tmpvar_1 = ((texture2D (u_image0, a) * u_opacity0) + (texture2D (u_image1, b) * u_opacity1));\n  lowp vec3 tmpvar_2;\n  tmpvar_2.x = dot (tmpvar_1.xyz, u_spin_weights);\n  tmpvar_2.y = dot (tmpvar_1.xyz, u_spin_weights.zxy);\n  tmpvar_2.z = dot (tmpvar_1.xyz, u_spin_weights.yzx);\n  lowp vec4 tmpvar_3;\n  tmpvar_3.xyz = mix (vec3(u_brightness_low), vec3(u_brightness_high), ((\n    ((tmpvar_2 + ((\n      (((tmpvar_1.x + tmpvar_1.y) + tmpvar_1.z) / 3.0)\n     - tmpvar_2) * u_saturation_factor)) - 0.5)\n   * u_contrast_factor) + 0.5));\n  tmpvar_3.w = tmpvar_1.w;\n  gl_FragColor = tmpvar_3;\n}\n\n"},
    "icon": {"vertex":"precision mediump float;\nattribute vec2 a_pos;\nattribute vec2 a_offset;\nattribute vec2 a_tex;\nattribute float a_angle;\nattribute float a_minzoom;\nattribute float a_maxzoom;\nattribute float a_rangeend;\nattribute float a_rangestart;\nattribute float a_labelminzoom;\nuniform mat4 u_matrix;\nuniform mat4 u_exmatrix;\nuniform float u_angle;\nuniform float u_zoom;\nuniform float u_flip;\nuniform float u_fadedist;\nuniform float u_minfadezoom;\nuniform float u_maxfadezoom;\nuniform float u_fadezoom;\nuniform float u_opacity;\nuniform vec2 u_texsize;\nvarying vec2 a;\nvarying float b;\nvoid main ()\n{\n  float d_1;\n  d_1 = 0.0;\n  float tmpvar_2;\n  tmpvar_2 = (float(mod ((a_angle + u_angle), 256.0)));\n  if ((((u_flip > 0.0) && (tmpvar_2 >= 64.0)) && (tmpvar_2 < 192.0))) {\n    d_1 = 1.0;\n  };\n  float tmpvar_3;\n  tmpvar_3 = (((2.0 - \n    float((u_zoom >= a_minzoom))\n  ) - (1.0 - \n    float((u_zoom >= a_maxzoom))\n  )) + d_1);\n  float tmpvar_4;\n  tmpvar_4 = clamp (((u_fadezoom - a_labelminzoom) / u_fadedist), 0.0, 1.0);\n  if ((u_fadedist >= 0.0)) {\n    b = tmpvar_4;\n  } else {\n    b = (1.0 - tmpvar_4);\n  };\n  if ((u_maxfadezoom < a_labelminzoom)) {\n    b = 0.0;\n  };\n  if ((u_minfadezoom >= a_labelminzoom)) {\n    b = 1.0;\n  };\n  vec4 tmpvar_5;\n  tmpvar_5.zw = vec2(0.0, 1.0);\n  tmpvar_5.xy = a_pos;\n  vec4 tmpvar_6;\n  tmpvar_6.w = 0.0;\n  tmpvar_6.xy = (a_offset / 64.0);\n  tmpvar_6.z = ((tmpvar_3 + float(\n    (0.0 >= b)\n  )) + (float(\n    (u_angle >= a_rangeend)\n  ) * (1.0 - \n    float((u_angle >= a_rangestart))\n  )));\n  gl_Position = ((u_matrix * tmpvar_5) + (u_exmatrix * tmpvar_6));\n  a = (a_tex / u_texsize);\n  b = (b * u_opacity);\n}\n\n","fragment":"precision mediump float;\nuniform sampler2D u_texture;\nvarying vec2 a;\nvarying float b;\nvoid main ()\n{\n  lowp vec4 tmpvar_1;\n  tmpvar_1 = (texture2D (u_texture, a) * b);\n  gl_FragColor = tmpvar_1;\n}\n\n"},
    "sdf": {"vertex":"precision mediump float;\nattribute vec2 a_pos;\nattribute vec2 a_offset;\nattribute vec2 a_tex;\nattribute float a_angle;\nattribute float a_minzoom;\nattribute float a_maxzoom;\nattribute float a_rangeend;\nattribute float a_rangestart;\nattribute float a_labelminzoom;\nuniform mat4 u_matrix;\nuniform mat4 u_exmatrix;\nuniform float u_angle;\nuniform float u_zoom;\nuniform float u_flip;\nuniform float u_fadedist;\nuniform float u_minfadezoom;\nuniform float u_maxfadezoom;\nuniform float u_fadezoom;\nuniform vec2 u_texsize;\nvarying vec2 a;\nvarying float b;\nvoid main ()\n{\n  float c_1;\n  c_1 = 0.0;\n  float tmpvar_2;\n  tmpvar_2 = (float(mod ((a_angle + u_angle), 256.0)));\n  if ((((u_flip > 0.0) && (tmpvar_2 >= 64.0)) && (tmpvar_2 < 192.0))) {\n    c_1 = 1.0;\n  };\n  float tmpvar_3;\n  tmpvar_3 = (((2.0 - \n    float((u_zoom >= a_minzoom))\n  ) - (1.0 - \n    float((u_zoom >= a_maxzoom))\n  )) + c_1);\n  float tmpvar_4;\n  tmpvar_4 = clamp (((u_fadezoom - a_labelminzoom) / u_fadedist), 0.0, 1.0);\n  if ((u_fadedist >= 0.0)) {\n    b = tmpvar_4;\n  } else {\n    b = (1.0 - tmpvar_4);\n  };\n  if ((u_maxfadezoom < a_labelminzoom)) {\n    b = 0.0;\n  };\n  if ((u_minfadezoom >= a_labelminzoom)) {\n    b = 1.0;\n  };\n  vec4 tmpvar_5;\n  tmpvar_5.zw = vec2(0.0, 1.0);\n  tmpvar_5.xy = a_pos;\n  vec4 tmpvar_6;\n  tmpvar_6.w = 0.0;\n  tmpvar_6.xy = (a_offset / 64.0);\n  tmpvar_6.z = ((tmpvar_3 + float(\n    (0.0 >= b)\n  )) + (float(\n    (u_angle >= a_rangeend)\n  ) * (1.0 - \n    float((u_angle >= a_rangestart))\n  )));\n  gl_Position = ((u_matrix * tmpvar_5) + (u_exmatrix * tmpvar_6));\n  a = (a_tex / u_texsize);\n}\n\n","fragment":"precision mediump float;\nuniform sampler2D u_texture;\nuniform vec4 u_color;\nuniform float u_buffer;\nuniform float u_gamma;\nvarying vec2 a;\nvarying float b;\nvoid main ()\n{\n  float edge0_1;\n  edge0_1 = (u_buffer - u_gamma);\n  lowp float tmpvar_2;\n  tmpvar_2 = clamp (((texture2D (u_texture, a).w - edge0_1) / (\n    (u_buffer + u_gamma)\n   - edge0_1)), 0.0, 1.0);\n  lowp vec4 tmpvar_3;\n  tmpvar_3 = (u_color * ((tmpvar_2 * \n    (tmpvar_2 * (3.0 - (2.0 * tmpvar_2)))\n  ) * b));\n  gl_FragColor = tmpvar_3;\n}\n\n"}
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/geojson_source.js":[function(require,module,exports){
'use strict';

var util = require('../util/util');
var Source = require('./source');
var GeoJSONTile = require('./geojson_tile');

module.exports = GeoJSONSource;

function GeoJSONSource(options) {
    this._tiles = {};
    this._alltiles = {};
    this.enabled = true;
    this.zooms = [1, 5, 9, 13];
    this.minTileZoom = this.zooms[0];
    this.maxTileZoom = this.zooms[this.zooms.length - 1];
    this.data = options.data;
}

GeoJSONSource.prototype = util.inherit(Source, {
    minzoom: 1,
    maxzoom: 13,

    setData: function(data) {
        this.data = data;
        if (this.map) this._updateData();
        return this;
    },

    onAdd: function(map) {
        this.map = map;
        this.painter = map.painter;

        if (this.map.style) this._updateData();
        map.on('style.change', this._updateData.bind(this));
    },

    _updateData: function() {
        this.workerID = this.map.dispatcher.send('parse geojson', {
            data: this.data,
            zooms: this.zooms,
            tileSize: 512,
            source: this.id
        }, function(err, tiles) {
            if (err) return;
            for (var i = 0; i < tiles.length; i++) {
                this._alltiles[tiles[i].id] = new GeoJSONTile(tiles[i].id, this, tiles[i]);
            }
            if (this.map) this.map.update();
        }.bind(this));
        return this;
    },

    _addTile: function(id) {
        var tile = this._alltiles[id];
        if (tile) {
            tile._load();
            this._tiles[id] = tile;
            this.fire('tile.add', {tile: tile});
        }
        return tile || {};
    },

    _coveringZoomLevel: function() {
        var zoom = this._getZoom();
        for (var i = this.zooms.length - 1; i >= 0; i--) {
            if (this.zooms[i] <= zoom) {
                var z = this.zooms[i];
                return z;
            }
        }
        return 0;
    }
});

},{"../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","./geojson_tile":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/geojson_tile.js","./source":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/source.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/geojson_tile.js":[function(require,module,exports){
'use strict';

var Tile = require('./tile');
var BufferSet = require('../data/buffer/buffer_set');
var createBucket = require('../data/create_bucket');

module.exports = GeoJSONTile;

function GeoJSONTile(id, source, data) {
    this.id = id;
    this.source = source;
    this.data = data;
    this.workerID = source.workerID;
}

GeoJSONTile.prototype = Object.create(Tile.prototype);

GeoJSONTile.prototype._load = function() {
    if (this.loaded) return;
    this.loaded = true;

    var data = this.data;
    this.buffers = new BufferSet(data.buffers);

    this.buckets = {};
    for (var b in data.elementGroups) {
        this.buckets[b] = createBucket(this.source.map.style.buckets[b], this.buffers, undefined, data.elementGroups[b]);
    }


};

// noops
GeoJSONTile.prototype.abort = function() { };
GeoJSONTile.prototype.remove = function() { };

},{"../data/buffer/buffer_set":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/buffer_set.js","../data/create_bucket":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/create_bucket.js","./tile":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/tile.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/geojson_wrapper.js":[function(require,module,exports){
'use strict';

module.exports = Wrapper;

// conform to vectortile api
function Wrapper(features) {
    this.features = features;
    this.length = features.length;
}

Wrapper.prototype.feature = function(i) {
    return new FeatureWrapper(this.features[i]);
};

var mapping = {
    'Point': 1,
    'LineString': 2,
    'Polygon': 3
};

function FeatureWrapper(feature) {
    this.feature = feature;
    this.type = mapping[feature.type];
    this.properties = feature.properties;
}

FeatureWrapper.prototype.loadGeometry = function() {
    return this.feature.coords;
};

FeatureWrapper.prototype.bbox = function() {

    if (this.type === mapping.Point) {
        return [
            this.feature.coords[0][0].x,
            this.feature.coords[0][0].y,
            this.feature.coords[0][0].x,
            this.feature.coords[0][0].y
        ];
    }

    var rings = this.feature.coords;

    var x1 = Infinity,
        x2 = -Infinity,
        y1 = Infinity,
        y2 = -Infinity;

    for (var i = 0; i < rings.length; i++) {
        var ring = rings[i];

        for (var j = 0; j < ring.length; j++) {
            var coord = ring[j];

            x1 = Math.min(x1, coord.x);
            x2 = Math.max(x2, coord.x);
            y1 = Math.min(y1, coord.y);
            y2 = Math.max(y2, coord.y);
        }
    }

    return [x1, y1, x2, y2];
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/raster_tile.js":[function(require,module,exports){
'use strict';

var Tile = require('./tile');
var ajax = require('../util/ajax');
var util = require('../util/util');

module.exports = RasterTile;

function RasterTile(id, source, url, callback) {
    this.id = id;
    this.loaded = false;
    this.url = url;
    this.source = source;
    this.map = source.map;
    this.callback = callback;
    this.uses = 1;

    ajax.getImage(this.url, this._loaded.bind(this));
}

RasterTile.prototype = util.inherit(Tile, {
    _loaded: function(err, img) {
        // Tile has been removed from the map
        if (!this.map) return;

        if (err) return this.callback(err);

        this.img = img;

        // start texture upload
        this.bind(this.map.painter.gl);

        this.timeAdded = new Date().getTime();
        this.map.animationLoop.set(this.map.style.rasterFadeDuration);

        this.buckets = {};
        var buckets = this.map.style.buckets;
        for (var b in buckets) {
            var bucket = buckets[b];
            var sourceid = bucket && bucket.source;
            if (this.source.id === sourceid) {
                this.buckets[b] = {
                    layoutProperties: bucket.layout,
                    type: 'raster',
                    tile: this
                };
            }
        }

        this.loaded = true;
        this.callback(null, this);
    },

    abort: function() {
        this.aborted = true;
        if (this.img) this.img.src = '';
        delete this.img;
    },

    bind: function(gl) {
        if (!this.texture) {
            // try to find reusable texture
            this.texture = this.map.painter.getTexture(this.img.width);
            if (this.texture) {
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.img);
            } else {
                this.texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.img);
                this.texture.size = this.img.width;
            }
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }
    },

    remove: function() {
        if (this.texture) this.map.painter.saveTexture(this.texture);
        delete this.map;
    },

    featuresAt: function(pos, params, callback) {
        // noop
        callback(null, []);
    }
});
},{"../util/ajax":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/ajax.js","../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","./tile":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/tile.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/source.js":[function(require,module,exports){
'use strict';

var util = require('../util/util'),
    ajax = require('../util/ajax'),
    normalizeURL = require('../util/mapbox').normalizeSourceURL,
    Evented = require('../util/evented'),
    Cache = require('../util/mru_cache'),
    TileCoord = require('./tile_coord'),
    Tile = require('./tile'),
    Point = require('point-geometry');

module.exports = Source;

function Source(options) {
    this.enabled = false;

    util.extend(this, util.pick(options,
        'type', 'url', 'tileSize'));

    if (this.type === 'vector' && this.tileSize !== 512) {
        throw new Error('vector tile sources must have a tileSize of 512');
    }

    this._tiles = {};
    this._cache = new Cache(this.cacheSize, function(tile) {
        tile.remove();
    });

    var loaded = function(err, tileJSON) {
        if (err) throw err;

        if (!tileJSON.tiles)
            throw new Error('missing tiles property');

        util.extend(this, util.pick(tileJSON,
            'tiles', 'minzoom', 'maxzoom', 'attribution'));

        this.enabled = true;
        this.update();

        if (this.map) this.map.fire('source.add', {source: this});
    }.bind(this);

    if (this.url) {
        ajax.getJSON(normalizeURL(this.url), loaded);
    } else {
        loaded(null, options);
    }

    this._updateTiles = util.throttle(this._updateTiles, 50, this);
}

Source.prototype = util.inherit(Evented, {
    minzoom: 0,
    maxzoom: 22,
    tileSize: 512,
    cacheSize: 20,

    onAdd: function(map) {
        this.map = map;
        this.painter = map.painter;
    },

    load: function() {
        for (var t in this._tiles) {
            this._tiles[t]._load();
        }
    },

    loaded: function() {
        for (var t in this._tiles) {
            if (!this._tiles[t].loaded)
                return false;
        }
        return true;
    },

    render: function(layers) {
        // Iteratively paint every tile.
        if (!this.enabled) return;
        var order = Object.keys(this._tiles);
        order.sort(zOrder);
        for (var i = 0; i < order.length; i++) {
            var id = order[i];
            var tile = this._tiles[id];
            if (tile.loaded && !this.coveredTiles[id]) {
                this._renderTile(tile, id, layers);
            }
        }
    },

    // Given a tile of data, its id, and a style layers, render the tile to the canvas
    _renderTile: function(tile, id, layers) {
        var pos = TileCoord.fromID(id);
        var z = pos.z, x = pos.x, y = pos.y, w = pos.w;
        x += w * (1 << z);

        tile.calculateMatrices(z, x, y, this.map.transform, this.painter);

        this.painter.draw(tile, this.map.style, layers, {
            z: z, x: x, y: y,
            debug: this.map.debug,
            antialiasing: this.map.antialiasing,
            vertices: this.map.vertices,
            rotating: this.map.rotating,
            zooming: this.map.zooming
        });
    },

    featuresAt: function(point, params, callback) {
        point = Point.convert(point);

        if (params.layer) {
            var style = this.map.style,
                layer = style.getLayer(params.layer);
            params.bucket = style.buckets[layer.ref || layer.id];
        }

        var order = Object.keys(this._tiles);
        order.sort(zOrder);
        for (var i = 0; i < order.length; i++) {
            var id = order[i];
            var tile = this._tiles[id];
            var pos = tile.positionAt(id, point);

            if (pos && pos.x >= 0 && pos.x < 4096 && pos.y >= 0 && pos.y < 4096) {
                // The click is within the viewport. There is only ever one tile in
                // a layer that has this property.
                return tile.featuresAt(pos, params, callback);
            }
        }

        callback(null, []);
    },

    // get the zoom level adjusted for the difference in map and source tilesizes
    _getZoom: function() {
        var zOffset = Math.log(this.map.transform.tileSize / this.tileSize) / Math.LN2;
        return this.map.transform.zoom + zOffset;
    },

    _coveringZoomLevel: function() {
        return Math.floor(this._getZoom());
    },

    _getCoveringTiles: function() {
        var z = this._coveringZoomLevel();

        if (z < this.minzoom) return [];
        if (z > this.maxzoom) z = this.maxzoom;

        var tr = this.map.transform,
            tileCenter = TileCoord.zoomTo(tr.locationCoordinate(tr.center), z),
            centerPoint = new Point(tileCenter.column - 0.5, tileCenter.row - 0.5);

        return TileCoord.cover(z, [
            TileCoord.zoomTo(tr.pointCoordinate(tileCenter, {x: 0, y: 0}), z),
            TileCoord.zoomTo(tr.pointCoordinate(tileCenter, {x: tr.width, y: 0}), z),
            TileCoord.zoomTo(tr.pointCoordinate(tileCenter, {x: tr.width, y: tr.height}), z),
            TileCoord.zoomTo(tr.pointCoordinate(tileCenter, {x: 0, y: tr.height}), z)
        ]).sort(function(a, b) {
            return centerPoint.dist(TileCoord.fromID(a)) -
                   centerPoint.dist(TileCoord.fromID(b));
        });
    },

    // Recursively find children of the given tile (up to maxCoveringZoom) that are already loaded;
    // adds found tiles to retain object; returns true if children completely cover the tile

    _findLoadedChildren: function(id, maxCoveringZoom, retain) {
        var complete = true;
        var z = TileCoord.fromID(id).z;
        var ids = TileCoord.children(id);
        for (var i = 0; i < ids.length; i++) {
            if (this._tiles[ids[i]] && this._tiles[ids[i]].loaded) {
                retain[ids[i]] = true;
            } else {
                complete = false;
                if (z < maxCoveringZoom) {
                    // Go further down the hierarchy to find more unloaded children.
                    this._findLoadedChildren(ids[i], maxCoveringZoom, retain);
                }
            }
        }
        return complete;
    },

    // Find a loaded parent of the given tile (up to minCoveringZoom);
    // adds the found tile to retain object and returns the tile if found

    _findLoadedParent: function(id, minCoveringZoom, retain) {
        for (var z = TileCoord.fromID(id).z; z >= minCoveringZoom; z--) {
            id = TileCoord.parent(id);
            var tile = this._tiles[id];
            if (tile && tile.loaded) {
                retain[id] = true;
                return tile;
            }
        }
    },

    update: function() {
        if (!this.enabled) return;
        this._updateTiles();
    },

    // Removes tiles that are outside the viewport and adds new tiles that are inside the viewport.
    _updateTiles: function() {
        if (!this.map || !this.map.loadNewTiles ||
            !this.map.style || !this.map.style.sources || !this.map.style.sources[this.id]) return;

        var zoom = Math.floor(this._getZoom());
        var required = this._getCoveringTiles();
        var i;
        var id;
        var complete;
        var tile;

        // Determine the overzooming/underzooming amounts.
        var minCoveringZoom = util.clamp(zoom - 10, this.minzoom, this.maxzoom);
        var maxCoveringZoom = util.clamp(zoom + 1,  this.minzoom, this.maxzoom);

        // Retain is a list of tiles that we shouldn't delete, even if they are not
        // the most ideal tile for the current viewport. This may include tiles like
        // parent or child tiles that are *already* loaded.
        var retain = {};
        // Covered is a list of retained tiles who's areas are full covered by other,
        // better, retained tiles. They are not drawn separately.
        this.coveredTiles = {};

        var fullyComplete = true;

        // Add existing child/parent tiles if the actual tile is not yet loaded
        for (i = 0; i < required.length; i++) {
            id = +required[i];
            retain[id] = true;
            tile = this._addTile(id);

            if (!tile.loaded) {
                // The tile we require is not yet loaded. Try to find a parent or
                // child tile that we already have.

                // First, try to find existing child tiles that completely cover the
                // missing tile.
                complete = this._findLoadedChildren(id, maxCoveringZoom, retain);

                // Then, if there are no complete child tiles, try to find existing
                // parent tiles that completely cover the missing tile.
                if (!complete) {
                    complete = this._findLoadedParent(id, minCoveringZoom, retain);
                }

                // The unloaded tile's area is not completely covered loaded tiles
                if (!complete) {
                    fullyComplete = false;
                }
            }
        }

        var now = new Date().getTime();
        var fadeDuration = this.type === 'raster' ? this.map.style.rasterFadeDuration : 0;

        for (id in retain) {
            tile = this._tiles[id];
            if (tile && tile.timeAdded > now - fadeDuration) {
                // This tile is still fading in. Find tiles to cross-fade with it.

                complete = this._findLoadedChildren(id, maxCoveringZoom, retain);

                if (complete) {
                    this.coveredTiles[id] = true;
                } else {
                    this._findLoadedParent(id, minCoveringZoom, retain);
                }
            }
        }

        for (id in this.coveredTiles) retain[id] = true;

        // Remove the tiles we don't need anymore.
        var remove = util.keysDifference(this._tiles, retain);
        for (i = 0; i < remove.length; i++) {
            id = +remove[i];
            this._removeTile(id);
        }
    },

    _loadTile: function(id) {
        var pos = TileCoord.fromID(id),
            tile;
        if (pos.w === 0) {
            var url = TileCoord.url(id, this.tiles);
            tile = this._tiles[id] = Tile.create(this.type, id, this, url, function(err) {
                if (err) {
                    console.warn('failed to load tile %d/%d/%d: %s', pos.z, pos.x, pos.y, err.stack || err);
                } else {
                    this.fire('tile.load', {tile: tile});
                    this.map.update();
                }
            }.bind(this));
        } else {
            var wrapped = TileCoord.toID(pos.z, pos.x, pos.y, 0);
            tile = this._tiles[id] = this._tiles[wrapped] || this._addTile(wrapped);
            tile.uses++;
        }
        return tile;
    },

    // Adds a vector tile to the map. It will trigger a rerender of the map and will
    // be part in all future renders of the map. The map object will handle copying
    // the tile data to the GPU if it is required to paint the current viewport.
    _addTile: function(id) {
        var tile = this._tiles[id];

        if (!tile) {
            tile = this._cache.get(id);
            if (tile) {
                tile.uses = 1;
                this._tiles[id] = tile;
            }
        }

        if (!tile) {
            tile = this._loadTile(id);
            this.fire('tile.add', {tile: tile});
        }

        return tile;
    },

    _removeTile: function(id) {
        var tile = this._tiles[id];
        if (tile) {
            tile.uses--;
            delete this._tiles[id];

            if (tile.uses <= 0) {
                if (!tile.loaded) {
                    tile.abort();
                    tile.remove();
                } else {
                    this._cache.add(id, tile);
                }

                this.fire('tile.remove', {tile: tile});
            }
        }
    }
});

function zOrder(a, b) {
    return (b % 32) - (a % 32);
}

var sources = {
    vector: Source,
    raster: Source,
    geojson: require('./geojson_source'),
    video: require('./video_source')
};

Source.create = function(source) {
    return new sources[source.type](source);
};

},{"../util/ajax":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/ajax.js","../util/evented":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/evented.js","../util/mapbox":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/mapbox.js","../util/mru_cache":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/mru_cache.js","../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","./geojson_source":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/geojson_source.js","./tile":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/tile.js","./tile_coord":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/tile_coord.js","./video_source":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/video_source.js","point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/tile.js":[function(require,module,exports){
'use strict';

var glmatrix = require('../lib/glmatrix'),
    mat2 = glmatrix.mat2,
    mat4 = glmatrix.mat4,
    vec2 = glmatrix.vec2;

module.exports = Tile;

function Tile() {}

Tile.prototype = {
    // todo unhardcode
    tileExtent: 4096,

    calculateMatrices: function(z, x, y, transform, painter) {

        // Initialize model-view matrix that converts from the tile coordinates
        // to screen coordinates.
        var tileScale = Math.pow(2, z);
        var scale = transform.worldSize / tileScale;

        // TODO: remove
        this.scale = scale;

        // The position matrix
        this.posMatrix = mat4.create();
        mat4.translate(this.posMatrix, this.posMatrix, [transform.centerPoint.x, transform.centerPoint.y, 0]);
        mat4.rotateZ(this.posMatrix, this.posMatrix, transform.angle);
        mat4.translate(this.posMatrix, this.posMatrix, [-transform.centerPoint.x, -transform.centerPoint.y, 0]);

        var pixelX = transform.width / 2 - transform.x,
            pixelY = transform.height / 2 - transform.y;

        mat4.translate(this.posMatrix, this.posMatrix, [pixelX + x * scale, pixelY + y * scale, 1]);

        // Create inverted matrix for interaction
        this.invPosMatrix = mat4.create();
        mat4.invert(this.invPosMatrix, this.posMatrix);

        mat4.scale(this.posMatrix, this.posMatrix, [ scale / this.tileExtent, scale / this.tileExtent, 1 ]);
        mat4.multiply(this.posMatrix, painter.projectionMatrix, this.posMatrix);

        // The extrusion matrix.
        this.exMatrix = mat4.clone(painter.projectionMatrix);
        mat4.rotateZ(this.exMatrix, this.exMatrix, transform.angle);

        // 2x2 matrix for rotating points
        this.rotationMatrix = mat2.create();
        mat2.rotate(this.rotationMatrix, this.rotationMatrix, transform.angle);
    },

    positionAt: function(id, point) {
        // tile hasn't finished loading
        if (!this.invPosMatrix) return null;

        var pos = vec2.transformMat4([], [point.x, point.y], this.invPosMatrix);
        vec2.scale(pos, pos, 4096 / this.scale);
        return {
            x: pos[0],
            y: pos[1],
            scale: this.scale
        };
    },

    featuresAt: function(pos, params, callback) {
        this.source.map.dispatcher.send('query features', {
            id: this.id,
            x: pos.x,
            y: pos.y,
            scale: pos.scale,
            source: this.source.id,
            params: params
        }, callback, this.workerID);
    }
};

var tiles = {
    vector: require('./vector_tile'),
    raster: require('./raster_tile')
};

Tile.create = function(type, id, source, url, callback) {
    return new tiles[type](id, source, url, callback);
};

},{"../lib/glmatrix":"/home/pnorman/vector_tiles/mapbox-gl-js/js/lib/glmatrix.js","./raster_tile":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/raster_tile.js","./vector_tile":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/vector_tile.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/tile_coord.js":[function(require,module,exports){
'use strict';

/*
 * Tiles are generally represented as packed integer ids constructed by
 * `TileCoord.toID(x, y, z)`
 */

var TileCoord = exports;

TileCoord.toID = function(z, x, y, w) {
    w = w || 0;
    w *= 2;
    if (w < 0) w = w * -1 -1;
    var dim = 1 << z;
    return ((dim * dim * w + dim * y + x) * 32) + z;
};

TileCoord.asString = function(id) {
    var pos = TileCoord.fromID(id);
    return pos.z + "/" + pos.x + "/" + pos.y;
};

/*
 * Parse a packed integer id into an object with x, y, and z properties
 */
TileCoord.fromID = function(id) {
    var z = id % 32, dim = 1 << z;
    var xy = ((id - z) / 32);
    var x = xy % dim, y = ((xy - x) / dim) % dim;
    var w = Math.floor(xy / (dim * dim));
    if (w % 2 !== 0) w = w * -1 -1;
    w /= 2;
    return { z: z, x: x, y: y, w: w };
};

/*
 * Given a packed integer id, return its zoom level
 */
TileCoord.zoom = function(id) {
    return id % 32;
};

// Given an id and a list of urls, choose a url template and return a tile URL
TileCoord.url = function(id, urls) {
    var pos = TileCoord.fromID(id);

    return urls[(pos.x + pos.y) % urls.length]
        .replace('{h}', (pos.x % 16).toString(16) + (pos.y % 16).toString(16))
        .replace('{z}', pos.z)
        .replace('{x}', pos.x)
        .replace('{y}', pos.y);
};

/*
 * Given a packed integer id, return the id of its parent tile
 */
TileCoord.parent = function(id) {
    var pos = TileCoord.fromID(id);
    if (pos.z === 0) return;
    else return TileCoord.toID(pos.z - 1, Math.floor(pos.x / 2), Math.floor(pos.y / 2));
};

TileCoord.parentWithZoom = function(id, zoom) {
    var pos = TileCoord.fromID(id);
    while (pos.z > zoom) {
        pos.z--;
        pos.x = Math.floor(pos.x / 2);
        pos.y = Math.floor(pos.y / 2);
    }
    return TileCoord.toID(pos.z, pos.x, pos.y);
};

/*
 * Given a packed integer id, return an array of integer ids representing
 * its four children.
 */
TileCoord.children = function(id) {
    var pos = TileCoord.fromID(id);
    pos.z += 1;
    pos.x *= 2;
    pos.y *= 2;
    return [
        TileCoord.toID(pos.z, pos.x, pos.y, pos.w),
        TileCoord.toID(pos.z, pos.x + 1, pos.y, pos.w),
        TileCoord.toID(pos.z, pos.x, pos.y + 1, pos.w),
        TileCoord.toID(pos.z, pos.x + 1, pos.y + 1, pos.w)
    ];
};

TileCoord.zoomTo = function(c, z) {
    c.column = c.column * Math.pow(2, z - c.zoom);
    c.row = c.row * Math.pow(2, z - c.zoom);
    c.zoom = z;
    return c;
};

// Taken from polymaps src/Layer.js
// https://github.com/simplegeo/polymaps/blob/master/src/Layer.js#L333-L383

function edge(a, b) {
    if (a.row > b.row) { var t = a; a = b; b = t; }
    return {
        x0: a.column,
        y0: a.row,
        x1: b.column,
        y1: b.row,
        dx: b.column - a.column,
        dy: b.row - a.row
    };
}

function scanSpans(e0, e1, ymin, ymax, scanLine) {
    var y0 = Math.max(ymin, Math.floor(e1.y0));
    var y1 = Math.min(ymax, Math.ceil(e1.y1));

    // sort edges by x-coordinate
    if ((e0.x0 == e1.x0 && e0.y0 == e1.y0) ?
            (e0.x0 + e1.dy / e0.dy * e0.dx < e1.x1) :
            (e0.x1 - e1.dy / e0.dy * e0.dx < e1.x0)) {
        var t = e0; e0 = e1; e1 = t;
    }

    // scan lines!
    var m0 = e0.dx / e0.dy;
    var m1 = e1.dx / e1.dy;
    var d0 = e0.dx > 0; // use y + 1 to compute x0
    var d1 = e1.dx < 0; // use y + 1 to compute x1
    for (var y = y0; y < y1; y++) {
        var x0 = m0 * Math.max(0, Math.min(e0.dy, y + d0 - e0.y0)) + e0.x0;
        var x1 = m1 * Math.max(0, Math.min(e1.dy, y + d1 - e1.y0)) + e1.x0;
        scanLine(Math.floor(x1), Math.ceil(x0), y);
    }
}

function scanTriangle(a, b, c, ymin, ymax, scanLine) {
    var ab = edge(a, b),
        bc = edge(b, c),
        ca = edge(c, a);

    var t;

    // sort edges by y-length
    if (ab.dy > bc.dy) { t = ab; ab = bc; bc = t; }
    if (ab.dy > ca.dy) { t = ab; ab = ca; ca = t; }
    if (bc.dy > ca.dy) { t = bc; bc = ca; ca = t; }

    // scan span! scan span!
    if (ab.dy) scanSpans(ca, ab, ymin, ymax, scanLine);
    if (bc.dy) scanSpans(ca, bc, ymin, ymax, scanLine);
}

TileCoord.cover = function(z, bounds) {
    var tiles = 1 << z;
    var t = {};

    function scanLine(x0, x1, y) {
        var x, wx;
        if (y >= 0 && y <= tiles) {
            for (x = x0; x < x1; x++) {
                wx = (x + tiles) % tiles;
                t[TileCoord.toID(z, wx, y, Math.floor(x/tiles))] = {x: wx, y: y};
            }
        }
    }

    // Divide the screen up in two triangles and scan each of them:
    // +---/
    // | / |
    // /---+
    scanTriangle(bounds[0], bounds[1], bounds[2], 0, tiles, scanLine);
    scanTriangle(bounds[2], bounds[3], bounds[0], 0, tiles, scanLine);

    return Object.keys(t);
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/tile_geojson.js":[function(require,module,exports){
'use strict';

var rewind = require('geojson-rewind');

var TileCoord = require('./tile_coord');
var Transform = require('../geo/transform');
var Point = require('point-geometry');
var LatLng = require('../geo/lat_lng');

module.exports = tileGeoJSON;

function tileGeoJSON(geojson, zoom) {
    var tiles = {};
    var tileExtent = 4096;
    var transform = new Transform();
    transform.zoom = zoom;

    geojson = rewind(geojson);

    if (geojson.type === 'FeatureCollection') {
        for (var i = 0; i < geojson.features.length; i++) {
            tileFeature(geojson.features[i], transform, tiles, tileExtent);
        }

    } else if (geojson.type === 'Feature') {
        tileFeature(geojson, transform, tiles, tileExtent);

    } else {
        throw('Unrecognized geojson type');
    }

    return tiles;
}

function tileFeature(feature, transform, tiles, tileExtent) {
    var coords = feature.geometry.coordinates;
    var type = feature.geometry.type;

    var tiled;
    if (type === 'Point') {
        tiled = tileLineString([coords], transform, tileExtent);

    } else if (type === 'LineString' || type === 'MultiPoint') {
        tiled = tileLineString(coords, transform, tileExtent);

    } else if (type === 'Polygon' || type === 'MultiLineString') {
        tiled = {};
        for (var i = 0; i < coords.length; i++) {
            var tiled_ = tileLineString(coords[i], transform, tileExtent, type === 'Polygon');
            for (var tileID in tiled_) {
                if (!tiled[tileID]) tiled[tileID] = [];
                tiled[tileID] = (tiled[tileID] || []).concat(tiled_[tileID]);
            }
        }

    } else if (type === 'MultiPolygon') {
        throw("todo");
    } else {
        throw("unrecognized geometry type");
    }

    for (var id in tiled) {
        tiles[id] = tiles[id] || [];
        tiles[id].push({
            properties: feature.properties,
            coords: tiled[id],
            type: feature.geometry.type
        });
    }
}

function tileLineString(coords, transform, tileExtent, rejoin) {

    var padding = 0.01;
    var paddedExtent = tileExtent * (1 + 2 * padding);
    var coord = transform.locationCoordinate(new LatLng(coords[0][1], coords[0][0]));
    var prevCoord;

    var tiles = {};

    for (var i = 0; i < coords.length; i++) {
        prevCoord = coord;
        coord = transform.locationCoordinate(new LatLng(coords[i][1], coords[i][0]));

        var dx = coord.column - prevCoord.column || Number.MIN_VALUE,
            dy = coord.row - prevCoord.row || Number.MIN_VALUE,
            dirX = dx / Math.abs(dx),
            dirY = dy / Math.abs(dy);

        // Find the rectangular bounding box, in tiles, of the polygon
        var startTileX = Math.floor(prevCoord.column - dirX * padding);
        var endTileX = Math.floor(coord.column + dirX * padding);
        var startTileY = Math.floor(prevCoord.row - dirY * padding);
        var endTileY = Math.floor(coord.row + dirY * padding);

        // Iterate over all tiles the segment might intersect
        // and split the segment across those tiles
        for (var x = startTileX; (x - endTileX) * dirX <= 0; x += dirX) {
            var leftX = (x - padding - prevCoord.column) / dx;
            var rightX = (x + 1 + padding - prevCoord.column) / dx;

            for (var y = startTileY; (y - endTileY) * dirY <= 0; y += dirY) {
                var topY = (y - padding - prevCoord.row) / dy;
                var bottomY = (y + 1 + padding - prevCoord.row) / dy;

                // fraction of the distance along the segment at which the segment
                // enters or exits the tile
                var enter = Math.max(Math.min(leftX, rightX), Math.min(topY, bottomY));
                var exit = Math.min(Math.max(leftX, rightX), Math.max(topY, bottomY));

                var tileID = TileCoord.toID(transform.tileZoom, x, y),
                    tile = tiles[tileID],
                    point;

                // segments starts outside the tile, add entry point
                if (0 <= enter && enter < 1) {
                    point = new Point(
                        ((prevCoord.column + enter * dx) - x) * tileExtent,
                        ((prevCoord.row + enter * dy) - y) * tileExtent);

                    point.continues = true;

                    if (!tile) tiles[tileID] = tile = [];
                    tile.push([point]);
                }

                // segments ends outside the tile, add exit point
                if (0 <= exit && exit < 1) {
                    point = new Point(
                        ((prevCoord.column + exit * dx) - x) * tileExtent,
                        ((prevCoord.row + exit * dy) - y) * tileExtent);

                    point.continues = true;

                    tile[tile.length - 1].push(point);

                // add the point itself
                } else {
                    point = new Point(
                        (coord.column - x) * tileExtent,
                        (coord.row - y) * tileExtent);

                    if (!tile) tiles[tileID] = tile = [[point]];
                    else tile[tile.length - 1].push(point);
                }
            }
        }
    }

    if (rejoin) {
        // reassemble the disconnected segments into a linestring
        // sections of the linestring outside the tile are replaced with segments
        // that follow the tile's edge
        for (var id in tiles) {

            var segments = tiles[id];

            if (!segments[0][0].continues && segments.length > 1) {
                // if the first segment is the beginning of the linestring
                // then join it with the last so that all segments start and
                // end at tile boundaries
                var last = segments.pop();
                Array.prototype.unshift.apply(segments[0], last.slice(0, last.length - 1));
            }

            var start = edgeDist(segments[0][0], tileExtent, padding);

            for (var k = 0; k < segments.length; k++) {
                // Add all tile corners along the path between the current segment's exit point
                // and the next segment's entry point

                var thisExit = edgeDist(segments[k][segments[k].length - 1], paddedExtent);
                var nextEntry = edgeDist(segments[(k + 1) % segments.length][0], paddedExtent);

                var startToExit = (thisExit - start + 4) % 4;
                var startToNextEntry = (nextEntry - start + 4) % 4;
                var direction = (thisExit === nextEntry || startToExit < startToNextEntry) ? 1 : -1;
                var roundFn = direction > 0 ? Math.ceil : Math.floor;

                for (var c = roundFn(thisExit) % 4; c != roundFn(nextEntry) % 4; c = (c + direction + 4) % 4) {
                    var corner = corners[c];
                    segments[k].push(new Point(
                        (corner.x + (corner.x - 0.5 > 0 ? 1 : -1) * padding) * tileExtent,
                        (corner.y + (corner.y - 0.5 > 0 ? 1 : -1) * padding) * tileExtent));
                }
            }

            // Join all segments
            tiles[id] = [Array.prototype.concat.apply([], segments)];
        }
    }

    return tiles;

}

var corners = [
    new Point(0, 0),
    new Point(1, 0),
    new Point(1, 1),
    new Point(0, 1)];

/*
 * Converts to a point to the distance along the edge of the tile (out of 4).
 *
 *         0.5
 *     0 _______ 1
 *      |       |
 *  3.5 |       | 1.5
 *      |       |
 *      |_______|
 *     3   2.5   2
 */
function edgeDist(point, extent) {
    var x = point.x / extent;
    var y = point.y / extent;
    var d;
    if (Math.abs(y - 0.5) >= Math.abs(x - 0.5)) {
        d = Math.round(y) * 2 + (y < 0.5 ? x : 1 - x);
    } else {
        d = Math.round(1 - x) * 2 + (x > 0.5 ? y : 1 - y) + 1;
    }

    return d % 4;
}

},{"../geo/lat_lng":"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/lat_lng.js","../geo/transform":"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/transform.js","./tile_coord":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/tile_coord.js","geojson-rewind":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/geojson-rewind/index.js","point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/vector_tile.js":[function(require,module,exports){
'use strict';

var Tile = require('./tile');
var TileCoord = require('./tile_coord');
var BufferSet = require('../data/buffer/buffer_set');
var util = require('../util/util');
var createBucket = require('../data/create_bucket');

module.exports = VectorTile;

function VectorTile(id, source, url, callback) {
    this.id = id;
    this.loaded = false;
    this.url = url;
    this.zoom = TileCoord.fromID(id).z;
    this.map = source.map;
    this.id = util.uniqueId();
    this.callback = callback;
    this.source = source;

    if (this.zoom >= source.maxzoom) {
        this.depth = this.map.options.maxZoom - this.zoom;
    } else {
        this.depth = 1;
    }
    this.uses = 1;

    this.workerID = this.map.dispatcher.send('load tile', {
        url: this.url,
        id: this.id,
        zoom: this.zoom,
        maxZoom: this.source.maxzoom,
        tileSize: this.source.tileSize,
        source: this.source.id,
        depth: this.depth
    }, this._loaded.bind(this));
}

VectorTile.prototype = util.inherit(Tile, {
    _loaded: function(err, data) {
        // Tile has been removed from the map
        if (!this.map) return;

        if (err) return this.callback(err);

        this.buffers = new BufferSet(data.buffers);
        this.buckets = {};
        for (var b in data.elementGroups) {
            this.buckets[b] = createBucket(this.map.style.buckets[b], this.buffers, undefined, data.elementGroups[b]);
        }

        this.loaded = true;
        this.callback(null, this);
    },

    remove: function() {

        // reuse prerendered textures
        for (var bucket in this.buckets) {
            if (this.buckets[bucket].prerendered) this.map.painter.saveTexture(this.buckets[bucket].prerendered.texture);
        }

        this.map.dispatcher.send('remove tile', { id: this.id, source: this.source.id }, null, this.workerID);
        this.map.painter.glyphAtlas.removeGlyphs(this.id);

        var gl = this.map.painter.gl;
        var buffers = this.buffers;
        if (buffers) {
            for (var b in buffers) {
                buffers[b].destroy(gl);
            }
        }
        delete this.map;
    },

    abort: function() {
        this.map.dispatcher.send('abort tile', { id: this.id, source: this.source.id }, null, this.workerID);
    }
});

},{"../data/buffer/buffer_set":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/buffer_set.js","../data/create_bucket":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/create_bucket.js","../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","./tile":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/tile.js","./tile_coord":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/tile_coord.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/video_source.js":[function(require,module,exports){
'use strict';

var util = require('../util/util');
var Tile = require('./tile');
var TileCoord = require('./tile_coord');
var LatLng = require('../geo/lat_lng');
var Point = require('point-geometry');
var Source = require('./source');
var ajax = require('../util/ajax');

module.exports = VideoSource;

function VideoSource(options) {
    this.coordinates = options.coordinates;

    ajax.getVideo(typeof options.url === 'string' ? [options.url] : options.url, function(err, video) {
        // @TODO handle errors via event.
        if (err) return;

        this.video = video;
        this.video.loop = true;

        var loopID;

        // start repainting when video starts playing
        this.video.addEventListener('playing', function() {
            loopID = this.map.style.animationLoop.set(Infinity);
            this.map._rerender();
        }.bind(this));

        // stop repainting when video stops
        this.video.addEventListener('pause', function() {
            this.map.style.animationLoop.cancel(loopID);
        }.bind(this));

        this.enabled = true;

        if (this.map) {
            this.video.play();
            this.createTile();
            this.map.update();
        }
    }.bind(this));
}

VideoSource.prototype = util.inherit(Source, {
    onAdd: function(map) {
        this.map = map;
        if (this.video) {
            this.video.play();
            this.createTile();
        }
    },

    createTile: function() {
        /*
         * Calculate which mercator tile is suitable for rendering the video in
         * and create a buffer with the corner coordinates. These coordinates
         * may be outside the tile, because raster tiles aren't clipped when rendering.
         */
        var map = this.map;
        var coords = this.coordinates.map(function(latlng) {
            var loc = LatLng.convert(latlng);
            return TileCoord.zoomTo(map.transform.locationCoordinate(loc), 0);
        });

        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;

        for (var i = 0; i < coords.length; i++) {
            minX = Math.min(minX, coords[i].column);
            minY = Math.min(minY, coords[i].row);
            maxX = Math.max(maxX, coords[i].column);
            maxY = Math.max(maxY, coords[i].row);
        }

        var dx = maxX - minX;
        var dy = maxY - minY;
        var dMax = Math.max(dx, dy);
        var center = TileCoord.zoomTo({
            column: (minX + maxX) / 2,
            row: (minY + maxY) / 2,
            zoom: 0
        }, Math.floor(-Math.log(dMax) / Math.LN2));

        var tileExtent = 4096;
        var tileCoords = coords.map(function(coord) {
            var zoomedCoord = TileCoord.zoomTo(coord, center.zoom);
            return new Point(
                Math.round((zoomedCoord.column - center.column) * tileExtent),
                Math.round((zoomedCoord.row - center.row) * tileExtent));
        });

        var gl = map.painter.gl;
        var maxInt16 = 32767;
        var array = new Int16Array([
            tileCoords[0].x, tileCoords[0].y, 0, 0,
            tileCoords[1].x, tileCoords[1].y, maxInt16, 0,
            tileCoords[3].x, tileCoords[3].y, 0, maxInt16,
            tileCoords[2].x, tileCoords[2].y, maxInt16, maxInt16
        ]);
        this.boundsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.boundsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

        this.tile = new Tile();
        this.center = center;
    },

    load: function() {
        // noop
    },

    loaded: function() {
        return this.video && this.video.readyState >= 2;
    },

    update: function() {
        // noop
    },

    render: function(layers) {
        if (!this.enabled) return;
        if (this.video.readyState < 2) return; // not enough data for current position

        var layer = layers[0];

        var bucket = {
            type: 'raster',
            tile: this,
            boundsBuffer: this.boundsBuffer,
            bind: this.bind.bind(this)
        };

        var buckets = {};
        buckets[layer.bucket] = bucket;

        var c = this.center;
        this.tile.calculateMatrices(c.zoom, c.column, c.row, this.map.transform, this.map.painter);
        this.map.painter.tile = this.tile;
        this.map.painter.drawLayer(undefined, this.map.style, layer, {}, undefined, buckets);
    },

    bind: function(gl) {
        if (!this.texture) {
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);

        } else {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
        }
    },

    featuresAt: function(point, params, callback) {
        // TODO return pixel?
        return callback(null, []);
    }
});

},{"../geo/lat_lng":"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/lat_lng.js","../util/ajax":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/ajax.js","../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","./source":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/source.js","./tile":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/tile.js","./tile_coord":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/tile_coord.js","point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/worker.js":[function(require,module,exports){
'use strict';

var Actor = require('../util/actor');
var featureFilter = require('feature-filter');
var WorkerTile = require('./worker_tile');
var tileGeoJSON = require('./tile_geojson');
var Wrapper = require('./geojson_wrapper');
var util = require('../util/util');
var queue = require('queue-async');
var ajax = require('../util/ajax');
var vt = require('vector-tile');
var Protobuf = require('pbf');

module.exports = Worker;

function Worker(self) {
    this.self = self;
    this.actor = new Actor(self, this);
    this.loading = {};
    this.loaded = {};
    this.buckets = [];
}

util.extend(Worker.prototype, {
    alert: function() {
        this.self.postMessage({
            type: 'alert message',
            data: [].slice.call(arguments)
        });
    },

    'set buckets': function(buckets) {
        this.buckets = buckets;
        for (var i = 0; i < this.buckets.length; i++) {
            var bucket = this.buckets[i];
            bucket.compare = featureFilter(bucket.filter);
        }
    },

    'load tile': function(params, callback) {
        var source = params.source,
            id = params.id;

        if (!this.loading[source])
            this.loading[source] = {};

        this.loading[source][id] = ajax.getArrayBuffer(params.url, function(err, data) {
            delete this.loading[source][id];

            if (err) return callback(err);

            var tile = new WorkerTile(
                params.id, params.zoom, params.maxZoom,
                params.tileSize, params.source, params.depth);

            tile.parse(new vt.VectorTile(new Protobuf(new Uint8Array(data))), this.buckets, this.actor, callback);

            this.loaded[source] = this.loaded[source] || {};
            this.loaded[source][id] = tile;
        }.bind(this));
    },

    'abort tile': function(params) {
        var source = this.loading[params.source];
        if (source && source[params.id]) {
            source[params.id].abort();
            delete source[params.id];
        }
    },

    'remove tile': function(params) {
        var source = params.source,
            id = params.id;
        if (this.loaded[source] && this.loaded[source][id]) {
            delete this.loaded[source][id];
        }
    },

    'parse geojson': function(params, callback) {
        var data = params.data,
            zooms = params.zooms,
            len = zooms.length,
            maxZoom = zooms[len - 1],
            buckets = this.buckets,
            actor = this.actor,
            q = queue();

        function worker(id, geoJSON, zoom, callback) {
            var tile = new WorkerTile(id, zoom, maxZoom, params.tileSize, params.source, 4);
            tile.parse(new Wrapper(geoJSON), buckets, actor, function(err, data) {
                if (err) return callback(err);
                data.id = id;
                callback(null, data);
            });
        }

        function tileData(err, data) {
            if (err) throw err;
            for (var i = 0; i < len; i++) {
                var zoom = zooms[i];
                var tiles = tileGeoJSON(data, zoom);
                for (var id in tiles) {
                    q.defer(worker, id, tiles[id], zoom);
                }
            }
            q.awaitAll(callback);
        }

        if (typeof data === 'string') ajax.getJSON(data, tileData);
        else tileData(null, data);
    },

    'query features': function(params, callback) {
        var tile = this.loaded[params.source] && this.loaded[params.source][params.id];
        if (tile) {
            tile.featureTree.query(params, callback);
        } else {
            callback(null, []);
        }
    }
});

},{"../util/actor":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/actor.js","../util/ajax":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/ajax.js","../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","./geojson_wrapper":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/geojson_wrapper.js","./tile_geojson":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/tile_geojson.js","./worker_tile":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/worker_tile.js","feature-filter":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/feature-filter/index.js","pbf":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/pbf/index.js","queue-async":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/queue-async/queue.js","vector-tile":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/vector-tile/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/worker_tile.js":[function(require,module,exports){
'use strict';

var FeatureTree = require('../data/feature_tree');
var vt = require('vector-tile');
var Collision = require('../symbol/collision');

var BufferSet = require('../data/buffer/buffer_set');
var createBucket = require('../data/create_bucket');

module.exports = WorkerTile;

function WorkerTile(id, zoom, maxZoom, tileSize, source, depth) {
    this.id = id;
    this.zoom = zoom;
    this.maxZoom = maxZoom;
    this.tileSize = tileSize;
    this.source = source;
    this.depth = depth;
    this.buffers = new BufferSet();
}

/*
 * Given tile data, parse raw vertices and data, create a vector
 * tile and parse it into ready-to-render vertices.
 *
 * @param {object} data
 * @param {function} respond
 */
WorkerTile.prototype.parse = function(data, bucketInfo, actor, callback) {
    var tile = this;

    this.data = data;
    this.callback = callback;

    var tileExtent = 4096;
    this.collision = new Collision(this.zoom, tileExtent, this.tileSize, this.depth);
    this.featureTree = new FeatureTree(getGeometry, getType);

    var buckets = this.buckets = sortTileIntoBuckets(this, data, bucketInfo);

    var key, bucket;
    var prevPlacementBucket;

    var remaining = bucketInfo.length;

    /*
     *  The async parsing here is a bit tricky.
     *  Some buckets depend on resources that may need to be loaded async (glyphs).
     *  Some buckets need to be parsed in order (to get placement priorities right).
     *
     *  Dependencies calls are initiated first to get those rolling.
     *  Buckets that don't need to be parsed in order, aren't to save time.
     */

    for (var i = 0; i < bucketInfo.length; i++) {
        bucket = buckets[bucketInfo[i].id];

        if (bucketInfo[i].source !== this.source || !bucket) {
            remaining--;
            continue; // raster bucket, etc
        }

        // Link buckets that need to be parsed in order
        if (bucket.collision) {
            if (prevPlacementBucket) {
                prevPlacementBucket.next = bucket;
            } else {
                bucket.previousPlaced = true;
            }
            prevPlacementBucket = bucket;
        }

        if (bucket.getDependencies) {
            bucket.getDependencies(this, actor, dependenciesDone(bucket));
        }
    }

    // parse buckets where order doesn't matter and no dependencies
    for (key in buckets) {
        bucket = buckets[key];
        if (!bucket.getDependencies && !bucket.collision) {
            parseBucket(tile, bucket);
        }
    }

    function dependenciesDone(bucket) {
        return function(err) {
            bucket.dependenciesLoaded = true;
            parseBucket(tile, bucket, err);
        };
    }

    function parseBucket(tile, bucket, skip) {
        if (bucket.getDependencies && !bucket.dependenciesLoaded) return;
        if (bucket.collision && !bucket.previousPlaced) return;

        if (!skip) {
            var now = Date.now();
            if (bucket.type !== 'raster') bucket.addFeatures();
            var time = Date.now() - now;
            if (bucket.interactive) {
                for (var i = 0; i < bucket.features.length; i++) {
                    var feature = bucket.features[i];
                    tile.featureTree.insert(feature.bbox(), bucket.name, feature);
                }
            }
            if (typeof self !== 'undefined') {
                self.bucketStats = self.bucketStats || {_total: 0};
                self.bucketStats._total += time;
                self.bucketStats[bucket.name] = (self.bucketStats[bucket.name] || 0) + time;
            }
        }

        remaining--;
        if (!remaining) return tile.done();

        // try parsing the next bucket, if it is ready
        if (bucket.next) {
            bucket.next.previousPlaced = true;
            parseBucket(tile, bucket.next);
        }
    }
};

WorkerTile.prototype.done = function() {
    // Collect all buffers to mark them as transferable object.
    var buffers = [];

    for (var type in this.buffers) {
        buffers.push(this.buffers[type].array);
    }

    // Convert buckets to a transferable format
    var buckets = this.buckets;
    var elementGroups = {};
    for (var b in buckets) elementGroups[b] = buckets[b].elementGroups;

    this.callback(null, {
        elementGroups: elementGroups,
        buffers: this.buffers
    }, buffers);

    // we don't need anything except featureTree at this point, so we mark it for GC
    this.buffers = null;
    this.collision = null;
    this.buckets = null;
};

function sortTileIntoBuckets(tile, data, bucketInfo) {

    var sourceLayers = {},
        buckets = {},
        layerName;

    // For each source layer, find a list of buckets that use data from it
    for (var i = 0; i < bucketInfo.length; i++) {
        var info = bucketInfo[i];
        var bucketName = info.id;

        var minZoom = info.minzoom;
        var maxZoom = info.maxzoom;

        if (info.source !== tile.source) continue;
        if (minZoom && tile.zoom < minZoom && minZoom < tile.maxZoom) continue;
        if (maxZoom && tile.zoom >= maxZoom) continue;

        var bucket = createBucket(info, tile.buffers, tile.collision);
        if (!bucket) continue;
        bucket.features = [];
        bucket.name = bucketName;
        buckets[bucketName] = bucket;

        if (data.layers) {
            // vectortile
            layerName = info['source-layer'];
            if (!sourceLayers[layerName]) sourceLayers[layerName] = {};
            sourceLayers[layerName][bucketName] = info;
        } else {
            // geojson tile
            sourceLayers[bucketName] = info;
        }
    }

    // read each layer, and sort its feature's into buckets
    if (data.layers) {
        // vectortile
        for (layerName in sourceLayers) {
            var layer = data.layers[layerName];
            if (!layer) continue;
            sortLayerIntoBuckets(layer, sourceLayers[layerName], buckets);
        }
    } else {
        // geojson
        sortLayerIntoBuckets(data, sourceLayers, buckets);
    }

    return buckets;
}

/*
 * Sorts features in a layer into different buckets, according to the maping
 *
 * Layers in vector tiles contain many different features, and feature types,
 * e.g. the landuse layer has parks, industrial buildings, forests, playgrounds
 * etc. However, when styling, we need to separate these features so that we can
 * render them separately with different styles.
 *
 * @param {VectorTileLayer} layer
 * @param {Mapping} mapping
 */
function sortLayerIntoBuckets(layer, mapping, buckets) {
    for (var i = 0; i < layer.length; i++) {
        var feature = layer.feature(i);
        for (var key in mapping) {
            if (mapping[key].compare(feature)) {
                buckets[key].features.push(feature);
            }
        }
    }
}

function getGeometry(feature) {
    return feature.loadGeometry();
}

function getType(feature) {
    return vt.VectorTileFeature.types[feature.type];
}

},{"../data/buffer/buffer_set":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/buffer/buffer_set.js","../data/create_bucket":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/create_bucket.js","../data/feature_tree":"/home/pnorman/vector_tiles/mapbox-gl-js/js/data/feature_tree.js","../symbol/collision":"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/collision.js","vector-tile":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/vector-tile/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/animation_loop.js":[function(require,module,exports){
'use strict';

module.exports = AnimationLoop;

function AnimationLoop() {
    this.n = 0;
    this.times = [];
}

// Are all animations done?
AnimationLoop.prototype.stopped = function() {
    this.times = this.times.filter(function(t) {
        return t.time >= (new Date()).getTime();
    });
    return !this.times.length;
};

// Add a new animation that will run t milliseconds
// Returns an id that can be used to cancel it layer
AnimationLoop.prototype.set = function(t) {
    this.times.push({ id: this.n, time: t + (new Date()).getTime() });
    return this.n++;
};

// Cancel an animation
AnimationLoop.prototype.cancel = function(n) {
    this.times = this.times.filter(function(t) {
        return t.id != n;
    });
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/image_sprite.js":[function(require,module,exports){
'use strict';

var Evented = require('../util/evented');
var ajax = require('../util/ajax');
var browser = require('../util/browser');

module.exports = ImageSprite;

function ImageSprite(base) {
    this.base = base;
    this.retina = browser.devicePixelRatio > 1;

    base = this.base + (this.retina ? '@2x' : '');

    ajax.getJSON(base + '.json', function(err, data) {
        // @TODO handle errors via sprite event.
        if (err) return;
        this.data = data;
        if (this.img) this.fire('loaded');
    }.bind(this));

    ajax.getImage(base + '.png', function(err, img) {
        // @TODO handle errors via sprite event.
        if (err) return;

        // premultiply the sprite
        var data = img.getData();
        var newdata = img.data = new Uint8Array(data.length);
        for (var i = 0; i < data.length; i+=4) {
            var alpha = data[i + 3] / 255;
            newdata[i + 0] = data[i + 0] * alpha;
            newdata[i + 1] = data[i + 1] * alpha;
            newdata[i + 2] = data[i + 2] * alpha;
            newdata[i + 3] = data[i + 3];
        }

        this.img = img;
        if (this.data) this.fire('loaded');
    }.bind(this));
}

ImageSprite.prototype = Object.create(Evented);

ImageSprite.prototype.toJSON = function() {
    return this.base;
};

ImageSprite.prototype.loaded = function() {
    return !!(this.data && this.img);
};

ImageSprite.prototype.resize = function(gl) {
    if (browser.devicePixelRatio > 1 !== this.retina) {
        var newSprite = new ImageSprite(this.base);
        newSprite.on('loaded', function() {
            this.img = newSprite.img;
            this.data = newSprite.data;
            this.retina = newSprite.retina;

            if (this.texture) {
                gl.deleteTexture(this.texture);
                delete this.texture;
            }
        }.bind(this));
    }
};

ImageSprite.prototype.bind = function(gl, linear) {
    if (!this.loaded())
        return;

    if (!this.texture) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        var img = this.img;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, img.width, img.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, img.data);

    } else {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    var filter = linear ? gl.LINEAR : gl.NEAREST;
    if (filter !== this.filter) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    }
};

ImageSprite.prototype.getPosition = function(name, repeating) {

    // `repeating` indicates that the image will be used in a repeating pattern
    // repeating pattern images are assumed to have a 1px padding that mirrors the opposite edge
    // positions for repeating images are adjusted to exclude the edge
    repeating = repeating === true ? 1 : 0;

    var pos = this.data && this.data[name];
    if (pos && this.img) {
        var width = this.img.width;
        var height = this.img.height;
        return {
            size: [pos.width / pos.pixelRatio, pos.height / pos.pixelRatio],
            tl: [(pos.x + repeating)/ width, (pos.y + repeating) / height],
            br: [(pos.x + pos.width - 2 * repeating) / width, (pos.y + pos.height - 2 * repeating) / height]
        };
    }
};

},{"../util/ajax":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/ajax.js","../util/browser":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/browser.js","../util/evented":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/evented.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/layout_properties.js":[function(require,module,exports){
'use strict';

var reference = require('./reference');

module.exports = {};

reference.layout.forEach(function(className) {
    var Properties = function(props) {
        for (var p in props) {
            this[p] = props[p];
        }
    };

    var properties = reference[className];
    for (var prop in properties) {
        if (properties[prop]['default'] === undefined) continue;
        Properties.prototype[prop] = properties[prop]['default'];
    }
    module.exports[className.replace('layout_','')] = Properties;
});

},{"./reference":"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/reference.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/paint_properties.js":[function(require,module,exports){
'use strict';

var reference = require('./reference');
var parseCSSColor = require('csscolorparser').parseCSSColor;

module.exports = {};

reference.paint.forEach(function(className) {
    var Calculated = function() {};

    var properties = reference[className];
    for (var p in properties) {
        var prop = properties[p],
            value = prop['default'];

        if (value === undefined) continue;
        if (prop.type === 'color') value = parseCSSColor(value);

        Calculated.prototype[p] = value;
    }

    Calculated.prototype.hidden = false;
    module.exports[className.replace('paint_','')] = Calculated;
});

},{"./reference":"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/reference.js","csscolorparser":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/csscolorparser/csscolorparser.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/reference.js":[function(require,module,exports){
module.exports = require('mapbox-gl-style-spec/reference/v6');

},{"mapbox-gl-style-spec/reference/v6":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/mapbox-gl-style-spec/reference/v6.json"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/style.js":[function(require,module,exports){
'use strict';

var Evented = require('../util/evented');
var StyleTransition = require('./style_transition');
var StyleDeclaration = require('./style_declaration');
var StyleConstant = require('./style_constant');
var PaintProperties = require('./paint_properties');
var ImageSprite = require('./image_sprite');
var util = require('../util/util');

module.exports = Style;

/*
 * The map style's current state
 *
 * The stylesheet object is not modified. To change the style, just change
 * the the stylesheet object and trigger a cascade.
 */
function Style(stylesheet, animationLoop) {
    if (stylesheet.version !== 6) console.warn('Stylesheet version must be 6');
    if (!Array.isArray(stylesheet.layers)) console.warn('Stylesheet must have layers');

    this.classes = {};
    this.stylesheet = stylesheet;
    this.animationLoop = animationLoop;

    this.buckets = {};
    this.orderedBuckets = [];
    this.transitions = {};
    this.computed = {};
    this.sources = {};

    this.cascade({transition: false});

    if (stylesheet.sprite) this.setSprite(stylesheet.sprite);
}

Style.prototype = Object.create(Evented);

function premultiplyLayer(layer, type) {
    var colorProp = type + '-color',
        haloProp = type + '-halo-color',
        outlineProp = type + '-outline-color',
        color = layer[colorProp],
        haloColor = layer[haloProp],
        outlineColor = layer[outlineProp],
        opacity = layer[type + '-opacity'];

    var colorOpacity = color && (opacity * color[3]);
    var haloOpacity = haloColor && (opacity * haloColor[3]);
    var outlineOpacity = outlineColor && (opacity * outlineColor[3]);

    if (colorOpacity !== undefined && colorOpacity < 1) {
        layer[colorProp] = util.premultiply([color[0], color[1], color[2], colorOpacity]);
    }
    if (haloOpacity !== undefined && haloOpacity < 1) {
        layer[haloProp] = util.premultiply([haloColor[0], haloColor[1], haloColor[2], haloOpacity]);
    }
    if (outlineOpacity !== undefined && outlineOpacity < 1) {
        layer[outlineProp] = util.premultiply([outlineColor[0], outlineColor[1], outlineColor[2], outlineOpacity]);
    }
}

// Formerly known as zoomed styles
Style.prototype.recalculate = function(z) {
    if (typeof z !== 'number') console.warn('recalculate expects zoom level');

    var transitions = this.transitions;
    var layerValues = {};

    this.sources = {};

    this.rasterFadeDuration = 300;

    for (var name in transitions) {
        var layer = transitions[name],
            bucket = this.buckets[layer.ref || name],
            layerType = this.layermap[name].type;

        if (!PaintProperties[layerType]) {
            console.warn('unknown layer type ' + layerType);
            continue;
        }
        var appliedLayer = layerValues[name] = new PaintProperties[layerType]();
        for (var rule in layer) {
            var transition = layer[rule];
            appliedLayer[rule] = transition.at(z);
        }

        if (layerType === 'symbol') {
            if ((appliedLayer['text-opacity'] === 0 || !bucket.layout['text-field']) &&
                (appliedLayer['icon-opacity'] === 0 || !bucket.layout['icon-image'])) {
                appliedLayer.hidden = true;
            } else {
                premultiplyLayer(appliedLayer, 'text');
                premultiplyLayer(appliedLayer, 'icon');
            }
        } else {
            if (appliedLayer[layerType + '-opacity'] === 0) {
                appliedLayer.hidden = true;
            } else {
                premultiplyLayer(appliedLayer, layerType);
            }
        }

        // Find all the sources that are currently being used
        // so that we can automatically enable/disable them as needed
        if (!appliedLayer.hidden) {
            var source = bucket && bucket.source;

            // mark source as used so that tiles are downloaded
            if (source) this.sources[source] = true;
        }

        if (appliedLayer['raster-fade-duration']) {
            this.rasterFadeDuration = Math.max(this.rasterFadeDuration, appliedLayer['raster-fade-duration']);
        }
    }

    this.computed = layerValues;

    this.z = z;
    this.fire('zoom');
};

Style.prototype._simpleLayer = function(layer) {
    var simple = {};
    simple.id = layer.id;

    var bucket = this.buckets[layer.ref || layer.id];
    if (bucket) simple.bucket = bucket.id;
    if (layer.type) simple.type = layer.type;

    if (layer.layers) {
        simple.layers = [];
        for (var i = 0; i < layer.layers.length; i++) {
            simple.layers.push(this._simpleLayer(layer.layers[i]));
        }
    }
    return simple;
};

// Split the layers into groups of consecutive layers with the same datasource
Style.prototype._groupLayers = function(layers) {
    var g = 0;
    var groups = [];
    var group;

    // loop over layers top down
    for (var i = layers.length - 1; i >= 0; i--) {
        var layer = layers[i];

        var bucket = this.buckets[layer.ref || layer.id];
        var source = bucket && bucket.source;

        // if the current layer is in a different source
        if (group && source !== group.source) g++;

        if (!groups[g]) {
            group = [];
            group.source = source;
            groups[g] = group;
        }

        group.push(this._simpleLayer(layer));
    }

    return groups;
};

/*
 * Take all the rules and declarations from the stylesheet,
 * and figure out which apply currently
 */
Style.prototype.cascade = function(options) {
    options = options || {
        transition: true
    };

    var i, b;
    var id;
    var prop;
    var layer;
    var className;
    var paintName;
    var paintProps;
    var transProps;
    var constants = this.stylesheet.constants;

    // derive buckets from layers
    this.orderedBuckets = [];
    this.buckets = getbuckets({}, this.orderedBuckets, this.stylesheet.layers);
    function getbuckets(buckets, ordered, layers) {
        for (var a = 0; a < layers.length; a++) {
            var layer = layers[a];
            if (layer.layers) {
                buckets = getbuckets(buckets, ordered, layer.layers);
            }
            if (!layer.source || !layer.type) {
                continue;
            }
            var bucket = { id: layer.id };
            for (var prop in layer) {
                if ((/^paint/).test(prop)) continue;
                bucket[prop] = layer[prop];
            }
            bucket.layout = StyleConstant.resolve(bucket.layout, constants);
            buckets[layer.id] = bucket;
            ordered.push(bucket);
        }
        return buckets;
    }

    // class keys
    var paintNames = ['paint'];
    for (className in this.classes) paintNames.push('paint.' + className);

    // apply layer group inheritance resulting in a flattened array
    var flattened = flattenLayers(this.stylesheet.layers);

    // map layer ids to layer definitions for resolving refs
    var layermap = this.layermap = {};
    for (i = 0; i < flattened.length; i++) {
        layer = flattened[i];

        var newLayer = {};
        for (var k in layer) {
            if (k === 'layers') continue;
            newLayer[k] = layer[k];
        }

        layermap[layer.id] = newLayer;
        flattened[i] = newLayer;
    }

    for (i = 0; i < flattened.length; i++) {
        flattened[i] = resolveLayer(layermap, flattened[i]);
    }

    // Resolve layer references.
    function resolveLayer(layermap, layer) {
        if (!layer.ref || !layermap[layer.ref]) return layer;

        var parent = resolveLayer(layermap, layermap[layer.ref]);
        layer.layout = parent.layout;
        layer.type = parent.type;
        layer.filter = parent.filter;
        layer.source = parent.source;
        layer['source-layer'] = parent['source-layer'];
        layer.minzoom = parent.minzoom;
        layer.maxzoom = parent.maxzoom;

        return layer;
    }

    // Flatten composite layer structures.
    function flattenLayers(layers) {
        var flat = [];
        for (var i = 0; i < layers.length; i++) {
            flat.push(layers[i]);
            if (layers[i].layers) {
                flat.push.apply(flat, flattenLayers(layers[i].layers));
            }
        }
        return flat;
    }

    var transitions = {};
    var globalTrans = this.stylesheet.transition;

    for (i = 0; i < flattened.length; i++) {
        layer = flattened[i];

        id = layer.id;
        paintProps = {};
        transProps = {};

        // basic cascading of paint properties
        for (b = 0; b < paintNames.length; b++) {
            paintName = paintNames[b];
            if (!layer[paintName]) continue;
            // set paint properties
            for (prop in layer[paintName]) {
                var match = prop.match(/^(.*)-transition$/);
                if (match) {
                    transProps[match[1]] = layer[paintName][prop];
                } else {
                    paintProps[prop] = layer[paintName][prop];
                }
            }
        }

        paintProps = StyleConstant.resolve(paintProps, constants);

        var renderType = layer.type;
        transitions[id] = {};

        for (prop in paintProps) {
            var newDeclaration = new StyleDeclaration(renderType, prop, paintProps[prop]);
            var oldTransition = this.transitions[id] && this.transitions[id][prop];
            var newStyleTrans = {};
            newStyleTrans.duration = transProps[prop] && transProps[prop].duration ? transProps[prop].duration : globalTrans && globalTrans.duration ? globalTrans.duration : 300;
            newStyleTrans.delay = transProps[prop] && transProps[prop].delay ? transProps[prop].delay : globalTrans && globalTrans.delay ? globalTrans.delay : 0;

            if (!options.transition) {
                newStyleTrans.duration = 0;
                newStyleTrans.delay = 0;
            }

            // Only create a new transition if the declaration changed
            if (!oldTransition || oldTransition.declaration.json !== newDeclaration.json) {
                var newTransition = new StyleTransition(newDeclaration, oldTransition, newStyleTrans);
                transitions[id][prop] = newTransition;

                // Run the animation loop until the end of the transition
                if (!newTransition.instant()) {
                    newTransition.loopID = this.animationLoop.set(newTransition.endTime - (new Date()).getTime());
                }

                if (oldTransition) {
                    this.animationLoop.cancel(oldTransition.loopID);
                }
            } else {
                transitions[id][prop] = oldTransition;
            }
        }
    }

    this.transitions = transitions;
    this.layerGroups = this._groupLayers(this.stylesheet.layers);

    this.fire('change');
};

/* This should be moved elsewhere. Localizing resources doesn't belong here */
Style.prototype.setSprite = function(sprite) {
    this.sprite = new ImageSprite(sprite);
    this.sprite.on('loaded', this.fire.bind(this, 'change'));
};

// Modify classes
Style.prototype.addClass = function(n, options) {
    if (this.classes[n]) return; // prevent unnecessary recalculation
    this.classes[n] = true;
    this.cascade(options);
};

Style.prototype.removeClass = function(n, options) {
    if (!this.classes[n]) return; // prevent unnecessary recalculation
    delete this.classes[n];
    this.cascade(options);
};

Style.prototype.hasClass = function(n) {
    return !!this.classes[n];
};

Style.prototype.setClassList = function(l, options) {
    this.classes = {};
    for (var i = 0; i < l.length; i++) {
        this.classes[l[i]] = true;
    }
    this.cascade(options);
};

Style.prototype.getClassList = function() {
    return Object.keys(this.classes);
};

Style.prototype.getLayer = function(id) {
    return this.layermap[id];
};

},{"../util/evented":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/evented.js","../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","./image_sprite":"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/image_sprite.js","./paint_properties":"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/paint_properties.js","./style_constant":"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/style_constant.js","./style_declaration":"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/style_declaration.js","./style_transition":"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/style_transition.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/style_constant.js":[function(require,module,exports){
'use strict';

var util = require('../util/util');

module.exports.resolve = function (properties, constants) {
    if (!constants)
        return properties;

    var result = {}, i;

    function resolve(value) {
        return typeof value === 'string' && value[0] === '@' ? constants[value] : value;
    }

    for (var key in properties) {
        var value = resolve(properties[key]);

        if (Array.isArray(value)) {
            value = value.slice();

            for (i = 0; i < value.length; i++) {
                if (value[i] in constants) {
                    value[i] = resolve(value[i]);
                }
            }
        }

        if (value.stops) {
            value = util.extend({}, value);
            value.stops = value.stops.slice();

            for (i = 0; i < value.stops.length; i++) {
                if (value.stops[i][1] in constants) {
                    value.stops[i] = [
                                value.stops[i][0],
                        resolve(value.stops[i][1])
                    ];
                }
            }
        }

        result[key] = value;
    }

    return result;
};

},{"../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/style_declaration.js":[function(require,module,exports){
'use strict';

var util = require('../util/util');
var reference = require('./reference');
var parseCSSColor = require('csscolorparser').parseCSSColor;

module.exports = StyleDeclaration;

/*
 * A parsed representation of a property:value pair
 */
function StyleDeclaration(renderType, prop, value) {
    var className = 'paint_' + renderType;
    var propReference = reference[className] && reference[className][prop];
    if (!propReference) return;

    this.value = this.parseValue(value, propReference.type, propReference.values);
    this.prop = prop;
    this.type = propReference.type;

    // immuatable representation of value. used for comparison
    this.json = JSON.stringify(value);

}

StyleDeclaration.prototype.calculate = function(z) {
    return typeof this.value === 'function' ? this.value(z) : this.value;
};

StyleDeclaration.prototype.parseValue = function(value, type, values) {
    if (type === 'color') {
        return parseColor(value);
    } else if (type === 'number') {
        return parseNumber(value);
    } else if (type === 'boolean') {
        return Boolean(value);
    } else if (type === 'image') {
        return String(value);
    } else if (type === 'string') {
        return String(value);
    } else if (type === 'array') {
        return parseNumberArray(value);
    } else if (type === 'enum' && Array.isArray(values)) {
        return values.indexOf(value) >= 0 ? value : undefined;
    } else {
        console.warn(type + ' is not a supported property type');
    }
};

function parseNumber(num) {
    if (num.stops) num = stopsFn(num);
    var value = +num;
    return !isNaN(value) ? value : num;
}

function parseNumberArray(array) {
    var widths = array.map(parseNumber);

    return function(z) {
        var result = [];
        for (var i = 0; i < widths.length; i++) {
            result.push(typeof widths[i] === 'function' ? widths[i](z) : widths[i]);
        }
        return result;
    };
}

var colorCache = {};

function parseColor(value) {
    if (value.stops) return stopsFn(value, true);
    if (colorCache[value]) return colorCache[value];

    var color = colorCache[value] = prepareColor(parseCSSColor(value));
    return color;
}

function stopsFn(params, color) {
    var stops = params.stops;
    var base = params.base || reference.function.base.default;

    return function(z) {

        // find the two stops which the current z is between
        var low, high;

        for (var i = 0; i < stops.length; i++) {
            var stop = stops[i];
            if (stop[0] <= z) low = stop;
            if (stop[0] > z) {
                high = stop;
                break;
            }
        }

        if (low && high) {
            var zoomDiff = high[0] - low[0],
                zoomProgress = z - low[0],

                t = base === 1 ?
                    zoomProgress / zoomDiff :
                    (Math.pow(base, zoomProgress) - 1) / (Math.pow(base, zoomDiff) - 1);

            if (color) return interpColor(parseColor(low[1]), parseColor(high[1]), t);
            else return util.interp(low[1], high[1], t);

        } else if (low) {
            if (color) return parseColor(low[1]);
            else return low[1];

        } else if (high) {
            if (color) return parseColor(high[1]);
            else return high[1];

        } else {
            if (color) return [0, 0, 0, 1];
            else return 1;
        }
    };
}

function prepareColor(c) {
    return [c[0] / 255, c[1] / 255, c[2] / 255, c[3] / 1];
}

function interpColor(from, to, t) {
    return [
        util.interp(from[0], to[0], t),
        util.interp(from[1], to[1], t),
        util.interp(from[2], to[2], t),
        util.interp(from[3], to[3], t)
    ];
}

},{"../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","./reference":"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/reference.js","csscolorparser":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/csscolorparser/csscolorparser.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/style_transition.js":[function(require,module,exports){
'use strict';

var util = require('../util/util');

module.exports = StyleTransition;

/*
 * Represents a transition between two declarations
 */
function StyleTransition(declaration, oldTransition, value) {

    this.declaration = declaration;
    this.startTime = this.endTime = (new Date()).getTime();

    var type = declaration.type;
    if (type === 'number') {
        this.interp = util.interp;
    } else if (type === 'color') {
        this.interp = interpColor;
    } else if (type === 'array') {
        this.interp = interpNumberArray;
    }

    this.oldTransition = oldTransition;
    this.duration = value.duration || 0;
    this.delay = value.delay || 0;

    if (!this.instant()) {
        this.endTime = this.startTime + this.duration + this.delay;
        this.ease = util.easeCubicInOut;
    }

    if (oldTransition && oldTransition.endTime <= this.startTime) {
        // Old transition is done running, so we can
        // delete its reference to its old transition.

        delete oldTransition.oldTransition;
    }
}

StyleTransition.prototype.instant = function() {
    return !this.oldTransition || !this.interp || (this.duration === 0 && this.delay === 0);
};

/*
 * Return the value of the transitioning property at zoom level `z` and optional time `t`
 */
StyleTransition.prototype.at = function(z, t) {

    var value = this.declaration.calculate(z);

    if (this.instant()) return value;

    t = t || Date.now();

    if (t < this.endTime) {
        var oldValue = this.oldTransition.at(z, this.startTime);
        var eased = this.ease((t - this.startTime - this.delay) / this.duration);
        value = this.interp(oldValue, value, eased);
    }

    return value;

};

function interpNumberArray(from, to, t) {
    return from.map(function(d, i) {
        return util.interp(d, to[i], t);
    });
}

function interpColor(from, to, t) {
    return [
        util.interp(from[0], to[0], t),
        util.interp(from[1], to[1], t),
        util.interp(from[2], to[2], t),
        util.interp(from[3], to[3], t)
    ];
}

},{"../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/anchor.js":[function(require,module,exports){
'use strict';

var Point = require('point-geometry');

module.exports = Anchor;

function Anchor(x, y, angle, scale, segment) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.scale = scale;

    if (segment !== undefined) {
        this.segment = segment;
    }
}

Anchor.prototype = Object.create(Point.prototype);

Anchor.prototype.clone = function() {
    return new Anchor(this.x, this.y, this.angle, this.scale, this.segment);
};

},{"point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/bin_pack.js":[function(require,module,exports){
'use strict';

module.exports = BinPack;
function BinPack(width, height) {
    this.width = width;
    this.height = height;
    this.free = [{ x: 0, y: 0, w: width, h: height }];
}

BinPack.prototype.release = function(rect) {
    // Simple algorithm to recursively merge the newly released cell with its
    // neighbor. This doesn't merge more than two cells at a time, and fails
    // for complicated merges.
    for (var i = 0; i < this.free.length; i++) {
        var free = this.free[i];
        if (free.y == rect.y && free.h == rect.h && free.x + free.w == rect.x) {
            free.w += rect.w;
        }
        else if (free.x == rect.x && free.w == rect.w && free.y + free.h == rect.y) {
            free.h += rect.h;
        }
        else if (rect.y == free.y && rect.h == free.h && rect.x + rect.w == free.x) {
            free.x = rect.x;
            free.w += rect.w;
        }
        else if (rect.x == free.x && rect.w == free.w && rect.y + rect.h == free.y) {
            free.y = rect.y;
            free.h += rect.h;
        } else {
            continue;
        }

        this.free.splice(i, 1);
        this.release(free);
        return;

    }
    this.free.push(rect);
};

BinPack.prototype.allocate = function(width, height) {
    // Find the smallest free rect angle
    var rect = { x: Infinity, y: Infinity, w: Infinity, h: Infinity };
    var smallest = -1;
    for (var i = 0; i < this.free.length; i++) {
        var ref = this.free[i];
        if (width <= ref.w && height <= ref.h && ref.y <= rect.y && ref.x <= rect.x) {
            rect = ref;
            smallest = i;
        }
    }

    if (smallest < 0) {
        // There's no space left for this char.
        return { x: -1, y: -1 };
    } else {
        this.free.splice(smallest, 1);

        // Shorter/Longer Axis Split Rule (SAS)
        // http://clb.demon.fi/files/RectangleBinPack.pdf p. 15
        // Ignore the dimension of R and just split long the shorter dimension
        // See Also: http://www.cs.princeton.edu/~chazelle/pubs/blbinpacking.pdf
        if (rect.w < rect.h) {
            // split horizontally
            // +--+---+
            // |__|___|  <-- b1
            // +------+  <-- b2
            if (rect.w > width) this.free.push({ x: rect.x + width, y: rect.y, w: rect.w - width, h: height });
            if (rect.h > height) this.free.push({ x: rect.x, y: rect.y + height, w: rect.w, h: rect.h - height });
        } else {
            // split vertically
            // +--+---+
            // |__|   | <-- b1
            // +--|---+ <-- b2
            if (rect.w > width) this.free.push({ x: rect.x + width, y: rect.y, w: rect.w - width, h: rect.h });
            if (rect.h > height) this.free.push({ x: rect.x, y: rect.y + height, w: width, h: rect.h - height });
        }

        return { x: rect.x, y: rect.y, w: width, h: height };
    }
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/collision.js":[function(require,module,exports){
'use strict';

var rbush = require('rbush'),
    rotationRange = require('./rotation_range'),
    Point = require('point-geometry');

module.exports = Collision;

function Collision(zoom, tileExtent, tileSize, placementDepth) {
    this.hTree = rbush(); // tree for horizontal labels
    this.cTree = rbush(); // tree for glyphs from curved labels

    // tile pixels per screen pixels at the tile's zoom level
    this.tilePixelRatio = tileExtent / tileSize;

    this.zoom = zoom;

    // Calculate the maximum scale we can go down in our fake-3d rtree so that
    // placement still makes sense. This is calculated so that the minimum
    // placement zoom can be at most 25.5 (we use an unsigned integer x10 to
    // store the minimum zoom).
    //
    // We don't want to place labels all the way to 25.5. This lets too many
    // glyphs be placed, slowing down collision checking. Only place labels if
    // they will show up within the intended zoom range of the tile.
    placementDepth = Math.min(3, placementDepth || 1, 25.5 - this.zoom);
    this.maxPlacementScale = Math.exp(Math.LN2 * placementDepth);

    var m = 4096;
    var edge = m * this.tilePixelRatio * 2;

    var fullRange = [Math.PI * 2, 0];

    this.left = {
        anchor: new Point(0, 0),
        box: { x1: -edge, y1: -edge, x2: 0, y2: edge },
        placementRange: fullRange,
        placementScale: 0.5,
        maxScale: Infinity,
        padding: 0
    };

    this.top = {
        anchor: new Point(0, 0),
        box: { x1: -edge, y1: -edge, x2: edge, y2: 0 },
        placementRange: fullRange,
        placementScale: 0.5,
        maxScale: Infinity,
        padding: 0
    };

    this.bottom = {
        anchor: new Point(m, m),
        box: { x1: -edge, y1: 0, x2: edge, y2: edge },
        placementRange: fullRange,
        placementScale: 0.5,
        maxScale: Infinity,
        padding: 0
    };

    this.right = {
        anchor: new Point(m, m),
        box: { x1: 0, y1: -edge, x2: edge, y2: edge },
        placementRange: fullRange,
        placementScale: 0.5,
        maxScale: Infinity,
        padding: 0
    };

}

Collision.prototype.getPlacementScale = function(glyphs, minPlacementScale, avoidEdges) {

    var left = this.left;
    var right = this.right;
    var top = this.top;
    var bottom = this.bottom;

    for (var k = 0; k < glyphs.length; k++) {

        var glyph = glyphs[k];
        var box = glyph.box;
        var bbox = glyph.hBox || box;
        var anchor = glyph.anchor;
        var pad = glyph.padding;

        var minScale = Math.max(minPlacementScale, glyph.minScale);
        var maxScale = glyph.maxScale || Infinity;

        if (minScale >= maxScale) continue;

        // Compute the scaled bounding box of the unrotated glyph
        var searchBox = this.getBox(anchor, bbox, minScale, maxScale);

        var blocking = this.hTree.search(searchBox).concat(this.cTree.search(searchBox));

        if (avoidEdges) {
            if (searchBox[0] < 0) blocking.push(left);
            if (searchBox[1] < 0) blocking.push(top);
            if (searchBox[2] >= 4096) blocking.push(right);
            if (searchBox[3] >= 4096) blocking.push(bottom);
        }

        if (blocking.length) {

            var na = anchor; // new anchor
            var nb = box; // new box

            for (var l = 0; l < blocking.length; l++) {
                var oa = blocking[l].anchor; // old anchor
                var ob = blocking[l].box; // old box

                // If anchors are identical, we're going to skip the label.
                // NOTE: this isn't right because there can be glyphs with
                // the same anchor but differing box offsets.
                if (na.equals(oa)) {
                    return null;
                }

                // todo: unhardcode the 8 = tileExtent/tileSize
                var padding = Math.max(pad, blocking[l].padding) * 8;

                // Original algorithm:
                var s1 = (ob.x1 - nb.x2 - padding) / (na.x - oa.x); // scale at which new box is to the left of old box
                var s2 = (ob.x2 - nb.x1 + padding) / (na.x - oa.x); // scale at which new box is to the right of old box
                var s3 = (ob.y1 - nb.y2 - padding) / (na.y - oa.y); // scale at which new box is to the top of old box
                var s4 = (ob.y2 - nb.y1 + padding) / (na.y - oa.y); // scale at which new box is to the bottom of old box

                if (isNaN(s1) || isNaN(s2)) s1 = s2 = 1;
                if (isNaN(s3) || isNaN(s4)) s3 = s4 = 1;

                var collisionFreeScale = Math.min(Math.max(s1, s2), Math.max(s3, s4));

                // Only update label's min scale if the glyph was restricted by a collision
                if (collisionFreeScale > minPlacementScale &&
                    collisionFreeScale > minScale &&
                    collisionFreeScale < maxScale &&
                    collisionFreeScale < blocking[l].maxScale) {
                    minPlacementScale = collisionFreeScale;
                }

                if (minPlacementScale > this.maxPlacementScale) {
                    return null;
                }
            }

        }
    }

    return minPlacementScale;
};

Collision.prototype.getPlacementRange = function(glyphs, placementScale, horizontal) {

    var placementRange = [2*Math.PI, 0];

    for (var k = 0; k < glyphs.length; k++) {
        var glyph = glyphs[k];
        var bbox = glyph.hBox || glyph.box;
        var anchor = glyph.anchor;

        var minPlacedX = anchor.x + bbox.x1 / placementScale;
        var minPlacedY = anchor.y + bbox.y1 / placementScale;
        var maxPlacedX = anchor.x + bbox.x2 / placementScale;
        var maxPlacedY = anchor.y + bbox.y2 / placementScale;

        var searchBox = [minPlacedX, minPlacedY, maxPlacedX, maxPlacedY];

        var blocking = this.hTree.search(searchBox);

        if (horizontal) {
            blocking = blocking.concat(this.cTree.search(searchBox));
        }

        for (var l = 0; l < blocking.length; l++) {
            var b = blocking[l];
            var bbox2 = b.hBox || b.box;

            var x1, x2, y1, y2, intersectX, intersectY;

            // Adjust and compare bboxes to see if the glyphs might intersect
            if (placementScale > b.placementScale) {
                x1 = b.anchor.x + bbox2.x1 / placementScale;
                y1 = b.anchor.y + bbox2.y1 / placementScale;
                x2 = b.anchor.x + bbox2.x2 / placementScale;
                y2 = b.anchor.y + bbox2.y2 / placementScale;
                intersectX = x1 < maxPlacedX && x2 > minPlacedX;
                intersectY = y1 < maxPlacedY && y2 > minPlacedY;
            } else {
                x1 = anchor.x + bbox.x1 / b.placementScale;
                y1 = anchor.y + bbox.y1 / b.placementScale;
                x2 = anchor.x + bbox.x2 / b.placementScale;
                y2 = anchor.y + bbox.y2 / b.placementScale;
                intersectX = x1 < b[2] && x2 > b[0];
                intersectY = y1 < b[3] && y2 > b[1];
            }

            // If they can't intersect, skip more expensive rotation calculation
            if (!(intersectX && intersectY)) continue;

            var scale = Math.max(placementScale, b.placementScale);
            var range = rotationRange.rotationRange(glyph, b, scale);

            placementRange[0] = Math.min(placementRange[0], range[0]);
            placementRange[1] = Math.max(placementRange[1], range[1]);
        }
    }

    return placementRange;

};

// Insert glyph placements into rtree.
Collision.prototype.insert = function(glyphs, anchor, placementScale, placementRange, horizontal) {

    var allBounds = [];

    for (var k = 0; k < glyphs.length; k++) {

        var glyph = glyphs[k];
        var bbox = glyph.hBox || glyph.box;

        var minScale = Math.max(placementScale, glyph.minScale);
        var maxScale = glyph.maxScale || Infinity;

        var bounds = this.getBox(anchor, bbox, minScale, maxScale);

        bounds.anchor = anchor;
        bounds.box = glyph.box;
        if (glyph.hBox) bounds.hBox = bbox;
        bounds.placementRange = placementRange;
        bounds.placementScale = minScale;
        bounds.maxScale = maxScale;
        bounds.padding = glyph.padding;

        allBounds.push(bounds);
    }

    (horizontal ? this.hTree : this.cTree).load(allBounds);
};

Collision.prototype.getBox = function(anchor, bbox, minScale, maxScale) {
    return [
        anchor.x + Math.min(bbox.x1 / minScale, bbox.x1 / maxScale),
        anchor.y + Math.min(bbox.y1 / minScale, bbox.y1 / maxScale),
        anchor.x + Math.max(bbox.x2 / minScale, bbox.x2 / maxScale),
        anchor.y + Math.max(bbox.y2 / minScale, bbox.y2 / maxScale)];
};

},{"./rotation_range":"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/rotation_range.js","point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js","rbush":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/rbush/rbush.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/glyph_atlas.js":[function(require,module,exports){
'use strict';

var BinPack = require('./bin_pack');

module.exports = GlyphAtlas;
function GlyphAtlas(width, height) {
    this.width = width;
    this.height = height;

    this.bin = new BinPack(width, height);
    this.index = {};
    this.ids = {};
    this.data = new Uint8Array(width * height);
}

GlyphAtlas.prototype = {
    get debug() {
        return 'canvas' in this;
    },
    set debug(value) {
        if (value && !this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
        } else if (!value && this.canvas) {
            this.canvas.parentNode.removeChild(this.canvas);
            delete this.ctx;
            delete this.canvas;
        }
    }
};

GlyphAtlas.prototype.getGlyphs = function() {
    var glyphs = {},
        split,
        name,
        id;

    for (var key in this.ids) {
        split = key.split('#');
        name = split[0];
        id = split[1];

        if (!glyphs[name]) glyphs[name] = [];
        glyphs[name].push(id);
    }

    return glyphs;
};

GlyphAtlas.prototype.getRects = function() {
    var rects = {},
        split,
        name,
        id;

    for (var key in this.ids) {
        split = key.split('#');
        name = split[0];
        id = split[1];

        if (!rects[name]) rects[name] = {};
        rects[name][id] = this.index[key];
    }

    return rects;
};

GlyphAtlas.prototype.removeGlyphs = function(id) {
    for (var key in this.ids) {

        var ids = this.ids[key];

        var pos = ids.indexOf(id);
        if (pos >= 0) ids.splice(pos, 1);
        this.ids[key] = ids;

        if (!ids.length) {
            var rect = this.index[key];

            var target = this.data;
            for (var y = 0; y < rect.h; y++) {
                var y1 = this.width * (rect.y + y) + rect.x;
                for (var x = 0; x < rect.w; x++) {
                    target[y1 + x] = 0;
                }
            }

            this.dirty = true;

            this.bin.release(rect);

            delete this.index[key];
            delete this.ids[key];
        }
    }


    this.updateTexture(this.gl);
};

GlyphAtlas.prototype.addGlyph = function(id, name, glyph, buffer) {
    if (!glyph) {
        // console.warn('missing glyph', code, String.fromCharCode(code));
        return null;
    }
    var key = name + "#" + glyph.id;

    // The glyph is already in this texture.
    if (this.index[key]) {
        if (this.ids[key].indexOf(id) < 0) {
            this.ids[key].push(id);
        }
        return this.index[key];
    }

    // The glyph bitmap has zero width.
    if (!glyph.bitmap) {
        return null;
    }

    var buffered_width = glyph.width + buffer * 2;
    var buffered_height = glyph.height + buffer * 2;

    // Add a 1px border around every image.
    var pack_width = buffered_width;
    var pack_height = buffered_height;

    // Increase to next number divisible by 4, but at least 1.
    // This is so we can scale down the texture coordinates and pack them
    // into 2 bytes rather than 4 bytes.
    pack_width += (4 - pack_width % 4);
    pack_height += (4 - pack_height % 4);

    var rect = this.bin.allocate(pack_width, pack_height);
    if (rect.x < 0) {
        console.warn('glyph bitmap overflow');
        return { glyph: glyph, rect: null };
    }

    // Add left and top glyph offsets to rect.
    rect.l = glyph.left;
    rect.t = glyph.top;

    this.index[key] = rect;
    this.ids[key] = [id];

    var target = this.data;
    var source = glyph.bitmap;
    for (var y = 0; y < buffered_height; y++) {
        var y1 = this.width * (rect.y + y) + rect.x;
        var y2 = buffered_width * y;
        for (var x = 0; x < buffered_width; x++) {
            target[y1 + x] = source[y2 + x];
        }
    }

    this.dirty = true;

    return rect;
};

GlyphAtlas.prototype.bind = function(gl) {
    this.gl = gl;
    if (!this.texture) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, this.width, this.height, 0, gl.ALPHA, gl.UNSIGNED_BYTE, null);

    } else {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
};

GlyphAtlas.prototype.updateTexture = function(gl) {
    this.bind(gl);
    if (this.dirty) {

        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.width, this.height, gl.ALPHA, gl.UNSIGNED_BYTE, this.data);

        // DEBUG
        if (this.ctx) {
            var data = this.ctx.getImageData(0, 0, this.width, this.height);
            for (var i = 0, j = 0; i < this.data.length; i++, j += 4) {
                data.data[j] = this.data[i];
                data.data[j+1] = this.data[i];
                data.data[j+2] = this.data[i];
                data.data[j+3] = 255;
            }
            this.ctx.putImageData(data, 0, 0);

            this.ctx.strokeStyle = 'red';
            for (var k = 0; k < this.bin.free.length; k++) {
                var free = this.bin.free[k];
                this.ctx.strokeRect(free.x, free.y, free.w, free.h);
            }
        }
        // END DEBUG

        this.dirty = false;
    }
};

},{"./bin_pack":"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/bin_pack.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/glyph_source.js":[function(require,module,exports){
'use strict';

var normalizeURL = require('../util/mapbox').normalizeGlyphsURL;
var getArrayBuffer = require('../util/ajax').getArrayBuffer;
var Glyphs = require('../util/glyphs');
var Protobuf = require('pbf');

module.exports = GlyphSource;

function GlyphSource(url, glyphAtlas) {
    this.url = url && normalizeURL(url);
    this.glyphAtlas = glyphAtlas;
    this.stacks = {};
    this.loading = {};
}

GlyphSource.prototype.getRects = function(fontstack, glyphIDs, tileID, callback) {

    if (this.stacks[fontstack] === undefined) this.stacks[fontstack] = {};

    var rects = {};
    var glyphs = {};
    var result = { rects: rects, glyphs: glyphs };

    var stack = this.stacks[fontstack];
    var glyphAtlas = this.glyphAtlas;

    var missing = {};
    var remaining = 0;

    for (var i = 0; i < glyphIDs.length; i++) {
        var glyphID = glyphIDs[i];
        var range = Math.floor(glyphID / 256);

        if (stack[range]) {
            var glyph = stack[range].glyphs[glyphID];
            var buffer = 3;
            rects[glyphID] = glyphAtlas.addGlyph(tileID, fontstack, glyph, buffer);
            if (glyph) glyphs[glyphID] = simpleGlyph(glyph);
        } else {
            if (missing[range] === undefined) {
                missing[range] = [];
                remaining++;
            }
            missing[range].push(glyphID);
        }
    }

    if (!remaining) callback(undefined, result);

    var onRangeLoaded = function (err, range, data) {
        // TODO not be silent about errors
        if (!err) {
            var stack = this.stacks[fontstack][range] = data.stacks[fontstack];
            for (var i = 0; i < missing[range].length; i++) {
                var glyphID = missing[range][i];
                var glyph = stack.glyphs[glyphID];
                var buffer = 3;
                rects[glyphID] = glyphAtlas.addGlyph(tileID, fontstack, glyph, buffer);
                if (glyph) glyphs[glyphID] = simpleGlyph(glyph);
            }
        }
        remaining--;
        if (!remaining) callback(undefined, result);
    }.bind(this);

    for (var r in missing) {
        this.loadRange(fontstack, r, onRangeLoaded);
    }
};

function simpleGlyph(glyph) {
    return {
        advance: glyph.advance,
        left: glyph.left,
        top: glyph.top
    };
}

GlyphSource.prototype.loadRange = function(fontstack, range, callback) {

    if (range * 256 >= 65280) return callback('gyphs > 65280 not supported');

    if (this.loading[fontstack] === undefined) this.loading[fontstack] = {};
    var loading = this.loading[fontstack];

    if (loading[range]) {
        loading[range].push(callback);
    } else {
        loading[range] = [callback];

        var rangeName = (range * 256) + '-' + (range * 256 + 255);
        var url = glyphUrl(fontstack, rangeName, this.url);

        getArrayBuffer(url, function(err, data) {
            var glyphs = !err && new Glyphs(new Protobuf(new Uint8Array(data)));
            for (var i = 0; i < loading[range].length; i++) {
                loading[range][i](err, range, glyphs);
            }
            delete loading[range];
        });
    }
};

function glyphUrl(fontstack, range, url, subdomains) {
    subdomains = subdomains || 'abc';

    return url
        .replace('{s}', subdomains[fontstack.length % subdomains.length])
        .replace('{fontstack}', fontstack)
        .replace('{range}', range);
}

},{"../util/ajax":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/ajax.js","../util/glyphs":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/glyphs.js","../util/mapbox":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/mapbox.js","pbf":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/pbf/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/interpolate.js":[function(require,module,exports){
'use strict';

var util = require('../util/util');
var Anchor = require('../symbol/anchor');

module.exports = interpolate;

var minScale = 0.5;
var minScaleArrays = {
    1: [minScale],
    2: [minScale, 2],
    4: [minScale, 4, 2, 4],
    8: [minScale, 8, 4, 8, 2, 8, 4, 8]
};


function interpolate(vertices, spacing, minScale, maxScale, tilePixelRatio, start) {

    if (minScale === undefined) minScale = 0;

    maxScale = Math.round(Math.max(Math.min(8, maxScale / 2), 1));
    spacing *= tilePixelRatio / maxScale;
    var minScales = minScaleArrays[maxScale];
    var len = minScales.length;

    var distance = 0,
        markedDistance = 0,
        added = start || 0;

    var points = [];

    for (var i = 0; i < vertices.length - 1; i++) {

        var a = vertices[i],
            b = vertices[i + 1];

        var segmentDist = a.dist(b),
            angle = b.angleTo(a);

        while (markedDistance + spacing < distance + segmentDist) {
            markedDistance += spacing;

            var t = (markedDistance - distance) / segmentDist,
                x = util.interp(a.x, b.x, t),
                y = util.interp(a.y, b.y, t),
                s = minScales[added % len];

            if (x >= 0 && x < 4096 && y >= 0 && y < 4096) {
                points.push(new Anchor(x, y, angle, s, i));
            }

            added++;
        }

        distance += segmentDist;
    }

    return points;
}

},{"../symbol/anchor":"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/anchor.js","../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/placement.js":[function(require,module,exports){
'use strict';

var Point = require('point-geometry');

module.exports = {
    getIcon: getIcon,
    getGlyphs: getGlyphs
};

var minScale = 0.5; // underscale by 1 zoom level

function getIcon(anchor, image, boxScale, line, props) {

    var x = image.width / 2 / image.pixelRatio;
    var y = image.height / 2 / image.pixelRatio;

    var dx = props['icon-offset'][0];
    var dy = props['icon-offset'][1];
    var x1 = (dx - x);
    var x2 = (dx + x);
    var y1 = (dy - y);
    var y2 = (dy + y);

    var tl = new Point(x1, y1);
    var tr = new Point(x2, y1);
    var br = new Point(x2, y2);
    var bl = new Point(x1, y2);

    var angle = props['icon-rotate'] * Math.PI / 180;
    if (anchor.segment !== undefined && props['icon-rotation-alignment'] !== 'viewport') {
        var next = line[anchor.segment];
        angle += -Math.atan2(next.x - anchor.x, next.y - anchor.y) + Math.PI / 2;
    }

    if (angle) {
        var sin = Math.sin(angle),
            cos = Math.cos(angle),
            matrix = [cos, -sin, sin, cos];

        tl = tl.matMult(matrix);
        tr = tr.matMult(matrix);
        bl = bl.matMult(matrix);
        br = br.matMult(matrix);

        x1 = Math.min(tl.x, tr.x, bl.x, br.x);
        x2 = Math.max(tl.x, tr.x, bl.x, br.x);
        y1 = Math.min(tl.y, tr.y, bl.y, br.y);
        y2 = Math.max(tl.y, tr.y, bl.y, br.y);
    }
    var box = {
        x1: x1 * boxScale,
        x2: x2 * boxScale,
        y1: y1 * boxScale,
        y2: y2 * boxScale
    };

    var iconBox = {
        box: box,
        anchor: anchor,
        minScale: minScale,
        maxScale: Infinity,
        padding: props['icon-padding']
    };

    var icon = {
        tl: tl,
        tr: tr,
        br: br,
        bl: bl,
        tex: image,
        angle: 0,
        anchor: anchor,
        minScale: minScale,
        maxScale: Infinity
    };

    return {
        shapes: [icon],
        boxes: [iconBox],
        minScale: anchor.scale
    };
}

function getGlyphs(anchor, origin, shaping, faces, boxScale, horizontal, line, props) {

    var maxAngleDelta = props['text-max-angle'] * Math.PI / 180;
    var rotate = props['text-rotate'] * Math.PI / 180;
    var padding = props['text-padding'];
    var alongLine = props['text-rotation-alignment'] !== 'viewport';
    var keepUpright = props['text-keep-upright'];

    var glyphs = [],
        boxes = [];

    var buffer = 3;

    for (var k = 0; k < shaping.length; k++) {
        var shape = shaping[k];
        var fontstack = faces[shape.fontstack];
        var glyph = fontstack.glyphs[shape.glyph];
        var rect = fontstack.rects[shape.glyph];

        if (!glyph) continue;

        if (!(rect && rect.w > 0 && rect.h > 0)) continue;

        var x = (origin.x + shape.x + glyph.left - buffer + rect.w / 2) * boxScale;

        var glyphInstances;
        if (anchor.segment !== undefined && alongLine) {
            glyphInstances = [];
            getSegmentGlyphs(glyphInstances, anchor, x, line, anchor.segment, 1, maxAngleDelta);
            if (keepUpright) getSegmentGlyphs(glyphInstances, anchor, x, line, anchor.segment, -1, maxAngleDelta);

        } else {
            glyphInstances = [{
                anchor: anchor,
                offset: 0,
                angle: 0,
                maxScale: Infinity,
                minScale: minScale
            }];
        }

        var x1 = origin.x + shape.x + glyph.left - buffer,
            y1 = origin.y + shape.y - glyph.top - buffer,
            x2 = x1 + rect.w,
            y2 = y1 + rect.h,

            otl = new Point(x1, y1),
            otr = new Point(x2, y1),
            obl = new Point(x1, y2),
            obr = new Point(x2, y2);

        var obox = {
                x1: boxScale * x1,
                y1: boxScale * y1,
                x2: boxScale * x2,
                y2: boxScale * y2
            };

        for (var i = 0; i < glyphInstances.length; i++) {

            var instance = glyphInstances[i],

                tl = otl,
                tr = otr,
                bl = obl,
                br = obr,
                box = obox,

                // Clamp to -90/+90 degrees
                angle = instance.angle + rotate;

            if (angle) {
                // Compute the transformation matrix.
                var sin = Math.sin(angle),
                    cos = Math.cos(angle),
                    matrix = [cos, -sin, sin, cos];

                tl = tl.matMult(matrix);
                tr = tr.matMult(matrix);
                bl = bl.matMult(matrix);
                br = br.matMult(matrix);
            }

            // Prevent label from extending past the end of the line
            var glyphMinScale = Math.max(instance.minScale, anchor.scale);

            // Remember the glyph for later insertion.
            glyphs.push({
                tl: tl,
                tr: tr,
                bl: bl,
                br: br,
                tex: rect,
                angle: (anchor.angle + rotate + instance.offset + 2 * Math.PI) % (2 * Math.PI),
                anchor: instance.anchor,
                minScale: glyphMinScale,
                maxScale: instance.maxScale
            });

            if (!instance.offset) { // not a flipped glyph
                if (angle) {
                    // Calculate the rotated glyph's bounding box offsets from the anchor point.
                    box = {
                        x1: boxScale * Math.min(tl.x, tr.x, bl.x, br.x),
                        y1: boxScale * Math.min(tl.y, tr.y, bl.y, br.y),
                        x2: boxScale * Math.max(tl.x, tr.x, bl.x, br.x),
                        y2: boxScale * Math.max(tl.y, tr.y, bl.y, br.y)
                    };
                }
                boxes.push({
                    box: box,
                    anchor: instance.anchor,
                    minScale: glyphMinScale,
                    maxScale: instance.maxScale,
                    padding: padding
                });
            }
        }
    }

    // TODO avoid creating the boxes in the first place?
    if (horizontal) boxes = [getMergedBoxes(boxes, anchor)];

    var minPlacementScale = anchor.scale;
    var minGlyphScale = Infinity;
    for (var m = 0; m < boxes.length; m++) {
        minGlyphScale = Math.min(minGlyphScale, boxes[m].minScale);
    }
    minGlyphScale = Math.max(minPlacementScale, minScale);

    return {
        boxes: boxes,
        shapes: glyphs,
        minScale: minGlyphScale
    };
}

function getSegmentGlyphs(glyphs, anchor, offset, line, segment, direction, maxAngleDelta) {
    var upsideDown = direction < 0;

    if (offset < 0)  direction *= -1;

    if (direction > 0) segment++;

    var newAnchor = anchor;
    var end = line[segment];
    var prevscale = Infinity;
    var prevAngle;

    offset = Math.abs(offset);

    var placementScale = anchor.scale;

    segment_loop:
    while (true) {
        var dist = newAnchor.dist(end);
        var scale = offset/dist;
        var angle = -Math.atan2(end.x - newAnchor.x, end.y - newAnchor.y) + direction * Math.PI / 2;
        if (upsideDown) angle += Math.PI;

        // Don't place around sharp corners
        var angleDiff = (angle - prevAngle) % (2 * Math.PI);
        if (prevAngle && Math.abs(angleDiff) > maxAngleDelta) {
            anchor.scale = prevscale;
            break;
        }

        glyphs.push({
            anchor: newAnchor,
            offset: upsideDown ? Math.PI : 0,
            minScale: scale,
            maxScale: prevscale,
            angle: (angle + 2 * Math.PI) % (2 * Math.PI)
        });

        if (scale <= placementScale) break;

        newAnchor = end;

        // skip duplicate nodes
        while (newAnchor.equals(end)) {
            segment += direction;
            end = line[segment];

            if (!end) {
                anchor.scale = scale;
                break segment_loop;
            }
        }

        var unit = end.sub(newAnchor)._unit();
        newAnchor = newAnchor.sub(unit._mult(dist));

        prevscale = scale;
        prevAngle = angle;
    }
}

function getMergedBoxes(glyphs, anchor) {
      // Collision checks between rotating and fixed labels are relatively expensive,
      // so we use one box per label, not per glyph for horizontal labels.

    var mergedglyphs = {
        box: { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity },
        anchor: anchor,
        minScale: 0,
        padding: -Infinity
    };

    var box = mergedglyphs.box;

    for (var m = 0; m < glyphs.length; m++) {
        var gbox = glyphs[m].box;
        box.x1 = Math.min(box.x1, gbox.x1);
        box.y1 = Math.min(box.y1, gbox.y1);
        box.x2 = Math.max(box.x2, gbox.x2);
        box.y2 = Math.max(box.y2, gbox.y2);
        mergedglyphs.minScale = Math.max(mergedglyphs.minScale, glyphs[m].minScale);
        mergedglyphs.padding = Math.max(mergedglyphs.padding, glyphs[m].padding);
    }
    // for all horizontal labels, calculate bbox covering all rotated positions
    var x12 = box.x1 * box.x1,
        y12 = box.y1 * box.y1,
        x22 = box.x2 * box.x2,
        y22 = box.y2 * box.y2,
        diag = Math.sqrt(Math.max(x12 + y12, x12 + y22, x22 + y12, x22 + y22));

    mergedglyphs.hBox = {
        x1: -diag,
        y1: -diag,
        x2: diag,
        y2: diag
    };

    return mergedglyphs;
}

},{"point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/resolve_text.js":[function(require,module,exports){
'use strict';

var resolveTokens = require('../util/token');

module.exports = resolveText;

// For an array of features determine what glyph ranges need to be loaded
// and apply any text preprocessing. The remaining users of text should
// use the `textFeatures` key returned by this function rather than accessing
// feature text directly.
function resolveText(features, layoutProperties, glyphs) {
    var textFeatures = [];
    var codepoints = [];

    for (var i = 0, fl = features.length; i < fl; i++) {
        var text = resolveTokens(features[i].properties, layoutProperties['text-field']);
        var hastext = false;
        if (!text) continue;
        text = text.toString();

        var transform = layoutProperties['text-transform'];
        if (transform === 'uppercase') {
            text = text.toLocaleUpperCase();
        } else if (transform === 'lowercase') {
            text = text.toLocaleLowerCase();
        }

        for (var j = 0, jl = text.length; j < jl; j++) {
            if (text.charCodeAt(j) <= 65533) {
                codepoints.push(text.charCodeAt(j));
                hastext = true;
            }
        }
        // Track indexes of features with text.
        if (hastext) {
            textFeatures[i] = text;
        }
    }

    // get a list of unique codepoints we are missing
    codepoints = uniq(codepoints, glyphs);

    return {
        textFeatures: textFeatures,
        codepoints: codepoints
    };
}

function uniq(ids, alreadyHave) {
    var u = [];
    var last;
    ids.sort(sortNumbers);
    for (var i = 0; i < ids.length; i++) {
        if (ids[i] !== last) {
            last = ids[i];
            if (!alreadyHave[last]) u.push(ids[i]);
        }
    }
    return u;
}

function sortNumbers(a, b) {
    return a - b;
}


},{"../util/token":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/token.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/rotation_range.js":[function(require,module,exports){
'use strict';

var util = require('../util/util');
var Point = require('point-geometry');

module.exports = {
    rotationRange: rotationRange,
    mergeCollisions: mergeCollisions,

    rotatingFixedCollisions: rotatingFixedCollisions,
    rotatingRotatingCollisions: rotatingRotatingCollisions,

    cornerBoxCollisions: cornerBoxCollisions,
    circleEdgeCollisions: circleEdgeCollisions,

    getCorners: getCorners,
};

/*
 * Calculate the range a box conflicts with a second box
 */
function rotationRange(inserting, blocker, scale) {

    var collisions, box;

    var a = inserting;
    var b = blocker;

    // Instead of scaling the boxes, we move the anchors
    var relativeAnchor = new Point(
        (b.anchor.x - a.anchor.x) * scale,
        (b.anchor.y - a.anchor.y) * scale);

    // Generate a list of collision interval
    if (a.hBox && b.hBox) {
        collisions = rotatingRotatingCollisions(a.box, b.box, relativeAnchor);

    } else if (a.hBox) {
        box = {
            x1: b.box.x1 + relativeAnchor.x,
            y1: b.box.y1 + relativeAnchor.y,
            x2: b.box.x2 + relativeAnchor.x,
            y2: b.box.y2 + relativeAnchor.y
        };
        collisions = rotatingFixedCollisions(a.box, box);


    } else if (b.hBox) {
        box = {
            x1: a.box.x1 - relativeAnchor.x,
            y1: a.box.y1 - relativeAnchor.y,
            x2: a.box.x2 - relativeAnchor.x,
            y2: a.box.y2 - relativeAnchor.y
        };
        collisions = rotatingFixedCollisions(b.box, box);

    } else {
        collisions = [];
    }

    // Find and return the continous are around 0 where there are no collisions
    return mergeCollisions(collisions, blocker.placementRange);
}

/*
 * Combine an array of collision ranges to form a continuous
 * range that includes 0. Collisions within the ignoreRange are ignored
 */
function mergeCollisions(collisions, ignoreRange) {

    // find continuous interval including 0 that doesn't have any collisions
    var min = 2 * Math.PI;
    var max = 0;

    for (var i = 0; i < collisions.length; i++) {
        var collision = collisions[i];

        var entryOutside = ignoreRange[0] <= collision[0] && collision[0] <= ignoreRange[1];
        var exitOutside = ignoreRange[0] <= collision[1] && collision[1] <= ignoreRange[1];

        if (entryOutside && exitOutside) {
            // no collision, since blocker is out of range
        } else if (entryOutside) {
            min = Math.min(min, ignoreRange[1]);
            max = Math.max(max, collision[1]);
        } else if (exitOutside) {
            min = Math.min(min, collision[0]);
            max = Math.max(max, ignoreRange[0]);
        } else {
            min = Math.min(min, collision[0]);
            max = Math.max(max, collision[1]);
        }
    }

    return [min, max];
}

/*
 *  Calculate collision ranges for two rotating boxes.
 */

var horizontal = new Point(1, 0);

function rotatingRotatingCollisions(a, b, anchorToAnchor) {
    var d = anchorToAnchor.mag();

    var angleBetweenAnchors = anchorToAnchor.angleWith(horizontal);

    var c = [],
        collisions = [],
        k;

    // Calculate angles at which collisions may occur
    // top/bottom
    c[0] = Math.asin((a.y2 - b.y1) / d);
    c[1] = Math.asin((a.y2 - b.y1) / d) + Math.PI;
    c[2] = 2 * Math.PI - Math.asin((-a.y1 + b.y2) / d);
    c[3] = Math.PI - Math.asin((-a.y1 + b.y2) / d);

    // left/right
    c[4] = 2 * Math.PI - Math.acos((a.x2 - b.x1) / d);
    c[5] = Math.acos((a.x2 - b.x1) / d);
    c[6] = Math.PI - Math.acos((-a.x1 + b.x2) / d);
    c[7] = Math.PI + Math.acos((-a.x1 + b.x2) / d);

    var rl = a.x2 - b.x1;
    var lr = -a.x1 + b.x2;
    var tb = a.y2 - b.y1;
    var bt = -a.y1 + b.y2;

    // Calculate the distance squared of the diagonal which will be used
    // to check if the boxes are close enough for collisions to occur at each angle
    // todo, triple check these
    var e = [];
    // top/bottom
    e[0] = rl * rl + tb * tb;
    e[1] = lr * lr + tb * tb;
    e[2] = rl * rl + bt * bt;
    e[3] = lr * lr + bt * bt;
    // left/right
    e[4] = rl * rl + tb * tb;
    e[5] = rl * rl + bt * bt;
    e[6] = lr * lr + bt * bt;
    e[7] = lr * lr + tb * tb;


    c = c.filter(function(x, i) {
        // Check if they are close enough to collide
        return !isNaN(x) && d * d <= e[i];
    }).map(function(x) {
        // So far, angles have been calulated as relative to the vector between anchors.
        // Convert the angles to angles from north.
        return (x + angleBetweenAnchors + 2 * Math.PI) % (2 * Math.PI);
    });

    // Group the collision angles by two
    // each group represents a range where the two boxes collide
    c.sort();
    for (k = 0; k < c.length; k+=2) {
        collisions.push([c[k], c[k+1]]);
    }

    return collisions;

}

/*
 *  Calculate collision ranges for a rotating box and a fixed box;
 */
function rotatingFixedCollisions(rotating, fixed) {

    var cornersR = getCorners(rotating);
    var cornersF = getCorners(fixed);

    // A collision occurs when, and only at least one corner from one of the boxes
    // is within the other box. Calculate these ranges for each corner.

    var collisions = [];

    for (var i = 0; i < 4; i++ ) {
        cornerBoxCollisions(collisions, cornersR[i], cornersF);
        cornerBoxCollisions(collisions, cornersF[i], cornersR, true);
    }

    return collisions;
}


/*
 *  Calculate the ranges for which the corner,
 *  rotatated around the anchor, is within the box;
 */
function cornerBoxCollisions(collisions, corner, boxCorners, flip) {
    var radius = corner.mag(),
        angles = [];

    // Calculate the points at which the corners intersect with the edges
    for (var i = 0, j = 3; i < 4; j = i++) {
        circleEdgeCollisions(angles, corner, radius, boxCorners[j], boxCorners[i]);
    }

    if (angles.length % 2 !== 0) {
        // TODO fix
        // This could get hit when a point intersects very close to a corner
        // and floating point issues cause only one of the entry or exit to be counted
        throw('expecting an even number of intersections');
    }

    angles.sort();

    // Group by pairs, where each represents a range where a collision occurs
    for (var k = 0; k < angles.length; k+=2) {
        collisions[k/2] = flip ?
            [2 * Math.PI - angles[k+1], 2 * Math.PI - angles[k]] : // reflect an angle around 0 degrees
            [angles[k], angles[k+1]];
    }

    return collisions;
}

/*
 * Return the intersection points of a circle and a line segment;
 */
function circleEdgeCollisions(angles, corner, radius, p1, p2) {

    var edgeX = p2.x - p1.x;
    var edgeY = p2.y - p1.y;

    var a = edgeX * edgeX + edgeY * edgeY;
    var b = (edgeX * p1.x + edgeY * p1.y) * 2;
    var c = p1.x * p1.x + p1.y * p1.y - radius * radius;

    var discriminant = b*b - 4*a*c;

    // a collision exists only if line intersects circle at two points
    if (discriminant > 0) {
        var x1 = (-b - Math.sqrt(discriminant)) / (2 * a);
        var x2 = (-b + Math.sqrt(discriminant)) / (2 * a);

        // only add points if within line segment
        // hack to handle floating point representations of 0 and 1
        if (0 < x1 && x1 < 1) {
            angles.push(getAngle(p1, p2, x1, corner));
        }

        if (0 < x2 && x2 < 1) {
            angles.push(getAngle(p1, p2, x2, corner));
        }
    }

    return angles;
}

function getAngle(p1, p2, d, corner) {
    return (-corner.angleWithSep(
        util.interp(p1.x, p2.x, d),
        util.interp(p1.y, p2.y, d)) + 2 * Math.PI) % (2 * Math.PI);
}

function getCorners(a) {
    return [
        new Point(a.x1, a.y1),
        new Point(a.x1, a.y2),
        new Point(a.x2, a.y2),
        new Point(a.x2, a.y1)
    ];
}

},{"../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/shaping.js":[function(require,module,exports){
'use strict';

module.exports = {
    shape: shape
};

function shape(text, name, stacks, maxWidth, lineHeight, horizontalAlign, verticalAlign, justify, spacing, translate) {
    var glyphs = stacks[name].glyphs;
    var glyph;

    var shaping = [];

    var x = translate[0];
    var y = translate[1];
    var id;

    for (var i = 0; i < text.length; i++) {
        id = text.charCodeAt(i);
        glyph = glyphs[id];

        if (id === 0 || !glyph) continue;

        shaping.push({
            fontstack: name,
            glyph: id,
            x: x,
            y: y
        });

        x += glyph.advance + spacing;
    }

    if (!shaping.length) return false;

    shaping = linewrap(shaping, glyphs, lineHeight, maxWidth, horizontalAlign, verticalAlign, justify);

    return shaping;
}

var breakable = { 32: true }; // Currently only breaks at regular spaces

function linewrap(shaping, glyphs, lineHeight, maxWidth, horizontalAlign, verticalAlign, justify) {
    var lastSafeBreak = null;

    var lengthBeforeCurrentLine = 0;
    var lineStartIndex = 0;
    var line = 0;

    var maxLineLength = 0;

    if (maxWidth) {
        for (var i = 0; i < shaping.length; i++) {
            var shape = shaping[i];

            shape.x -= lengthBeforeCurrentLine;
            shape.y += lineHeight * line;

            if (shape.x > maxWidth && lastSafeBreak !== null) {

                var lineLength = shaping[lastSafeBreak + 1].x;
                maxLineLength = Math.max(lineLength, maxLineLength);

                for (var k = lastSafeBreak + 1; k <= i; k++) {
                    shaping[k].y += lineHeight;
                    shaping[k].x -= lineLength;
                }

                if (justify) {
                    justifyLine(shaping, glyphs, lineStartIndex, lastSafeBreak - 1, justify);
                }

                lineStartIndex = lastSafeBreak + 1;
                lastSafeBreak = null;
                lengthBeforeCurrentLine += lineLength;
                line++;
            }

            if (breakable[shape.glyph]) {
                lastSafeBreak = i;
            }
        }
    }

    maxLineLength = maxLineLength || shaping[shaping.length - 1].x;

    justifyLine(shaping, glyphs, lineStartIndex, shaping.length - 1, justify);
    align(shaping, justify, horizontalAlign, verticalAlign, maxLineLength, lineHeight, line);
    return shaping;
}

function justifyLine(shaping, glyphs, start, end, justify) {
    var lastAdvance = glyphs[shaping[end].glyph].advance;
    var lineIndent = (shaping[end].x + lastAdvance) * justify;

    for (var j = start; j <= end; j++) {
        shaping[j].x -= lineIndent;
    }

}

function align(shaping, justify, horizontalAlign, verticalAlign, maxLineLength, lineHeight, line) {
    var shiftX = (justify - horizontalAlign) * maxLineLength;
    var shiftY = (-verticalAlign * (line + 1) + 0.5) * lineHeight;

    for (var j = 0; j < shaping.length; j++) {
        shaping[j].x += shiftX;
        shaping[j].y += shiftY;
    }
}

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/control/attribution.js":[function(require,module,exports){
'use strict';

var Control = require('./control');
var DOM = require('../../util/dom');
var util = require('../../util/util');

module.exports = Attribution;

function Attribution() {}

Attribution.prototype = util.inherit(Control, {
    onAdd: function(map) {
        var className = 'mapboxgl-ctrl-attrib',
            container = this._container = DOM.create('div', className, map.container);

        this._update();
        map.on('source.add', this._update.bind(this));
        map.on('source.remove', this._update.bind(this));

        map.on('moveend', this._updateEditLink.bind(this));

        return container;
    },

    _update: function() {
        var attrObj = {};
        for (var id in this._map.sources) {
            var source = this._map.sources[id];
            if (source.attribution) {
                attrObj[source.attribution] = true;
            }
        }
        var attributions = [];
        for (var i in attrObj) {
            attributions.push(i);
        }
        this._container.innerHTML = attributions.join(' | ');
        this._editLink = this._container.getElementsByClassName('mapbox-improve-map')[0];
        this._updateEditLink();
    },

    _updateEditLink: function() {
        if (this._editLink) {
            var center = this._map.getCenter();
            this._editLink.href = 'https://www.mapbox.com/map-feedback/#/' +
                    center.lng + '/' + center.lat + '/' + Math.round(this._map.getZoom() + 1);
        }
    }
});

},{"../../util/dom":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/dom.js","../../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","./control":"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/control/control.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/control/control.js":[function(require,module,exports){
'use strict';

module.exports = Control;

function Control() {}

Control.prototype = {
	addTo: function(map) {
		this._map = map;
		this._container = this.onAdd(map);
		return this;
	},

	remove: function () {
		this._container.parentNode.removeChild(this._container);
		if (this.onRemove) this.onRemove(this._map);
		this._map = null;
		return this;
	}
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/control/navigation.js":[function(require,module,exports){
'use strict';

var Control = require('./control');
var DOM = require('../../util/dom');
var util = require('../../util/util');

module.exports = Navigation;

function Navigation() {}

Navigation.prototype = util.inherit(Control, {
    onAdd: function(map) {
        var className = 'mapboxgl-ctrl-nav';

        var container = this._container = DOM.create('div', className, map.container);

        this._zoomInButton = this._createButton(className + '-zoom-in', map.zoomIn.bind(map));
        this._zoomOutButton = this._createButton(className + '-zoom-out', map.zoomOut.bind(map));
        this._compass = this._createButton(className + '-compass', map.resetNorth.bind(map));

        var compassCanvas = this._compassCanvas = DOM.create('canvas', className + '-compass-canvas', this._compass);
        compassCanvas.style.cssText = 'width:26px; height:26px;';
        compassCanvas.width = 26 * 2;
        compassCanvas.height = 26 * 2;

        this._compass.addEventListener('mousedown', this._onCompassDown.bind(this));
        this._onCompassMove = this._onCompassMove.bind(this);
        this._onCompassUp = this._onCompassUp.bind(this);

        this._compassCtx = compassCanvas.getContext('2d');

        map.on('rotate', this._drawNorth.bind(this));
        this._drawNorth();

        return container;
    },

    _onCompassDown: function(e) {
        DOM.disableDrag();

        document.addEventListener('mousemove', this._onCompassMove);
        document.addEventListener('mouseup', this._onCompassUp);
        this._prevX = e.screenX;

        e.stopPropagation();
    },

    _onCompassMove: function(e) {
        var x = e.screenX,
            d = x < 2 ? -5 : // left edge of the screen, continue rotating
                x > window.screen.width - 2 ? 5 : // right edge
                (x - this._prevX) / 4;

        this._map.setBearing(this._map.getBearing() - d);
        this._prevX = e.screenX;

        e.preventDefault();
    },

    _onCompassUp: function() {
        document.removeEventListener('mousemove', this._onCompassMove);
        document.removeEventListener('mouseup', this._onCompassUp);
        DOM.enableDrag();
    },

    _createButton: function(className, fn) {
        var a = DOM.create('a', className, this._container);
        a.href = '#';
        a.addEventListener('click', function(e) {
            fn();
            e.preventDefault();
            e.stopPropagation();
        });
        a.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
        return a;
    },

    _drawNorth: function() {
        var rad = 20,
            width = 8,
            center = 26,
            angle = this._map.transform.angle + (Math.PI / 2),
            ctx = this._compassCtx;

        this._compassCanvas.width = this._compassCanvas.width;

        ctx.translate(center, center);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.fillStyle = '#000';
        ctx.lineTo(0, -width);
        ctx.lineTo(-rad, 0);
        ctx.lineTo(0, width);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = '#bbb';
        ctx.moveTo(0, 0);
        ctx.lineTo(0, width);
        ctx.lineTo(rad, 0);
        ctx.lineTo(0, -width);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.moveTo(0, -width);
        ctx.lineTo(0, width);
        ctx.stroke();
    }
});

},{"../../util/dom":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/dom.js","../../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","./control":"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/control/control.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/easings.js":[function(require,module,exports){
'use strict';

var util = require('../util/util');
var browser = require('../util/browser');
var LatLng = require('../geo/lat_lng');
var LatLngBounds = require('../geo/lat_lng_bounds');
var Point = require('point-geometry');

util.extend(exports, {
    isEasing: function () {
        return !!this._abortFn;
    },

    stop: function () {
        if (this._abortFn) {
            this._abortFn.call(this);
            delete this._abortFn;

            this._finishFn.call(this);
            delete this._finishFn;
        }
        return this;
    },

    _ease: function(frame, finish, options) {
        this._finishFn = finish;
        this._abortFn = browser.timed(function (t) {
            frame.call(this, options.easing(t));
            if (t === 1) {
                delete this._abortFn;
                this._finishFn.call(this);
                delete this._finishFn;
            }
        }, options.animate === false ? 0 : options.duration, this);
    },

    panBy: function(offset, options) {
        this.panTo(this.transform.center, util.extend({offset: Point.convert(offset).mult(-1)}, options));
        return this;
    },

    panTo: function(latlng, options) {
        this.stop();

        latlng = LatLng.convert(latlng);

        options = util.extend({
            duration: 500,
            easing: util.ease,
            offset: [0, 0]
        }, options);

        var tr = this.transform,
            offset = Point.convert(options.offset).rotate(-tr.angle),
            from = tr.point,
            to = tr.project(latlng).sub(offset);

        if (!options.noMoveStart) {
            this.fire('movestart');
        }

        this._ease(function(k) {
            tr.center = tr.unproject(from.add(to.sub(from).mult(k)));
            this._move();
        }, function() {
            this.fire('moveend');
        }, options);

        return this;
    },

    // Zooms to a certain zoom level with easing.
    zoomTo: function(zoom, options) {
        this.stop();

        options = util.extend({
            duration: 500
        }, options);

        options.easing = this._updateEasing(options.duration, zoom, options.easing);

        var tr = this.transform,
            around = tr.center,
            startZoom = tr.zoom;

        if (options.around) {
            around = LatLng.convert(options.around);
        } else if (options.offset) {
            around = tr.pointLocation(tr.centerPoint.add(Point.convert(options.offset)));
        }

        if (options.animate === false) options.duration = 0;

        if (!this.zooming) {
            this.zooming = true;
            this.fire('movestart');
        }

        this._ease(function(k) {
            tr.setZoomAround(util.interp(startZoom, zoom, k), around);
            this.animationLoop.set(300); // text fading
            this._move(true);
        }, function() {
            this.ease = null;
            if (options.duration >= 200) {
                this.zooming = false;
                this.fire('moveend');
            }
        }, options);

        if (options.duration < 200) {
            clearTimeout(this._onZoomEnd);
            this._onZoomEnd = setTimeout(function() {
                this.zooming = false;
                this._rerender();
                this.fire('moveend');
            }.bind(this), 200);
        }

        return this;
    },

    zoomIn: function(options) {
        this.zoomTo(this.getZoom() + 1, options);
    },

    zoomOut: function(options) {
        this.zoomTo(this.getZoom() - 1, options);
    },

    rotateTo: function(bearing, options) {
        this.stop();

        options = util.extend({
            duration: 500,
            easing: util.ease
        }, options);

        var tr = this.transform,
            start = this.getBearing(),
            around = tr.center;

        if (options.around) {
            around = LatLng.convert(options.around);
        } else if (options.offset) {
            around = tr.pointLocation(tr.centerPoint.add(Point.convert(options.offset)));
        }

        bearing = this._normalizeBearing(bearing, start);

        this.rotating = true;
        this.fire('movestart');

        this._ease(function(k) {
            tr.setBearingAround(util.interp(start, bearing, k), around);
            this._move(false, true);
        }, function() {
            this.rotating = false;
            this.fire('moveend');
        }, options);

        return this;
    },

    resetNorth: function(options) {
        return this.rotateTo(0, util.extend({duration: 1000}, options));
    },

    fitBounds: function(bounds, options) {

        options = util.extend({
            padding: 0,
            offset: [0, 0],
            maxZoom: Infinity
        }, options);

        bounds = LatLngBounds.convert(bounds);

        var offset = Point.convert(options.offset),
            tr = this.transform,
            nw = tr.project(bounds.getNorthWest()),
            se = tr.project(bounds.getSouthEast()),
            size = se.sub(nw),
            center = tr.unproject(nw.add(se).div(2)),

            scaleX = (tr.width - options.padding * 2 - Math.abs(offset.x) * 2) / size.x,
            scaleY = (tr.height - options.padding * 2 - Math.abs(offset.y) * 2) / size.y,

            zoom = Math.min(tr.scaleZoom(tr.scale * Math.min(scaleX, scaleY)), options.maxZoom);

        return options.linear ?
            this.easeTo(center, zoom, 0, options) :
            this.flyTo(center, zoom, 0, options);
    },

    easeTo: function(latlng, zoom, bearing, options) {
        this.stop();

        options = util.extend({
            offset: [0, 0],
            duration: 500,
            easing: util.ease
        }, options);

        var tr = this.transform,
            offset = Point.convert(options.offset).rotate(-tr.angle),
            startZoom = this.getZoom(),
            startBearing = this.getBearing();

        latlng = LatLng.convert(latlng);
        zoom = zoom === undefined ? startZoom : zoom;
        bearing = bearing === undefined ? startBearing : this._normalizeBearing(bearing, startBearing);

        var scale = tr.zoomScale(zoom - startZoom),
            from = tr.point,
            to = latlng ? tr.project(latlng).sub(offset.div(scale)) : tr.point,
            around;

        if (zoom !== startZoom) {
            around = tr.pointLocation(tr.centerPoint.add(to.sub(from).div(1 - 1 / scale)));
            this.zooming = true;
        }
        if (startBearing !== bearing) this.rotating = true;

        this.fire('movestart');

        this._ease(function (k) {
            if (zoom !== startZoom) {
                tr.setZoomAround(util.interp(startZoom, zoom, k), around);
            } else {
                tr.center = tr.unproject(from.add(to.sub(from).mult(k)));
            }

            if (bearing !== startBearing) {
                tr.bearing = util.interp(startBearing, bearing, k);
            }

            this.animationLoop.set(300); // text fading
            this._move(zoom !== startZoom, bearing !== startBearing);
        }, function() {
            this.zooming = false;
            this.rotating = false;
            this.fire('moveend');
        }, options);

        return this;
    },

    flyTo: function(latlng, zoom, bearing, options) {
        this.stop();

        options = util.extend({
            offset: [0, 0],
            speed: 1.2,
            curve: 1.42,
            easing: util.ease
        }, options);

        latlng = LatLng.convert(latlng);

        var offset = Point.convert(options.offset),
            tr = this.transform,
            startZoom = this.getZoom(),
            startBearing = this.getBearing();

        zoom = zoom === undefined ? startZoom : zoom;
        bearing = bearing === undefined ? startBearing : this._normalizeBearing(bearing, startBearing);

        var scale = tr.zoomScale(zoom - startZoom),
            from = tr.point,
            to = tr.project(latlng).sub(offset.div(scale));

        if (options.animate === false) {
            return this.setView(latlng, zoom, bearing);
        }

        var startWorldSize = tr.worldSize,
            rho = options.curve,
            V = options.speed,

            w0 = Math.max(tr.width, tr.height),
            w1 = w0 / scale,
            u1 = to.sub(from).mag(),
            rho2 = rho * rho;

        function r(i) {
            var b = (w1 * w1 - w0 * w0 + (i ? -1 : 1) * rho2 * rho2 * u1 * u1) / (2 * (i ? w1 : w0) * rho2 * u1);
            return Math.log(Math.sqrt(b * b + 1) - b);
        }

        function sinh(n) { return (Math.exp(n) - Math.exp(-n)) / 2; }
        function cosh(n) { return (Math.exp(n) + Math.exp(-n)) / 2; }
        function tanh(n) { return sinh(n) / cosh(n); }

        var r0 = r(0),
            w = function (s) { return (cosh(r0) / cosh(r0 + rho * s)); },
            u = function (s) { return w0 * ((cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2) / u1; },
            S = (r(1) - r0) / rho;

        if (Math.abs(u1) < 0.000001) {
            if (Math.abs(w0 - w1) < 0.000001) return this;

            var k = w1 < w0 ? -1 : 1;
            S = Math.abs(Math.log(w1 / w0)) / rho;

            u = function() { return 0; };
            w = function(s) { return Math.exp(k * rho * s); };
        }

        options.duration = 1000 * S / V;

        this.zooming = true;
        if (startBearing != bearing) this.rotating = true;

        this.fire('movestart');

        this._ease(function (k) {
            var s = k * S,
                us = u(s);

            tr.zoom = startZoom + tr.scaleZoom(1 / w(s));
            tr.center = tr.unproject(from.add(to.sub(from).mult(us)), startWorldSize);

            if (bearing !== startBearing) {
                tr.bearing = util.interp(startBearing, bearing, k);
            }

            this.animationLoop.set(300); // text fading

            this._move(true, bearing !== startBearing);
        }, function() {
            this.zooming = false;
            this.rotating = false;
            this.fire('moveend');
        }, options);

        return this;
    },

    // convert bearing so that it's numerically close to the current one so that it interpolates properly
    _normalizeBearing: function(bearing, currentBearing) {
        bearing = util.wrap(bearing, -180, 180);
        var diff = Math.abs(bearing - currentBearing);
        if (Math.abs(bearing - 360 - currentBearing) < diff) bearing -= 360;
        if (Math.abs(bearing + 360 - currentBearing) < diff) bearing += 360;
        return bearing;
    },

    _updateEasing: function(duration, zoom, bezier) {
        var easing;

        if (this.ease) {
            var ease = this.ease,
                t = (Date.now() - ease.start) / ease.duration,
                speed = ease.easing(t + 0.01) - ease.easing(t),

                // Quick hack to make new bezier that is continuous with last
                x = 0.27 / Math.sqrt(speed * speed + 0.0001) * 0.01,
                y = Math.sqrt(0.27 * 0.27 - x * x);

            easing = util.bezier(x, y, 0.25, 1);
        } else {
            easing = bezier ? util.bezier.apply(util, bezier) : util.ease;
        }

        // store information on current easing
        this.ease = {
            start: (new Date()).getTime(),
            to: Math.pow(2, zoom),
            duration: duration,
            easing: easing
        };

        return easing;
    }
});

},{"../geo/lat_lng":"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/lat_lng.js","../geo/lat_lng_bounds":"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/lat_lng_bounds.js","../util/browser":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/browser.js","../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/handlers.js":[function(require,module,exports){
'use strict';

var Interaction = require('./interaction');
var Point = require('point-geometry');
var util = require('../util/util');

module.exports = Handlers;

function Handlers(map) {

    var rotateEnd;

    var inertiaLinearity = 0.2,
        inertiaEasing = util.bezier(0, 0, inertiaLinearity, 1);

    this.interaction = new Interaction(map.container)
        .on('click', function(e) {
            map.fire('click', e);
        })
        .on('hover', function(e) {
            map.fire('hover', e);
        })
        .on('down', function () {
            map.fire('movestart');
        })
        .on('resize', function() {
            map.stop();
            map.resize();
            map.update();
        })
        .on('pan', function(e) {
            map.stop();
            map.transform.panBy(e.offset);
            map._move();
        })
        .on('panend', function(e) {
            if (!e.inertia) map.fire('moveend');
            else {
                // convert velocity to px/s & adjust for increased initial animation speed when easing out
                var velocity = e.inertia.mult(1000 * inertiaLinearity),
                    speed = velocity.mag();

                var maxSpeed = 4000; // px/s

                if (speed >= maxSpeed) {
                    speed = maxSpeed;
                    velocity._unit()._mult(maxSpeed);
                }

                var deceleration = 8000, // px/s^2
                    duration = speed / (deceleration * inertiaLinearity),
                    offset = velocity.mult(-duration / 2).round();

                map.panBy(offset, {
                    duration: duration * 1000,
                    easing: inertiaEasing,
                    noMoveStart: true
                });
            }
        })
        .on('zoom', function(e) {
            // Scale by sigmoid of scroll wheel delta.
            var scale = 2 / (1 + Math.exp(-Math.abs(e.delta / 100)));
            if (e.delta < 0 && scale !== 0) scale = 1 / scale;

            var fromScale = map.ease && isFinite(e.delta) ? map.ease.to : map.transform.scale,
                duration = !isFinite(e.delta) ? 800 : e.source == 'trackpad' ? 0 : 300;

            map.zoomTo(map.transform.scaleZoom(fromScale * scale), {
                duration: duration,
                around: map.unproject(e.point)
            });
        })
        .on('rotate', function(e) {
            var center = map.transform.centerPoint, // Center of rotation
                startToCenter = e.start.sub(center),
                startToCenterDist = startToCenter.mag();

            // If the first click was too close to the center, move the center of rotation by 200 pixels
            // in the direction of the click.
            if (startToCenterDist < 200) {
                center = e.start.add(new Point(-200, 0)._rotate(startToCenter.angle()));
            }

            var bearingDiff = e.prev.sub(center).angleWith(e.current.sub(center)) / Math.PI * 180;
            map.transform.bearing = map.getBearing() - bearingDiff;

            map._move(false, true);

            window.clearTimeout(rotateEnd);
            rotateEnd = window.setTimeout(function() {
                map.rotating = false;
                map._rerender();
            }, 200);
        });
}

},{"../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","./interaction":"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/interaction.js","point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/hash.js":[function(require,module,exports){
'use strict';

module.exports = Hash;

var util = require('../util/util');

function Hash(map) {
    this.map = map;
    window.addEventListener('hashchange', this.onhash.bind(this), false);
    map.on('move', util.debounce(this.updateHash.bind(this), 100));
}

Hash.prototype = {
    onhash: function() {
        var loc = location.hash.replace('#', '').split('/');
        if (loc.length >= 3) {
            this.map.setView([+loc[1], +loc[2]], +loc[0], +(loc[3] || 0));
            return true;
        }
        return false;
    },

    updateHash: function() {
        var center = this.map.getCenter(),
            zoom = this.map.getZoom(),
            bearing = this.map.getBearing(),
            precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2)),

            hash = '#' + (Math.round(zoom * 100) / 100) +
                '/' + center.lat.toFixed(precision) +
                '/' + center.lng.toFixed(precision) +
                (bearing ? '/' + (Math.round(bearing * 10) / 10) : '');

        window.history.replaceState('', '', hash);
    }
};

},{"../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/interaction.js":[function(require,module,exports){
'use strict';

var Evented = require('../util/evented');
var browser = require('../util/browser');
var Point = require('point-geometry');

module.exports = Interaction;

function Interaction(el) {
    var interaction = this;
    if (!el) return;

    var rotating = false,
        panned = false,
        firstPos = null,
        pos = null,
        inertia = null,
        now;

    function mousePos(e) {
        var rect = el.getBoundingClientRect();
        return new Point(
            e.clientX - rect.left - el.clientLeft,
            e.clientY - rect.top - el.clientTop);
    }

    el.addEventListener('contextmenu', function(ev) {
        rotating = true;
        firstPos = pos = mousePos(ev);
        ev.preventDefault();
    }, false);
    el.addEventListener('mousedown', onmousedown, false);
    document.addEventListener('mouseup', onmouseup, false);
    document.addEventListener('mousemove', onmousemove, false);
    el.addEventListener('click', onclick, false);
    scrollwheel(zoom);
    el.addEventListener('dblclick', ondoubleclick, false);
    window.addEventListener('resize', resize, false);

    function zoom(type, delta, point) {
        interaction.fire('zoom', {
            source: type,
            delta: delta,
            point: point
        });
        inertia = null;
        now = null;
    }

    function click(point) {
        interaction.fire('click', {point: point});
    }

    function hover(point) {
        interaction.fire('hover', {point: point});
    }

    function pan(point) {
        if (pos) {
            var offset = pos.sub(point);
            interaction.fire('pan', {offset: offset});

            // add an averaged version of this movement to the inertia vector
            if (inertia) {
                var duration = Date.now() - now;
                // sometimes it's 0 after some erratic paning
                if (duration) {
                    var time = duration + now;
                    inertia.push([time, point]);
                    while (inertia.length > 2 && time - inertia[0][0] > 100) inertia.shift();
                }

            } else {
                inertia = [];
            }
            now = Date.now();
            pos = point;
        }
    }

    function resize() {
        interaction.fire('resize');
    }

    function rotate(point) {
        if (pos) {
            interaction.fire('rotate', {
                start: firstPos,
                prev: pos,
                current: point
            });
            pos = point;
        }
    }

    function doubleclick(point) {
        interaction.fire('dblclick', {point: point});
    }

    function onmousedown(ev) {
        firstPos = pos = mousePos(ev);
        interaction.fire('down');
    }

    function onmouseup() {
        panned = pos && firstPos && (pos.x != firstPos.x || pos.y != firstPos.y);

        rotating = false;
        pos = null;

        if (inertia && inertia.length >= 2 && now > Date.now() - 100) {
            var last = inertia[inertia.length - 1],
                first = inertia[0],
                velocity = last[1].sub(first[1]).div(last[0] - first[0]);
            interaction.fire('panend',  {inertia: velocity});

        } else interaction.fire('panend');

        inertia = null;
        now = null;
    }

    function onmousemove(ev) {
        var point = mousePos(ev);

        if (rotating) { rotate(point); }
        else if (pos) pan(point);
        else {
            var target = ev.toElement;
            while (target && target != el && target.parentNode) target = target.parentNode;
            if (target == el) {
                hover(point);
            }
        }
    }

    function onclick(ev) {
        if (!panned) click(mousePos(ev));
    }

    function ondoubleclick(ev) {
        doubleclick(mousePos(ev));
        zoom('wheel', Infinity * (ev.shiftKey ? -1 : 1), mousePos(ev));
        ev.preventDefault();
    }

    function scrollwheel(callback) {
        var firefox = /Firefox/i.test(navigator.userAgent);
        var safari = /Safari/i.test(navigator.userAgent) && !/Chrom(ium|e)/i.test(navigator.userAgent);
        var time = window.performance || Date;

        el.addEventListener('wheel', wheel, false);
        el.addEventListener('mousewheel', mousewheel, false);

        var lastEvent = 0;

        var type = null;
        var typeTimeout = null;
        var initialValue = null;

        function scroll(value, ev) {
            var stamp = time.now();
            var timeDelta = stamp - lastEvent;
            lastEvent = stamp;

            var point = mousePos(ev);

            if (value !== 0 && (value % 4.000244140625) === 0) {
                // This one is definitely a mouse wheel event.
                type = 'wheel';
            } else if (value !== 0 && Math.abs(value) < 4) {
                // This one is definitely a trackpad event because it is so small.
                type = 'trackpad';
            } else if (timeDelta > 400) {
                // This is likely a new scroll action.
                type = null;
                initialValue = value;
                // Start a timeout in case this was a singular event, and dely it
                // by up to 40ms.
                typeTimeout = setTimeout(function() {
                    type = 'wheel';
                    callback(type, -initialValue, point);
                }, 40);
            } else if (type === null) {
                // This is a repeating event, but we don't know the type of event
                // just yet. If the delta per time is small, we assume it's a
                // fast trackpad; otherwise we switch into wheel mode.
                type = (Math.abs(timeDelta * value) < 200) ? 'trackpad' : 'wheel';

                // Make sure our delayed event isn't fired again, because we
                // accumulate the previous event (which was less than 40ms ago) into
                // this event.
                if (typeTimeout) {
                    clearTimeout(typeTimeout);
                    typeTimeout = null;
                    value += initialValue;
                }
            }

            // Only fire the callback if we actually know what type of scrolling
            // device the user uses.
            if (type !== null) {
                callback(type, -value, point);
            }
        }

        function wheel(e) {
            var deltaY = e.deltaY;
            // Firefox doubles the values on retina screens...
            if (firefox && e.deltaMode == window.WheelEvent.DOM_DELTA_PIXEL) deltaY /= browser.devicePixelRatio;
            if (e.deltaMode == window.WheelEvent.DOM_DELTA_LINE) deltaY *= 40;
            scroll(deltaY, e);
            e.preventDefault();
        }

        function mousewheel(e) {
            var deltaY = -e.wheelDeltaY;
            if (safari) deltaY = deltaY / 3;
            scroll(deltaY, e);
            e.preventDefault();
        }
    }
}

Interaction.prototype = Object.create(Evented);

},{"../util/browser":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/browser.js","../util/evented":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/evented.js","point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/map.js":[function(require,module,exports){
'use strict';

var Dispatcher = require('../util/dispatcher');
var Canvas = require('../util/canvas');
var util = require('../util/util');
var browser = require('../util/browser');
var ajax = require('../util/ajax');
var Evented = require('../util/evented');

var Style = require('../style/style');
var AnimationLoop = require('../style/animation_loop');
var GLPainter = require('../render/painter');

var Transform = require('../geo/transform');
var Hash = require('./hash');
var Handlers = require('./handlers');
var Source = require('../source/source');
var Easings = require('./easings');
var LatLng = require('../geo/lat_lng');
var LatLngBounds = require('../geo/lat_lng_bounds');
var Point = require('point-geometry');
var GlyphSource = require('../symbol/glyph_source');
var Attribution = require('./control/attribution');

// allow redefining Map here (jshint thinks it's global)
// jshint -W079

var Map = module.exports = function(options) {

    options = this.options = util.inherit(this.options, options);

    this.animationLoop = new AnimationLoop();
    this.transform = new Transform(options.minZoom, options.maxZoom);
    this.hash = options.hash && new Hash(this);

    if (options.maxBounds) {
        var b = LatLngBounds.convert(options.maxBounds);
        this.transform.latRange = [b.getSouth(), b.getNorth()];
        this.transform.lngRange = [b.getWest(), b.getEast()];
    }

    this._onStyleChange = this._onStyleChange.bind(this);
    this._updateBuckets = this._updateBuckets.bind(this);
    this.render = this.render.bind(this);

    this._setupContainer();
    this._setupPainter();

    this.handlers = options.interactive && new Handlers(this);
    this.dispatcher = new Dispatcher(Math.max(options.numWorkers, 1), this);

     // don't set position from options if set through hash
    if (!this.hash || !this.hash.onhash()) {
        this.setView(options.center, options.zoom, options.bearing);
    }

    this.sources = {};
    this.stacks = {};

    this.resize();

    if (typeof options.style === 'object') {
        this.setStyle(options.style);

    } else if (typeof options.style === 'string') {
        ajax.getJSON(options.style, function (err, data) {
            if (err) throw err;
            this.setStyle(data);
        }.bind(this));
    }

    if (options.attributionControl) this.addControl(new Attribution());
};

util.extend(Map.prototype, Evented);
util.extend(Map.prototype, Easings);
util.extend(Map.prototype, {

    options: {
        center: [0, 0],
        zoom: 0,
        bearing: 0,

        minZoom: 0,
        maxZoom: 20,
        numWorkers: browser.hardwareConcurrency - 1,

        interactive: true,
        hash: false,

        attributionControl: true
    },

    addSource: function(id, source) {
        this.sources[id] = source;
        source.id = id;
        if (source.onAdd) {
            source.onAdd(this);
        }
        if (source.enabled) source.fire('source.add', {source: source});
        return this;
    },

    removeSource: function(id) {
        var source = this.sources[id];
        if (source.onRemove) {
            source.onRemove(this);
        }
        delete this.sources[id];
        return this.fire('source.remove', {source: source});
    },

    addControl: function(control) {
        control.addTo(this);
        return this;
    },

    // Set the map's center, zoom, and bearing
    setView: function(center, zoom, bearing) {
        this.stop();

        var tr = this.transform,
            zoomChanged = tr.zoom !== +zoom,
            bearingChanged = tr.bearing !== +bearing;

        tr.center = LatLng.convert(center);
        tr.zoom = +zoom;
        tr.bearing = +bearing;

        return this
            .fire('movestart')
            ._move(zoomChanged, bearingChanged)
            .fire('moveend');
    },

    setCenter: function(center) {
        this.setView(center, this.getZoom(), this.getBearing());
    },

    setZoom: function(zoom) {
        this.setView(this.getCenter(), zoom, this.getBearing());
    },

    setBearing: function(bearing) {
        this.setView(this.getCenter(), this.getZoom(), bearing);
    },

    getCenter: function() { return this.transform.center; },
    getZoom: function() { return this.transform.zoom; },
    getBearing: function() { return this.transform.bearing; },

    // Detect the map's new width and height and resize it.
    resize: function() {
        var width = 0, height = 0;

        if (this.container) {
            width = this.container.offsetWidth || 400;
            height = this.container.offsetHeight || 300;
        }

        this.canvas.resize(width, height);

        this.transform.width = width;
        this.transform.height = height;
        this.transform._constrain();

        if (this.style && this.style.sprite) {
            this.style.sprite.resize(this.painter.gl);
        }

        this.painter.resize(width, height);

        return this
            .fire('movestart')
            ._move()
            .fire('resize')
            .fire('moveend');
    },

    getBounds: function() {
        return new LatLngBounds(
            this.transform.pointLocation(new Point(0, 0)),
            this.transform.pointLocation(this.transform.size));
    },

    project: function(latlng) {
        return this.transform.locationPoint(LatLng.convert(latlng));
    },
    unproject: function(point) {
        return this.transform.pointLocation(Point.convert(point));
    },

    featuresAt: function(point, params, callback) {
        var features = [];
        var error = null;

        point = Point.convert(point);

        util.asyncEach(Object.keys(this.sources), function(id, callback) {
            var source = this.sources[id];
            source.featuresAt(point, params, function(err, result) {
                if (result) features = features.concat(result);
                if (err) error = err;
                callback();
            });
        }.bind(this), function() {
            callback(error, features);
        });
        return this;
    },

    setStyle: function(style) {
        if (this.style) {
            this.style.off('change', this._onStyleChange);
        }

        if (style instanceof Style) {
            this.style = style;
        } else {
            this.style = new Style(style, this.animationLoop);
        }

        var sources = this.style.stylesheet.sources;
        for (var id in sources) {
            this.addSource(id, Source.create(sources[id]));
        }

        this.glyphSource = new GlyphSource(this.style.stylesheet.glyphs, this.painter.glyphAtlas);

        this.style.on('change', this._onStyleChange);

        this._styleDirty = true;
        this._tilesDirty = true;

        this._updateBuckets();

        this.fire('style.change');

        return this;
    },

    _move: function (zoom, rotate) {

        this.update(zoom).fire('move');

        if (zoom) this.fire('zoom');
        if (rotate) this.fire('rotate');

        return this;
    },

    // map setup code

    _setupContainer: function() {
        var id = this.options.container;
        var container = this.container = typeof id === 'string' ? document.getElementById(id) : id;
        if (container) container.classList.add('mapboxgl-map');
        this.canvas = new Canvas(this, container);
    },

    _setupPainter: function() {
        var gl = this.canvas.getWebGLContext();

        if (!gl) {
            alert('Failed to initialize WebGL');
            return;
        }

        this.painter = new GLPainter(gl, this.transform);
    },

    _contextLost: function(event) {
        event.preventDefault();
        if (this._frameId) {
            browser.cancelFrame(this._frameId);
        }
    },

    _contextRestored: function() {
        this._setupPainter();
        this.resize();
        this.update();
    },

    // Callbacks from web workers

    'debug message': function(data) {
        console.log.apply(console, data);
    },

    'alert message': function(data) {
        alert.apply(window, data);
    },

    'get sprite json': function(params, callback) {
        var sprite = this.style.sprite;
        if (sprite.loaded()) {
            callback(null, { sprite: sprite.data, retina: sprite.retina });
        } else {
            sprite.on('loaded', function() {
                callback(null, { sprite: sprite.data, retina: sprite.retina });
            });
        }
    },

    'get glyphs': function(params, callback) {
        this.glyphSource.getRects(params.fontstack, params.codepoints, params.id, callback);
    },

    // Rendering

    update: function(updateStyle) {

        if (!this.style) return this;

        this._styleDirty = this._styleDirty || updateStyle;
        this._tilesDirty = true;

        this._rerender();

        return this;
    },

    // Call when a (re-)render of the map is required, e.g. when the user panned or zoomed,f or new data is available.
    render: function() {
        if (this._styleDirty) {
            this._styleDirty = false;
            this._updateStyle();
        }

        if (this._tilesDirty) {
            for (var id in this.sources) {
                this.sources[id].update();
            }
            this._tilesDirty = false;
        }

        this._renderGroups(this.style.layerGroups);
        this.fire('render');

        this._frameId = null;

        if (!this.animationLoop.stopped()) {
            this._styleDirty = true;
        }

        if (this._repaint || !this.animationLoop.stopped()) {
            this._rerender();
        }

        return this;
    },

    remove: function() {
        this.dispatcher.remove();
        return this;
    },

    _renderGroups: function(groups) {
        this.painter.prepareBuffers();

        var i, len, group, source;

        // Render the groups
        for (i = 0, len = groups.length; i < len; i++) {
            group = groups[i];
            source = this.sources[group.source];

            if (source) {
                this.painter.clearStencil();
                source.render(group);

            } else if (group.source === undefined) {
                this.painter.draw(undefined, this.style, group, { background: true });
            }
        }
    },

    _rerender: function() {
        if (this.style && !this._frameId) {
            this._frameId = browser.frame(this.render);
        }
    },

    _onStyleChange: function () {
        this.update(true);
    },

    _updateStyle: function() {
        if (!this.style) return;
        this.style.recalculate(this.transform.zoom);
    },

    _updateBuckets: function() {
        // Transfer a stripped down version of the style to the workers. They only
        // need the bucket information to know what features to extract from the tile.
        this.dispatcher.broadcast('set buckets', this.style.orderedBuckets);

        // clears all tiles to recalculate geometries (for changes to linecaps, linejoins, ...)
        for (var s in this.sources) {
            this.sources[s].load();
        }

        this.update();
    }
});

util.extendAll(Map.prototype, {

    // debug code
    _debug: false,
    get debug() { return this._debug; },
    set debug(value) { this._debug = value; this.update(); },

    // continuous repaint
    _repaint: false,
    get repaint() { return this._repaint; },
    set repaint(value) { this._repaint = value; this.update(); },

    // polygon antialiasing
    _antialiasing: true,
    get antialiasing() { return this._antialiasing; },
    set antialiasing(value) { this._antialiasing = value; this.update(); },

    // show vertices
    _vertices: false,
    get vertices() { return this._vertices; },
    set vertices(value) { this._vertices = value; this.update(); },

    // show vertices
    _loadNewTiles: true,
    get loadNewTiles() { return this._loadNewTiles; },
    set loadNewTiles(value) { this._loadNewTiles = value; this.update(); }
});

},{"../geo/lat_lng":"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/lat_lng.js","../geo/lat_lng_bounds":"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/lat_lng_bounds.js","../geo/transform":"/home/pnorman/vector_tiles/mapbox-gl-js/js/geo/transform.js","../render/painter":"/home/pnorman/vector_tiles/mapbox-gl-js/js/render/painter.js","../source/source":"/home/pnorman/vector_tiles/mapbox-gl-js/js/source/source.js","../style/animation_loop":"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/animation_loop.js","../style/style":"/home/pnorman/vector_tiles/mapbox-gl-js/js/style/style.js","../symbol/glyph_source":"/home/pnorman/vector_tiles/mapbox-gl-js/js/symbol/glyph_source.js","../util/ajax":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/ajax.js","../util/browser":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/browser.js","../util/canvas":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/canvas.js","../util/dispatcher":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/dispatcher.js","../util/evented":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/evented.js","../util/util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js","./control/attribution":"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/control/attribution.js","./easings":"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/easings.js","./handlers":"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/handlers.js","./hash":"/home/pnorman/vector_tiles/mapbox-gl-js/js/ui/hash.js","point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/actor.js":[function(require,module,exports){
'use strict';

module.exports = Actor;

function Actor(target, parent) {
    this.target = target;
    this.parent = parent;
    this.callbacks = {};
    this.callbackID = 0;
    this.receive = this.receive.bind(this);
    this.target.addEventListener('message', this.receive, false);
}

Actor.prototype.receive = function(message) {
    var data = message.data,
        callback;

    if (data.type == '<response>') {
        callback = this.callbacks[data.id];
        delete this.callbacks[data.id];
        callback(data.error || null, data.data);
    } else if (typeof data.id !== 'undefined') {
        var id = data.id;
        this.parent[data.type](data.data, function response(err, data, buffers) {
            // console.warn('trying to clone', data, buffers, message.target);
            message.target.postMessage({
                type: '<response>',
                id: String(id),
                error: err ? String(err) : null,
                data: data
            }, buffers);
        });
    } else {
        this.parent[data.type](data.data);
    }
};

Actor.prototype.send = function(type, data, callback, buffers) {
    var id = null;
    if (callback) this.callbacks[id = this.callbackID++] = callback;
    this.target.postMessage({ type: type, id: String(id), data: data }, buffers);
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/ajax.js":[function(require,module,exports){
'use strict';

exports.getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onerror = function(e) {
        callback(e);
    };
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            var data;
            try { data = JSON.parse(xhr.response); }
            catch (err) { return callback(err); }
            callback(null, data);
        } else {
            callback(new Error(xhr.statusText));
        }
    };
    xhr.send();
    return xhr;
};

exports.getArrayBuffer = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onerror = function(e) {
        callback(e);
    };
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            callback(null, xhr.response);
        } else {
            callback(new Error(xhr.statusText));
        }
    };
    xhr.send();
    return xhr;
};

exports.getImage = function(url, callback) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        callback(null, img);
    };
    img.src = url;
    img.getData = function() {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        return context.getImageData(0, 0, img.width, img.height).data;
    };
    return img;
};

exports.getVideo = function(urls, callback) {
    var video = document.createElement('video');
    video.crossOrigin = 'Anonymous';
    video.onloadstart = function() {
        callback(null, video);
    };
    for (var i = 0; i < urls.length; i++) {
        var s = document.createElement('source');
        s.src = urls[i];
        video.appendChild(s);
    }
    video.getData = function() { return video; };
    return video;
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/browser.js":[function(require,module,exports){
'use strict';

var frameName = (function() {
    if (window.requestAnimationFrame) return 'requestAnimationFrame';
    if (window.mozRequestAnimationFrame) return 'mozRequestAnimationFrame';
    if (window.webkitRequestAnimationFrame) return 'webkitRequestAnimationFrame';
    if (window.msRequestAnimationFrame) return 'msRequestAnimationFrame';
})();

exports.frame = function(fn) {
    return window[frameName](fn);
};

exports.cancelFrame = function(id) {
    (window.cancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame)(id);
};

exports.timed = function (fn, dur, ctx) {
    if (!dur) {
        fn.call(ctx, 1);
        return;
    }

    var abort = false,
        start = window.performance ? window.performance.now() : Date.now();

    function tick(now) {
        if (abort) return;
        if (!window.performance) now = Date.now();

        if (now >= start + dur) {
            fn.call(ctx, 1);
        } else {
            fn.call(ctx, (now - start) / dur);
            exports.frame(tick);
        }
    }

    exports.frame(tick);

    return function() { abort = true; };
};

exports.supported = function() {
    var supports = [

        function() { return typeof window !== 'undefined'; },

        function() { return typeof document !== 'undefined'; },

        function () {
            return !!(Array.prototype &&
                Array.prototype.every &&
                Array.prototype.filter &&
                Array.prototype.forEach &&
                Array.prototype.indexOf &&
                Array.prototype.lastIndexOf &&
                Array.prototype.map &&
                Array.prototype.some &&
                Array.prototype.reduce &&
                Array.prototype.reduceRight &&
                Array.isArray);
        },

        function() {
            return !!(Function.prototype && Function.prototype.bind),
                !!(Object.keys &&
                    Object.create &&
                    Object.getPrototypeOf &&
                    Object.getOwnPropertyNames &&
                    Object.isSealed &&
                    Object.isFrozen &&
                    Object.isExtensible &&
                    Object.getOwnPropertyDescriptor &&
                    Object.defineProperty &&
                    Object.defineProperties &&
                    Object.seal &&
                    Object.freeze &&
                    Object.preventExtensions);
        },

        function() {
            return 'JSON' in window && 'parse' in JSON && 'stringify' in JSON;
        },

        function() {
            var canvas = document.createElement('canvas');
            if ('supportsContext' in canvas) {
                return canvas.supportsContext('webgl') || canvas.supportsContext('experimental-webgl');
            }
            return !!window.WebGLRenderingContext &&
                (!!canvas.getContext('webgl') || !!canvas.getContext('experimental-webgl'));
        },

        function() { return 'Worker' in window; }
    ];

    for (var i = 0; i < supports.length; i++) {
        if (!supports[i]()) return false;
    }
    return true;
};

exports.hardwareConcurrency = navigator.hardwareConcurrency || 8;

Object.defineProperty(exports, 'devicePixelRatio', {
    get: function() { return window.devicePixelRatio; }
});

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/canvas.js":[function(require,module,exports){
'use strict';

module.exports = Canvas;

function Canvas(parent, container) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.classList.add('mapboxgl-canvas');
    this.canvas.addEventListener('webglcontextlost', parent._contextLost.bind(parent), false);
    this.canvas.addEventListener('webglcontextrestored', parent._contextRestored.bind(parent), false);
    container.appendChild(this.canvas);
}

Canvas.prototype.resize = function(width, height) {
    var pixelRatio = window.devicePixelRatio || 1;

    // Request the required canvas size taking the pixelratio into account.
    this.canvas.width = pixelRatio * width;
    this.canvas.height = pixelRatio * height;

    // Maintain the same canvas size, potentially downscaling it for HiDPI displays
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
};

Canvas.prototype.getWebGLContext = function() {
    return this.canvas.getContext("experimental-webgl", {
        antialias: false,
        alpha: true,
        stencil: true,
        depth: false
    });
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/browser/dispatcher.js":[function(require,module,exports){
'use strict';

var Actor = require('../actor');

var scripts = document.getElementsByTagName("script");
var workerFile = (document.currentScript || scripts[scripts.length - 1]).getAttribute('src');
var absolute = workerFile.indexOf('http') !== -1;


// Manages the WebWorkers
module.exports = Dispatcher;
function Dispatcher(length, parent) {
    this.actors = [];
    this.currentActor = 0;

    var url, blob, i;

    for (i = 0; i < length; i++) {
        // due to cross domain issues we can't load it directly with the url,
        // so create a blob and object url and load that
        if (absolute) {
            blob = new Blob(['importScripts("' + workerFile + '");'], {type : 'application/javascript'});
            url = window.URL.createObjectURL(blob);
        } else {
            url = workerFile;
        }

        var worker = new Worker(url);
        var actor = new Actor(worker, parent);
        actor.name = "Worker " + i;
        this.actors.push(actor);
    }
}

Dispatcher.prototype.broadcast = function(type, data) {
    for (var i = 0; i < this.actors.length; i++) {
        this.actors[i].send(type, data);
    }
};

Dispatcher.prototype.send = function(type, data, callback, targetID, buffers) {
    if (typeof targetID !== 'number' || isNaN(targetID)) {
        // Use round robin to send requests to web workers.
        targetID = this.currentActor = (this.currentActor + 1) % this.actors.length;
    }

    this.actors[targetID].send(type, data, callback, buffers);
    return targetID;
};

Dispatcher.prototype.remove = function() {
    for (var i = 0; i < this.actors.length; i++) {
        this.actors[i].target.terminate();
    }
    this.actors = [];
};

},{"../actor":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/actor.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/config.js":[function(require,module,exports){
'use strict';

module.exports = {
    HTTP_URL: 'http://a.tiles.mapbox.com/v4',
    HTTPS_URL: 'https://a.tiles.mapbox.com/v4',
    FORCE_HTTPS: false,
    REQUIRE_ACCESS_TOKEN: true
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/dom.js":[function(require,module,exports){
'use strict';

exports.create = function (tagName, className, container) {
    var el = document.createElement(tagName);
    if (className) el.className = className;
    if (container) container.appendChild(el);
    return el;
};

function preventDefault(e) {
    e.preventDefault();
}

var docEl = typeof document !== 'undefined' ? document.documentElement : {},
    selectProp =
        'userSelect' in docEl ? 'userSelect' :
        'MozUserSelect' in docEl ? 'MozUserSelect' :
        'WebkitUserSelect' in docEl ? 'WebkitUserSelect' : null,
    userSelect;

exports.disableDrag = function () {
    window.addEventListener('dragstart', preventDefault);

    if ('onselectstart' in document) window.addEventListener('selectstart', preventDefault);
    else if (selectProp) {
        userSelect = docEl.style[selectProp];
        docEl.style[selectProp] = 'none';
    }
};
exports.enableDrag = function () {
    window.removeEventListener('dragstart', preventDefault);

    if ('onselectstart' in document) window.removeEventListener('selectstart', preventDefault);
    else if (selectProp) docEl.style[selectProp] = userSelect;
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/evented.js":[function(require,module,exports){
'use strict';

var util = require('./util');

module.exports = {
    on: function(type, fn) {
        this._events = this._events || {};
        this._events[type] = this._events[type] || [];
        this._events[type].push(fn);

        return this;
    },

    off: function(type, fn) {
        if (!type) {
            // clear all listeners if no arguments specified
            delete this._events;
            return this;
        }

        if (!this.listens(type)) return this;

        if (fn) {
            var idx = this._events[type].indexOf(fn);
            if (idx >= 0) {
                this._events[type].splice(idx, 1);
            }
            if (!this._events[type].length) {
                delete this._events[type];
            }
        } else {
            delete this._events[type];
        }

        return this;
    },

    fire: function(type, data) {
        if (!this.listens(type)) return this;

        data = util.extend({}, data);
        util.extend(data, {type: type, target: this});

        // make sure adding/removing listeners inside other listeners won't cause infinite loop
        var listeners = this._events[type].slice();

        for (var i = 0; i < listeners.length; i++) {
            listeners[i].call(this, data);
        }

        return this;
    },

    listens: function(type) {
        return !!(this._events && this._events[type]);
    }
};

},{"./util":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/glyphs.js":[function(require,module,exports){
'use strict';

module.exports = Glyphs;
function Glyphs(buffer, end) {
    // Public
    this.stacks = {};
    // Private
    this._buffer = buffer;

    var val, tag;
    if (typeof end === 'undefined') end = buffer.length;
    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;
        if (tag == 1) {
            var fontstack = this.readFontstack();
            this.stacks[fontstack.name] = fontstack;
        } else {
            // console.warn('skipping tile tag ' + tag);
            buffer.skip(val);
        }
    }
}

Glyphs.prototype.readFontstack = function() {
    var buffer = this._buffer;
    var fontstack = { glyphs: {} };

    var bytes = buffer.readVarint();
    var val, tag;
    var end = buffer.pos + bytes;
    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        if (tag == 1) {
            fontstack.name = buffer.readString();
        } else if (tag == 2) {
            var range = buffer.readString();
            fontstack.range = range;
        } else if (tag == 3) {
            var glyph = this.readGlyph();
            fontstack.glyphs[glyph.id] = glyph;
        } else {
            buffer.skip(val);
        }
    }

    return fontstack;
};

Glyphs.prototype.readGlyph = function() {
    var buffer = this._buffer;
    var glyph = {};

    var bytes = buffer.readVarint();
    var val, tag;
    var end = buffer.pos + bytes;
    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        if (tag == 1) {
            glyph.id = buffer.readVarint();
        } else if (tag == 2) {
            glyph.bitmap = buffer.readBuffer();
        } else if (tag == 3) {
            glyph.width = buffer.readVarint();
        } else if (tag == 4) {
            glyph.height = buffer.readVarint();
        } else if (tag == 5) {
            glyph.left = buffer.readSVarint();
        } else if (tag == 6) {
            glyph.top = buffer.readSVarint();
        } else if (tag == 7) {
            glyph.advance = buffer.readVarint();
        } else {
            buffer.skip(val);
        }
    }

    return glyph;
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/mapbox.js":[function(require,module,exports){
'use strict';

var config = require('./config');

function normalizeURL(url, accessToken) {
    accessToken = accessToken || config.ACCESS_TOKEN;

    if (!accessToken && config.REQUIRE_ACCESS_TOKEN) {
        throw new Error('An API access token is required to use Mapbox GL. ' +
            'See https://www.mapbox.com/developers/api/#access-tokens');
    }

    var https = config.FORCE_HTTPS ||
        (typeof document !== 'undefined' && 'https:' === document.location.protocol);

    url = url.replace(/^mapbox:\/\//, (https ? config.HTTPS_URL : config.HTTP_URL) + '/');
    url += url.indexOf('?') !== -1 ? '&access_token=' : '?access_token=';

    if (config.REQUIRE_ACCESS_TOKEN) {
        if (accessToken[0] === 's') {
            throw new Error('Use a public access token (pk.*) with Mapbox GL JS, not a secret access token (sk.*). ' +
                'See https://www.mapbox.com/developers/api/#access-tokens');
        }

        url += accessToken;
    }

    return url;
}

module.exports.normalizeSourceURL = function(url, accessToken) {
    if (!url.match(/^mapbox:\/\//))
        return url;

    url = normalizeURL(url + '.json', accessToken);

    // TileJSON requests need a secure flag appended to their URLs so
    // that the server knows to send SSL-ified resource references.
    if (url.indexOf('https') === 0)
        url += '&secure';

    return url;
};

module.exports.normalizeGlyphsURL = function(url, accessToken) {
    if (!url.match(/^mapbox:\/\//))
        return url;

    return normalizeURL(url, accessToken);
};

},{"./config":"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/config.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/mru_cache.js":[function(require,module,exports){
'use strict';

/*
 * A [most-recently-used cache](http://en.wikipedia.org/wiki/Cache_algorithms)
 * with hash lookup made possible by keeping a list of keys in parallel to
 * an array of dictionary of values
 */
module.exports = MRUCache;
function MRUCache(length, onRemove) {
    this.max = length;
    this.onRemove = onRemove;
    this.reset();
}

/*
 * Clears the cache
 */
MRUCache.prototype.reset = function() {
    this.list = {};
    this.order = [];

    return this;
};

/*
 * Add a key, value combination to the cache, trimming its size if this pushes
 * it over max length.
 */
MRUCache.prototype.add = function(key, data) {
    this.list[key] = data;
    this.order.push(key);

    if (this.order.length > this.max) {
        var removedData = this.get(this.order[0]);
        if (removedData) this.onRemove(removedData);
    }

    return this;
};

/*
 * Determine whether the value attached to `key` is present
 */
MRUCache.prototype.has = function(key) {
    return key in this.list;
};

/*
 * List all keys in the cache
 */
MRUCache.prototype.keys = function() {
    return this.order;
};

/*
 * Get the value attached to a specific key. If the key is not found,
 * returns `null`
 */
MRUCache.prototype.get = function(key) {
    if (!this.has(key)) { return null; }

    var data = this.list[key];

    delete this.list[key];
    this.order.splice(this.order.indexOf(key), 1);

    return data;
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/token.js":[function(require,module,exports){
'use strict';

module.exports = resolveTokens;

var tokenPattern = /{([\w-]+)}/;

function resolveTokens(properties, expression) {
    var match;
    var value;
    var text = expression;
    while ((match = text.match(tokenPattern))) {
        value = typeof properties[match[1]] === 'undefined' ? '' : properties[match[1]];
        text = text.replace(match[0], value);
    }
    return text;
}

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/js/util/util.js":[function(require,module,exports){
'use strict';

var UnitBezier = require('unitbezier');

exports.easeCubicInOut = function (t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    var t2 = t * t,
        t3 = t2 * t;
    return 4 * (t < 0.5 ? t3 : 3 * (t - t2) + t3 - 0.75);
};

exports.bezier = function(p1x, p1y, p2x, p2y) {
    var bezier = new UnitBezier(p1x, p1y, p2x, p2y);
    return function(t) {
        return bezier.solve(t);
    };
};

exports.ease = exports.bezier(0.25, 0.1, 0.25, 1);

exports.interp = function (a, b, t) {
    return (a * (1 - t)) + (b * t);
};

exports.premultiply = function (c) {
    c[0] *= c[3];
    c[1] *= c[3];
    c[2] *= c[3];
    return c;
};

// constrain n to the given range via min + max
exports.clamp = function (n, min, max) {
    return Math.min(max, Math.max(min, n));
};

// constrain n to the given range via modular arithmetic
exports.wrap = function (n, min, max) {
    var d = max - min;
    return n === max ? n : ((n - min) % d + d) % d + min;
};

exports.asyncEach = function (array, fn, callback) {
    var remaining = array.length;
    if (remaining === 0) return callback();
    function check() { if (--remaining === 0) callback(); }
    for (var i = 0; i < array.length; i++) fn(array[i], check);
};

exports.keysDifference = function (obj, other) {
    var difference = [];
    for (var i in obj) {
        if (!(i in other)) {
            difference.push(i);
        }
    }
    return difference;
};

exports.extend = function (dest, src) {
    for (var i in src) {
        dest[i] = src[i];
    }
    return dest;
};

exports.extendAll = function (dest, src) {
    for (var i in src) {
        Object.defineProperty(dest, i, Object.getOwnPropertyDescriptor(src, i));
    }
    return dest;
};

exports.inherit = function (parent, props) {
    var parentProto = typeof parent === 'function' ? parent.prototype : parent,
        proto = Object.create(parentProto);
    exports.extendAll(proto, props);
    return proto;
};

exports.pick = function (src) {
    var result = {};
    for (var i = 1; i < arguments.length; i++) {
        var k = arguments[i];
        if (k in src) {
            result[k] = src[k];
        }
    }
    return result;
};

var id = 1;

exports.uniqueId = function () {
    return id++;
};

exports.throttle = function (fn, time, context) {
    var lock, args, wrapperFn, later;

    later = function () {
        // reset lock and call if queued
        lock = false;
        if (args) {
            wrapperFn.apply(context, args);
            args = false;
        }
    };

    wrapperFn = function () {
        if (lock) {
            // called too soon, queue to call later
            args = arguments;

        } else {
            // call and lock until later
            fn.apply(context, arguments);
            setTimeout(later, time);
            lock = true;
        }
    };

    return wrapperFn;
};

exports.debounce = function(fn, time) {
    var timer, args;

    return function() {
        args = arguments;
        clearTimeout(timer);

        timer = setTimeout(function() {
            fn.apply(null, args);
        }, time);
    };
};

},{"unitbezier":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/unitbezier/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/browserify/node_modules/buffer/index.js":[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","ieee754":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","is-array":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/browserify/node_modules/buffer/node_modules/is-array/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js":[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js":[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/browserify/node_modules/buffer/node_modules/is-array/index.js":[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/csscolorparser/csscolorparser.js":[function(require,module,exports){
// (c) Dean McNamee <dean@gmail.com>, 2012.
//
// https://github.com/deanm/css-color-parser-js
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

// http://www.w3.org/TR/css3-color/
var kCSSColorTable = {
  "transparent": [0,0,0,0], "aliceblue": [240,248,255,1],
  "antiquewhite": [250,235,215,1], "aqua": [0,255,255,1],
  "aquamarine": [127,255,212,1], "azure": [240,255,255,1],
  "beige": [245,245,220,1], "bisque": [255,228,196,1],
  "black": [0,0,0,1], "blanchedalmond": [255,235,205,1],
  "blue": [0,0,255,1], "blueviolet": [138,43,226,1],
  "brown": [165,42,42,1], "burlywood": [222,184,135,1],
  "cadetblue": [95,158,160,1], "chartreuse": [127,255,0,1],
  "chocolate": [210,105,30,1], "coral": [255,127,80,1],
  "cornflowerblue": [100,149,237,1], "cornsilk": [255,248,220,1],
  "crimson": [220,20,60,1], "cyan": [0,255,255,1],
  "darkblue": [0,0,139,1], "darkcyan": [0,139,139,1],
  "darkgoldenrod": [184,134,11,1], "darkgray": [169,169,169,1],
  "darkgreen": [0,100,0,1], "darkgrey": [169,169,169,1],
  "darkkhaki": [189,183,107,1], "darkmagenta": [139,0,139,1],
  "darkolivegreen": [85,107,47,1], "darkorange": [255,140,0,1],
  "darkorchid": [153,50,204,1], "darkred": [139,0,0,1],
  "darksalmon": [233,150,122,1], "darkseagreen": [143,188,143,1],
  "darkslateblue": [72,61,139,1], "darkslategray": [47,79,79,1],
  "darkslategrey": [47,79,79,1], "darkturquoise": [0,206,209,1],
  "darkviolet": [148,0,211,1], "deeppink": [255,20,147,1],
  "deepskyblue": [0,191,255,1], "dimgray": [105,105,105,1],
  "dimgrey": [105,105,105,1], "dodgerblue": [30,144,255,1],
  "firebrick": [178,34,34,1], "floralwhite": [255,250,240,1],
  "forestgreen": [34,139,34,1], "fuchsia": [255,0,255,1],
  "gainsboro": [220,220,220,1], "ghostwhite": [248,248,255,1],
  "gold": [255,215,0,1], "goldenrod": [218,165,32,1],
  "gray": [128,128,128,1], "green": [0,128,0,1],
  "greenyellow": [173,255,47,1], "grey": [128,128,128,1],
  "honeydew": [240,255,240,1], "hotpink": [255,105,180,1],
  "indianred": [205,92,92,1], "indigo": [75,0,130,1],
  "ivory": [255,255,240,1], "khaki": [240,230,140,1],
  "lavender": [230,230,250,1], "lavenderblush": [255,240,245,1],
  "lawngreen": [124,252,0,1], "lemonchiffon": [255,250,205,1],
  "lightblue": [173,216,230,1], "lightcoral": [240,128,128,1],
  "lightcyan": [224,255,255,1], "lightgoldenrodyellow": [250,250,210,1],
  "lightgray": [211,211,211,1], "lightgreen": [144,238,144,1],
  "lightgrey": [211,211,211,1], "lightpink": [255,182,193,1],
  "lightsalmon": [255,160,122,1], "lightseagreen": [32,178,170,1],
  "lightskyblue": [135,206,250,1], "lightslategray": [119,136,153,1],
  "lightslategrey": [119,136,153,1], "lightsteelblue": [176,196,222,1],
  "lightyellow": [255,255,224,1], "lime": [0,255,0,1],
  "limegreen": [50,205,50,1], "linen": [250,240,230,1],
  "magenta": [255,0,255,1], "maroon": [128,0,0,1],
  "mediumaquamarine": [102,205,170,1], "mediumblue": [0,0,205,1],
  "mediumorchid": [186,85,211,1], "mediumpurple": [147,112,219,1],
  "mediumseagreen": [60,179,113,1], "mediumslateblue": [123,104,238,1],
  "mediumspringgreen": [0,250,154,1], "mediumturquoise": [72,209,204,1],
  "mediumvioletred": [199,21,133,1], "midnightblue": [25,25,112,1],
  "mintcream": [245,255,250,1], "mistyrose": [255,228,225,1],
  "moccasin": [255,228,181,1], "navajowhite": [255,222,173,1],
  "navy": [0,0,128,1], "oldlace": [253,245,230,1],
  "olive": [128,128,0,1], "olivedrab": [107,142,35,1],
  "orange": [255,165,0,1], "orangered": [255,69,0,1],
  "orchid": [218,112,214,1], "palegoldenrod": [238,232,170,1],
  "palegreen": [152,251,152,1], "paleturquoise": [175,238,238,1],
  "palevioletred": [219,112,147,1], "papayawhip": [255,239,213,1],
  "peachpuff": [255,218,185,1], "peru": [205,133,63,1],
  "pink": [255,192,203,1], "plum": [221,160,221,1],
  "powderblue": [176,224,230,1], "purple": [128,0,128,1],
  "red": [255,0,0,1], "rosybrown": [188,143,143,1],
  "royalblue": [65,105,225,1], "saddlebrown": [139,69,19,1],
  "salmon": [250,128,114,1], "sandybrown": [244,164,96,1],
  "seagreen": [46,139,87,1], "seashell": [255,245,238,1],
  "sienna": [160,82,45,1], "silver": [192,192,192,1],
  "skyblue": [135,206,235,1], "slateblue": [106,90,205,1],
  "slategray": [112,128,144,1], "slategrey": [112,128,144,1],
  "snow": [255,250,250,1], "springgreen": [0,255,127,1],
  "steelblue": [70,130,180,1], "tan": [210,180,140,1],
  "teal": [0,128,128,1], "thistle": [216,191,216,1],
  "tomato": [255,99,71,1], "turquoise": [64,224,208,1],
  "violet": [238,130,238,1], "wheat": [245,222,179,1],
  "white": [255,255,255,1], "whitesmoke": [245,245,245,1],
  "yellow": [255,255,0,1], "yellowgreen": [154,205,50,1]}

function clamp_css_byte(i) {  // Clamp to integer 0 .. 255.
  i = Math.round(i);  // Seems to be what Chrome does (vs truncation).
  return i < 0 ? 0 : i > 255 ? 255 : i;
}

function clamp_css_float(f) {  // Clamp to float 0.0 .. 1.0.
  return f < 0 ? 0 : f > 1 ? 1 : f;
}

function parse_css_int(str) {  // int or percentage.
  if (str[str.length - 1] === '%')
    return clamp_css_byte(parseFloat(str) / 100 * 255);
  return clamp_css_byte(parseInt(str));
}

function parse_css_float(str) {  // float or percentage.
  if (str[str.length - 1] === '%')
    return clamp_css_float(parseFloat(str) / 100);
  return clamp_css_float(parseFloat(str));
}

function css_hue_to_rgb(m1, m2, h) {
  if (h < 0) h += 1;
  else if (h > 1) h -= 1;

  if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
  if (h * 2 < 1) return m2;
  if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
  return m1;
}

function parseCSSColor(css_str) {
  // Remove all whitespace, not compliant, but should just be more accepting.
  var str = css_str.replace(/ /g, '').toLowerCase();

  // Color keywords (and transparent) lookup.
  if (str in kCSSColorTable) return kCSSColorTable[str].slice();  // dup.

  // #abc and #abc123 syntax.
  if (str[0] === '#') {
    if (str.length === 4) {
      var iv = parseInt(str.substr(1), 16);  // TODO(deanm): Stricter parsing.
      if (!(iv >= 0 && iv <= 0xfff)) return null;  // Covers NaN.
      return [((iv & 0xf00) >> 4) | ((iv & 0xf00) >> 8),
              (iv & 0xf0) | ((iv & 0xf0) >> 4),
              (iv & 0xf) | ((iv & 0xf) << 4),
              1];
    } else if (str.length === 7) {
      var iv = parseInt(str.substr(1), 16);  // TODO(deanm): Stricter parsing.
      if (!(iv >= 0 && iv <= 0xffffff)) return null;  // Covers NaN.
      return [(iv & 0xff0000) >> 16,
              (iv & 0xff00) >> 8,
              iv & 0xff,
              1];
    }

    return null;
  }

  var op = str.indexOf('('), ep = str.indexOf(')');
  if (op !== -1 && ep + 1 === str.length) {
    var fname = str.substr(0, op);
    var params = str.substr(op+1, ep-(op+1)).split(',');
    var alpha = 1;  // To allow case fallthrough.
    switch (fname) {
      case 'rgba':
        if (params.length !== 4) return null;
        alpha = parse_css_float(params.pop());
        // Fall through.
      case 'rgb':
        if (params.length !== 3) return null;
        return [parse_css_int(params[0]),
                parse_css_int(params[1]),
                parse_css_int(params[2]),
                alpha];
      case 'hsla':
        if (params.length !== 4) return null;
        alpha = parse_css_float(params.pop());
        // Fall through.
      case 'hsl':
        if (params.length !== 3) return null;
        var h = (((parseFloat(params[0]) % 360) + 360) % 360) / 360;  // 0 .. 1
        // NOTE(deanm): According to the CSS spec s/l should only be
        // percentages, but we don't bother and let float or percentage.
        var s = parse_css_float(params[1]);
        var l = parse_css_float(params[2]);
        var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        var m1 = l * 2 - m2;
        return [clamp_css_byte(css_hue_to_rgb(m1, m2, h+1/3) * 255),
                clamp_css_byte(css_hue_to_rgb(m1, m2, h) * 255),
                clamp_css_byte(css_hue_to_rgb(m1, m2, h-1/3) * 255),
                alpha];
      default:
        return null;
    }
  }

  return null;
}

try { exports.parseCSSColor = parseCSSColor } catch(e) { }

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/feature-filter/index.js":[function(require,module,exports){
'use strict';

var VectorTileFeatureTypes = ['Unknown', 'Point', 'LineString', 'Polygon'];

function infix(operator) {
    return function(_, key, value) {
        if (key === '$type') {
            return 't' + operator + VectorTileFeatureTypes.indexOf(value);
        } else {
            return 'p[' + JSON.stringify(key) + ']' + operator + JSON.stringify(value);
        }
    };
}

function strictInfix(operator) {
    var nonstrictInfix = infix(operator);
    return function(_, key, value) {
        if (key === '$type') {
            return nonstrictInfix(_, key, value);
        } else {
            return 'typeof(p[' + JSON.stringify(key) + ']) === typeof(' + JSON.stringify(value) + ') && ' +
                nonstrictInfix(_, key, value);
        }
    };
}

var operators = {
    '==': infix('==='),
    '!=': infix('!=='),
    '>': strictInfix('>'),
    '<': strictInfix('<'),
    '<=': strictInfix('<='),
    '>=': strictInfix('>='),
    'in': function(_, key) {
        return Array.prototype.slice.call(arguments, 2).map(function(value) {
            return '(' + operators['=='](_, key, value) + ')';
        }).join('||') || 'false';
    },
    '!in': function() {
        return '!(' + operators.in.apply(this, arguments) + ')';
    },
    'any': function() {
        return Array.prototype.slice.call(arguments, 1).map(function(filter) {
            return '(' + compile(filter) + ')';
        }).join('||') || 'false';
    },
    'all': function() {
        return Array.prototype.slice.call(arguments, 1).map(function(filter) {
            return '(' + compile(filter) + ')';
        }).join('&&') || 'true';
    },
    'none': function() {
        return '!(' + operators.any.apply(this, arguments) + ')';
    }
};

function compile(filter) {
    return operators[filter[0]].apply(filter, filter);
}

function truth() {
    return true;
}

module.exports = function (filter) {
    if (!filter) return truth;
    var filterStr = 'var p = f.properties || f.tags || {}, t = f.type; return ' + compile(filter) + ';';
    // jshint evil: true
    return new Function('f', filterStr);
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/geojson-rewind/index.js":[function(require,module,exports){
var geojsonArea = require('geojson-area');

module.exports = rewind;

function rewind(gj, outer) {
    switch ((gj && gj.type) || null) {
        case 'FeatureCollection':
            gj.features = gj.features.map(curryOuter(rewind, outer));
            return gj;
        case 'Feature':
            gj.geometry = rewind(gj.geometry, outer);
            return gj;
        case 'Polygon':
        case 'MultiPolygon':
            return correct(gj, outer);
        default:
            return gj;
    }
}

function curryOuter(a, b) {
    return function(_) { return a(_, b); };
}

function correct(_, outer) {
    if (_.type === 'Polygon') {
        _.coordinates = correctRings(_.coordinates, outer);
    } else if (_.type === 'MultiPolygon') {
        _.coordinates = _.coordinates.map(curryOuter(correctRings, outer));
    }
    return _;
}

function correctRings(_, outer) {
    outer = !!outer;
    _[0] = wind(_[0], !outer);
    for (var i = 1; i < _.length; i++) {
        _[i] = wind(_[i], outer);
    }
    return _;
}

function wind(_, dir) {
    return cw(_) === dir ? _ : _.reverse();
}

function cw(_) {
    return geojsonArea.ring(_) >= 0;
}

},{"geojson-area":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/geojson-rewind/node_modules/geojson-area/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/geojson-rewind/node_modules/geojson-area/index.js":[function(require,module,exports){
var wgs84 = require('wgs84');

module.exports.geometry = geometry;
module.exports.ring = ringArea;

function geometry(_) {
    if (_.type === 'Polygon') return polygonArea(_.coordinates);
    else if (_.type === 'MultiPolygon') {
        var area = 0;
        for (var i = 0; i < _.coordinates.length; i++) {
            area += polygonArea(_.coordinates[i]);
        }
        return area;
    } else {
        return null;
    }
}

function polygonArea(coords) {
    var area = 0;
    if (coords && coords.length > 0) {
        area += Math.abs(ringArea(coords[0]));
        for (var i = 1; i < coords.length; i++) {
            area -= Math.abs(ringArea(coords[i]));
        }
    }
    return area;
}

/**
 * Calculate the approximate area of the polygon were it projected onto
 *     the earth.  Note that this area will be positive if ring is oriented
 *     clockwise, otherwise it will be negative.
 *
 * Reference:
 * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for
 *     Polygons on a Sphere", JPL Publication 07-03, Jet Propulsion
 *     Laboratory, Pasadena, CA, June 2007 http://trs-new.jpl.nasa.gov/dspace/handle/2014/40409
 *
 * Returns:
 * {float} The approximate signed geodesic area of the polygon in square
 *     meters.
 */

function ringArea(coords) {
    var area = 0;

    if (coords.length > 2) {
        var p1, p2;
        for (var i = 0; i < coords.length - 1; i++) {
            p1 = coords[i];
            p2 = coords[i + 1];
            area += rad(p2[0] - p1[0]) * (2 + Math.sin(rad(p1[1])) + Math.sin(rad(p2[1])));
        }

        area = area * wgs84.RADIUS * wgs84.RADIUS / 2;
    }

    return area;
}

function rad(_) {
    return _ * Math.PI / 180;
}

},{"wgs84":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/geojson-rewind/node_modules/geojson-area/node_modules/wgs84/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/geojson-rewind/node_modules/geojson-area/node_modules/wgs84/index.js":[function(require,module,exports){
module.exports.RADIUS = 6378137;
module.exports.FLATTENING = 1/298.257223563;
module.exports.POLAR_RADIUS = 6356752.3142;

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/mapbox-gl-style-spec/reference/v6.json":[function(require,module,exports){
module.exports={
  "$version": 6,
  "$root": {
    "version": {
      "required": true,
      "type": "enum",
      "values": [
        6
      ],
      "doc": "Stylesheet version number. Must be 6."
    },
    "constants": {
      "type": "constants",
      "doc": "An object of constants to be referenced in layers."
    },
    "sources": {
      "required": true,
      "type": "sources",
      "doc": "Data source specifications for layers to pull from."
    },
    "sprite": {
      "type": "string",
      "doc": "A base URL for retrieving the sprite image and metadata. The extensions `.png`, `.json` and scale factor `@2x.png` will be automatically appended."
    },
    "glyphs": {
      "type": "string",
      "doc": "A URL template for loading signed-distance-field glyph sets in PBF format. Valid tokens are {fontstack} and {range}."
    },
    "transition": {
      "type": "transition",
      "doc": "A global transition definition to use as a default across properties."
    },
    "layers": {
      "required": true,
      "type": "array",
      "value": "layer",
      "doc": "Layers will be drawn in the order of this array."
    }
  },
  "constants": {
    "*": {
      "type": "*",
      "doc": "A constant that will be replaced verbatim in the referencing place. This can be anything, including objects and arrays. All variable names must be prefixed with an `@` symbol."
    }
  },
  "sources": {
    "*": {
      "type": "source",
      "doc": "Specification of a data source. For vector and raster sources, either TileJSON or a URL to a TileJSON must be provided. For GeoJSON and video sources, a URL must be provided."
    }
  },
  "source": {
    "type": {
      "required": true,
      "type": "enum",
      "values": [
        "vector",
        "raster",
        "geojson",
        "video"
      ],
      "doc": "The data type of the source."
    },
    "url": {
      "type": "string",
      "doc": "A URL to a TileJSON resource. Supported protocols are `http:`, `https:`, and `mapbox://<mapid>`."
    },
    "tiles": {
      "type": "string",
      "doc": "An array of one or more tile source URLs, as in the TileJSON spec."
    },
    "minzoom": {
      "type": "number",
      "default": 0,
      "doc": "Minimum zoom level for which tiles are available, as in the TileJSON spec."
    },
    "maxzoom": {
      "type": "number",
      "default": 22,
      "doc": "Maximum zoom level for which tiles are available, as in the TileJSON spec. Data from tiles at the maxzoom are used when displaying the map at higher zoom levels."
    },
    "tileSize": {
      "type": "number",
      "default": 512,
      "units": "pixels",
      "doc": "The minimum visual size to display tiles for this layer. Only configurable for raster layers."
    },
    "*": {
      "type": "*",
      "doc": "Other keys to configure the data source."
    }
  },
  "layer": {
    "id": {
      "type": "string",
      "doc": "Unique layer name."
    },
    "type": {
      "type": "enum",
      "values": [
        "fill",
        "line",
        "symbol",
        "raster",
        "background"
      ],
      "doc": "Rendering type of this layer."
    },
    "ref": {
      "type": "string",
      "doc": "References another layer to copy `type`, `source`, `source-layer`, `minzoom`, `maxzoom`, `filter`, and `layout` properties from. This allows the layers to share processing and be more efficient."
    },
    "source": {
      "type": "string",
      "doc": "Name of a source description to be used for this layer."
    },
    "source-layer": {
      "type": "string",
      "doc": "Layer to use from a vector tile source. Required if the source supports multiple layers."
    },
    "minzoom": {
      "type": "number",
      "minimum": 0,
      "maximum": 22,
      "doc": "The minimum zoom level on which the layer gets parsed and appears on."
    },
    "maxzoom": {
      "type": "number",
      "minimum": 0,
      "maximum": 22,
      "doc": "The maximum zoom level on which the layer gets parsed and appears on."
    },
    "interactive": {
      "type": "boolean",
      "doc": "Enable querying of feature data from this layer for interactivity.",
      "default": false
    },
    "filter": {
      "type": "filter",
      "doc": "A expression specifying conditions on source features. Only features that match the filter are displayed."
    },
    "layers": {
      "type": "array",
      "value": "layer",
      "doc": "If `type` is `raster`, the child layers are composited together onto the previous level layer level."
    },
    "layout": {
      "type": "layout",
      "doc": "Layout properties for the layer."
    },
    "paint": {
      "type": "paint",
      "doc": "Default paint properties for this layer."
    },
    "paint.*": {
      "type": "paint",
      "doc": "Class-specific paint properties for this layer. The class name is the part after the first dot."
    }
  },
  "layout": [
    "layout_fill",
    "layout_line",
    "layout_symbol",
    "layout_raster",
    "layout_background"
  ],
  "layout_background": {
  },
  "layout_fill": {
  },
  "layout_line": {
    "line-cap": {
      "type": "enum",
      "values": [
        "butt",
        "round",
        "square"
      ],
      "default": "butt",
      "doc": "The display of line endings."
    },
    "line-join": {
      "type": "enum",
      "values": [
        "bevel",
        "round",
        "miter"
      ],
      "default": "miter",
      "doc": "The display of lines when joining."
    },
    "line-miter-limit": {
      "type": "number",
      "default": 2,
      "doc": "Used to automatically convert miter joins to bevel joins for sharp angles.",
      "requires": [
        {
          "line-join": "miter"
        }
      ]
    },
    "line-round-limit": {
      "type": "number",
      "default": 1,
      "doc": "Used to automatically convert round joins to miter joins for shallow angles.",
      "requires": [
        {
          "line-join": "round"
        }
      ]
    }
  },
  "layout_symbol": {
    "symbol-placement": {
      "type": "enum",
      "values": [
          "point",
          "line"
      ],
      "default": "point",
      "doc": "Label placement relative to its geometry. `Line` can only be used on LineStrings and Polygons."
    },
    "symbol-min-distance": {
      "type": "number",
      "default": 250,
      "minimum": 0,
      "units": "pixels",
      "doc": "Minimum distance between two symbol anchors.",
      "requires": [
        {
          "symbol-placement": "line"
        }
      ]
    },
    "symbol-avoid-edges": {
      "type": "boolean",
      "default": false,
      "doc": "If true, the symbols will not cross tile edges to avoid mutual collisions. Recommended in layers that don't have enough padding in the vector tile to prevent collisions, or if it is a point symbol layer placed after a line symbol layer."
    },
    "icon-allow-overlap": {
      "type": "boolean",
      "default": false,
      "doc": "If true, the icon will be visible even if it collides with other icons and text.",
      "requires": [
        "icon-image"
      ]
    },
    "icon-ignore-placement": {
      "type": "boolean",
      "default": false,
      "doc": "If true, the icon won't affect placement of other icons and text.",
      "requires": [
        "icon-image"
      ]
    },
    "icon-optional": {
      "type": "boolean",
      "default": false,
      "doc": "If true, text can be shown without its corresponding icon.",
      "requires": [
        "icon-image"
      ]
    },
    "icon-rotation-alignment": {
      "type": "enum",
      "values": [
        "map",
        "viewport"
      ],
      "default": "viewport",
      "doc": "Orientation of icon when map is rotated",
      "requires": [
        "icon-image"
      ]
    },
    "icon-max-size": {
      "type": "number",
      "default": 1,
      "minimum": 0,
      "doc": "The maximum factor to scale the icon.",
      "requires": [
        "icon-image"
      ]
    },
    "icon-image": {
      "type": "string",
      "doc": "A string with {tokens} replaced, referencing the data property to pull from.",
      "tokens": true
    },
    "icon-rotate": {
      "type": "number",
      "default": 0,
      "period": 360,
      "units": "degrees",
      "doc": "Rotates the icon clockwise.",
      "requires": [
        "icon-image"
      ]
    },
    "icon-padding": {
      "type": "number",
      "default": 2,
      "minimum": 0,
      "units": "pixels",
      "doc": "Padding value around icon bounding box to avoid icon collisions.",
      "requires": [
        "icon-image"
      ]
    },
    "icon-keep-upright": {
      "type": "boolean",
      "default": false,
      "doc": "If true, the icon may be flipped to prevent it from being rendered upside-down",
      "requires": [
        "icon-image"
      ]
    },
    "icon-offset": {
      "type": "array",
      "value": "number",
      "length": 2,
      "default": [
        0,
        0
      ],
      "doc": "Icon's offset distance. Values are [x, y] where negatives indicate left and up, respectively.",
      "requires": [
        "icon-image"
      ]
    },
    "text-rotation-alignment": {
      "type": "enum",
      "values": [
        "map",
        "viewport"
      ],
      "default": "viewport",
      "doc": "Orientation of icon or text when map is rotated",
      "requires": [
        "text-field"
      ]
    },
    "text-field": {
      "type": "string",
      "default": "",
      "tokens": true,
      "doc": "Value to use for a text label. Feature properties are specified using tokens like {field_name}."
    },
    "text-font": {
      "type": "string",
      "default": "Open Sans Regular, Arial Unicode MS Regular",
      "doc": "Font stack to use for displaying text.",
      "requires": [
        "text-field"
      ]
    },
    "text-max-size": {
      "type": "number",
      "default": 16,
      "minimum": 0,
      "units": "pixels",
      "doc": "The maximum size text will be laid out, to calculate collisions with.",
      "requires": [
        "text-field"
      ]
    },
    "text-max-width": {
      "type": "number",
      "default": 15,
      "minimum": 0,
      "units": "em",
      "doc": "The maximum line width for text wrapping.",
      "requires": [
        "text-field"
      ]
    },
    "text-line-height": {
      "type": "number",
      "default": 1.2,
      "doc": "Text leading value for multi-line text.",
      "requires": [
        "text-field"
      ]
    },
    "text-letter-spacing": {
      "type": "number",
      "default": 0,
      "units": "em",
      "doc": "Text kerning value.",
      "requires": [
        "text-field"
      ]
    },
    "text-justify": {
      "type": "enum",
      "values": [
        "center",
        "left",
        "right"
      ],
      "default": "center",
      "doc": "Text justification options.",
      "requires": [
        "text-field"
      ]
    },
    "text-anchor": {
      "type": "enum",
      "values": [
        "center",
        "left",
        "right",
        "top",
        "bottom",
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right"
      ],
      "default": "center",
      "doc": "Which part of the text to place closest to the anchor.",
      "requires": [
        "text-field"
      ]
    },
    "text-max-angle": {
      "type": "number",
      "default": 45,
      "units": "degrees",
      "doc": "Maximum angle change between adjacent characters.",
      "requires": [
        "text-field"
      ]
    },
    "text-rotate": {
      "type": "number",
      "default": 0,
      "period": 360,
      "units": "degrees",
      "doc": "Rotates the text clockwise.",
      "requires": [
        "text-field"
      ]
    },
    "text-padding": {
      "type": "number",
      "default": 2,
      "minimum": 0,
      "units": "pixels",
      "doc": "Padding value around text bounding box to avoid label collisions.",
      "requires": [
        "text-field"
      ]
    },
    "text-keep-upright": {
      "type": "boolean",
      "default": true,
      "doc": "If true, the text may be flipped vertically to prevent it from being rendered upside-down.",
      "requires": [
        "text-field"
      ]
    },
    "text-transform": {
      "type": "enum",
      "values": [
        "none",
        "uppercase",
        "lowercase"
      ],
      "default": "none",
      "doc": "Specifies how to capitalize text, similar to the CSS `text-transform` property.",
      "requires": [
        "text-field"
      ]
    },
    "text-offset": {
      "type": "array",
      "doc": "Specifies the distance that text is offset from its anchor horizontally and vertically.",
      "value": "number",
      "units": "ems",
      "length": 2,
      "default": [
        0,
        0
      ],
      "requires": [
        "text-field"
      ]
    },
    "text-allow-overlap": {
      "type": "boolean",
      "default": false,
      "doc": "If true, the text will be visible even if it collides with other icons and labels.",
      "requires": [
        "text-field"
      ]
    },
    "text-ignore-placement": {
      "type": "boolean",
      "default": false,
      "doc": "If true, the text won't affect placement of other icons and labels.",
      "requires": [
        "text-field"
      ]
    },
    "text-optional": {
      "type": "boolean",
      "default": false,
      "doc": "If true, icons can be shown without their corresponding text.",
      "requires": [
        "text-field"
      ]
    }
  },
  "layout_raster": {
    "raster-size": {
      "type": "number",
      "function": true,
      "default": 256,
      "minimum": 0,
      "maximum": 3855,
      "units": "pixels",
      "doc": "The texture image size at which vector layers will be rasterized. Will scale to match the visual tile size."
    },
    "raster-blur": {
      "type": "number",
      "function": true,
      "default": 0,
      "minimum": 0,
      "units": "pixels",
      "doc": "Blur radius applied to the raster texture before display."
    }
  },
  "filter": {
    "type": "array",
    "value": "*"
  },
  "filter_operator": {
    "type": "enum",
    "values": [
      "==",
      "!=",
      ">",
      ">=",
      "<",
      "<=",
      "in",
      "!in",
      "all",
      "any",
      "none"
    ]
  },
  "geometry_type": {
    "type": "enum",
    "values": [
      "Point",
      "LineString",
      "Polygon"
    ]
  },
  "function": {
    "stops": {
      "type": "array",
      "required": true,
      "doc": "An array of stops.",
      "value": "function_stop"
    },
    "base": {
      "type": "number",
      "default": 1,
      "minimum": 0,
      "doc": "The exponential base of the interpolation curve. It controls the rate at which the result increases. Higher values make the result increase more towards the high end of the range. With `1` the stops are interpolated linearly."
    }
  },
  "function_stop": {
    "type": "array",
    "minimum": 0,
    "maximum": 22,
    "value": [
      "number",
      "color"
    ],
    "length": 2,
    "doc": "Zoom level and value pair."
  },
  "paint": [
    "paint_fill",
    "paint_line",
    "paint_symbol",
    "paint_raster",
    "paint_background"
  ],
  "paint_fill": {
    "fill-antialias": {
      "type": "boolean",
      "default": true,
      "function": true,
      "doc": "Whether or not the fill should be antialiased."
    },
    "fill-opacity": {
      "type": "number",
      "function": true,
      "default": 1,
      "minimum": 0,
      "maximum": 1,
      "doc": "The opacity given to the fill color",
      "transition": true
    },
    "fill-color": {
      "type": "color",
      "default": "#000000",
      "doc": "The color of the fill.",
      "function": true,
      "transition": true,
      "requires": [
        {
          "!": "fill-image"
        }
      ]
    },
    "fill-outline-color": {
      "type": "color",
      "doc": "The outline color of the fill. Matches the value of `fill-color` if unspecified.",
      "function": true,
      "transition": true,
      "requires": [
        {
          "!": "fill-image"
        },
        {
          "fill-antialias": true
        }
      ]
    },
    "fill-translate": {
      "type": "array",
      "value": "number",
      "length": 2,
      "default": [
        0,
        0
      ],
      "function": true,
      "transition": true,
      "units": "pixels",
      "doc": "The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively."
    },
    "fill-translate-anchor": {
      "type": "enum",
      "values": [
        "map",
        "viewport"
      ],
      "doc": "Control whether the translation is relative to the map (north) or viewport (screen)",
      "default": "map",
      "requires": [
        "fill-translate"
      ]
    },
    "fill-image": {
      "type": "string",
      "doc": "Name of image in sprite to use for drawing image fills."
    }
  },
  "paint_line": {
    "line-opacity": {
      "type": "number",
      "doc": "The opacity at which the line will be drawn",
      "function": true,
      "default": 1,
      "minimum": 0,
      "maximum": 1,
      "transition": true
    },
    "line-color": {
      "type": "color",
      "doc": "The color with which the line will be drawn",
      "default": "#000000",
      "function": true,
      "transition": true,
      "requires": [
        {
          "!": "line-image"
        }
      ]
    },
    "line-translate": {
      "type": "array",
      "value": "number",
      "length": 2,
      "default": [
        0,
        0
      ],
      "function": true,
      "transition": true,
      "units": "pixels",
      "doc": "The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively."
    },
    "line-translate-anchor": {
      "type": "enum",
      "values": [
        "map",
        "viewport"
      ],
      "doc": "Control whether the translation is relative to the map (north) or viewport (screen)",
      "default": "map",
      "requires": [
        "line-translate"
      ]
    },
    "line-width": {
      "type": "number",
      "default": 1,
      "minimum": 0,
      "function": true,
      "transition": true,
      "units": "pixels",
      "doc": "Stroke thickness"
    },
    "line-gap-width": {
      "type": "number",
      "default": 0,
      "minimum": 0,
      "doc": "Draws a line casing outside of a line's actual path. Value indicates the width of the inner gap.",
      "function": true,
      "transition": true,
      "units": "pixels"
    },
    "line-blur": {
      "type": "number",
      "default": 0,
      "minimum": 0,
      "function": true,
      "transition": true,
      "units": "pixels",
      "doc": "Line blur"
    },
    "line-dasharray": {
      "type": "array",
      "value": "number",
      "doc": "Specifies the size and gap between dashes in a line.",
      "length": 2,
      "default": [
        1,
        -1
      ],
      "minimum": 0,
      "function": true,
      "transition": true,
      "requires": [
        {
          "!": "line-image"
        }
      ]
    },
    "line-image": {
      "type": "string",
      "doc": "Name of image in sprite to use for drawing image lines."
    }
  },
  "paint_symbol": {
    "icon-opacity": {
      "doc": "The opacity at which the icon will be drawn",
      "type": "number",
      "default": 1,
      "minimum": 0,
      "maximum": 1,
      "function": true,
      "transition": true,
      "requires": [
        "icon-image"
      ]
    },
    "icon-size": {
      "type": "number",
      "default": 1,
      "function": true,
      "transition": true,
      "doc": "Scale factor for icon. 1 is original size, 3 triples the size.",
      "requires": [
        "icon-image"
      ]
    },
    "icon-color": {
      "type": "color",
      "default": "#000000",
      "function": true,
      "transition": true,
      "doc": "The color of the icon. This can only be used with sdf icons.",
      "requires": [
        "icon-image"
      ]
    },
    "icon-halo-color": {
      "type": "color",
      "default": "rgba(0, 0, 0, 0)",
      "function": true,
      "transition": true,
      "doc": "The color of the icon's halo. Icon halos can only be used with sdf icons.",
      "requires": [
        "icon-image"
      ]
    },
    "icon-halo-width": {
      "type": "number",
      "default": 0,
      "minimum": 0,
      "function": true,
      "transition": true,
      "units": "pixels",
      "doc": "Distance of halo to the icon outline.",
      "requires": [
        "icon-image"
      ]
    },
    "icon-halo-blur": {
      "type": "number",
      "default": 0,
      "minimum": 0,
      "function": true,
      "transition": true,
      "units": "pixels",
      "doc": "Fade out the halo towards the outside.",
      "requires": [
        "icon-image"
      ]
    },
    "icon-translate": {
      "type": "array",
      "value": "number",
      "length": 2,
      "default": [
        0,
        0
      ],
      "function": true,
      "transition": true,
      "units": "pixels",
      "doc": "An icon's offset distance. Values are [x, y] where negatives indicate left and up, respectively.",
      "requires": [
        "icon-image"
      ]
    },
    "icon-translate-anchor": {
      "type": "enum",
      "values": [
        "map",
        "viewport"
      ],
      "doc": "Control whether the translation is relative to the map (north) or viewport (screen)",
      "default": "map",
      "requires": [
        "icon-image",
        "icon-translate"
      ]
    },
    "text-opacity": {
      "type": "number",
      "doc": "The opacity at which the text will be drawn",
      "default": 1,
      "minimum": 0,
      "maximum": 1,
      "function": true,
      "transition": true,
      "requires": [
        "text-field"
      ]
    },
    "text-size": {
      "type": "number",
      "default": 16,
      "minimum": 0,
      "function": true,
      "transition": true,
      "units": "pixels",
      "doc": "Font size. If unspecified, the text will be as big as allowed by the layer definition.",
      "requires": [
        "text-field"
      ]
    },
    "text-color": {
      "type": "color",
      "doc": "The color with which the text will be drawn",
      "default": "#000000",
      "function": true,
      "transition": true,
      "requires": [
        "text-field"
      ]
    },
    "text-halo-color": {
      "type": "color",
      "default": "rgba(0, 0, 0, 0)",
      "function": true,
      "transition": true,
      "doc": "The color of the text's halo, which helps it stand out from backgrounds.",
      "requires": [
        "text-field"
      ]
    },
    "text-halo-width": {
      "type": "number",
      "default": 0,
      "minimum": 0,
      "function": true,
      "transition": true,
      "units": "pixels",
      "doc": "Distance of halo to the font outline. Max text halo width is 1/4 of the font-size.",
      "requires": [
        "text-field"
      ]
    },
    "text-halo-blur": {
      "type": "number",
      "default": 0,
      "minimum": 0,
      "function": true,
      "transition": true,
      "units": "pixels",
      "doc": "The halo's fadeout distance towards the outside.",
      "requires": [
        "text-field"
      ]
    },
    "text-translate": {
      "type": "array",
      "value": "number",
      "length": 2,
      "default": [
        0,
        0
      ],
      "function": true,
      "transition": true,
      "units": "pixels",
      "doc": "Label offset. Values are [x, y] where negatives indicate left and up, respectively.",
      "requires": [
        "text-field"
      ]
    },
    "text-translate-anchor": {
      "type": "enum",
      "values": [
        "map",
        "viewport"
      ],
      "doc": "Control whether the translation is relative to the map (north) or viewport (screen)",
      "default": "map",
      "requires": [
        "text-field",
        "text-translate"
      ]
    }
  },
  "paint_raster": {
    "raster-opacity": {
      "type": "number",
      "doc": "The opacity at which the image will be drawn",
      "default": 1,
      "minimum": 0,
      "maximum": 1,
      "transition": true
    },
    "raster-hue-rotate": {
      "type": "number",
      "default": 0,
      "period": 360,
      "function": true,
      "transition": true,
      "units": "degrees",
      "doc": "Rotates hues around the color wheel."
    },
    "raster-brightness": {
      "type": "array",
      "value": "number",
      "doc": "Increase or reduce the brightness of the image. First value is the minimum, second is the maximum brightness.",
      "length": 2,
      "default": [
        0,
        1
      ],
      "function": true,
      "transition": true
    },
    "raster-saturation": {
      "type": "number",
      "doc": "Increase or reduce the saturation of the image.",
      "default": 0,
      "function": true,
      "transition": true
    },
    "raster-contrast": {
      "type": "number",
      "doc": "Increase or reduce the contrast of the image.",
      "default": 0,
      "minimum": -1,
      "maximum": 1,
      "function": true,
      "transition": true
    },
    "raster-fade-duration": {
      "type": "number",
      "default": 300,
      "minimum": 0,
      "function": true,
      "transition": true,
      "units": "milliseconds",
      "doc": "Fade duration when a new tile is added."
    }
  },
  "paint_background": {
    "background-color": {
      "type": "color",
      "default": "#000000",
      "doc": "The color with which the background will be drawn",
      "function": true,
      "transition": true,
      "requires": [
        {
          "!": "background-image"
        }
      ]
    },
    "background-image": {
      "type": "string",
      "doc": "Optionally an image which is drawn as the background"
    },
    "background-opacity": {
      "type": "number",
      "default": 1,
      "minimum": 0,
      "maximum": 1,
      "doc": "The opacity at which the background will be drawn",
      "function": true,
      "transition": true
    }
  },
  "transition": {
    "duration": {
      "type": "number",
      "default": 300,
      "minimum": 0,
      "units": "milliseconds",
      "doc": "Time allotted for transitions to complete."
    },
    "delay": {
      "type": "number",
      "default": 0,
      "minimum": 0,
      "units": "milliseconds",
      "doc": "Length of time before a transition begins."
    }
  }
}

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/pbf/index.js":[function(require,module,exports){
(function (Buffer){
'use strict';

var ieee754 = require('ieee754');

module.exports = Protobuf;
function Protobuf(buf) {
    this.buf = buf;
    this.pos = 0;
}

Protobuf.prototype = {
    get length() { return this.buf.length; }
};

Protobuf.Varint = 0;
Protobuf.Int64 = 1;
Protobuf.Message = 2;
Protobuf.String = 2;
Protobuf.Packed = 2;
Protobuf.Int32 = 5;

Protobuf.prototype.destroy = function() {
    this.buf = null;
};

// === READING =================================================================

Protobuf.prototype.readUInt32 = function() {
    var val = this.buf.readUInt32LE(this.pos);
    this.pos += 4;
    return val;
};

Protobuf.prototype.readUInt64 = function() {
    var val = this.buf.readUInt64LE(this.pos);
    this.pos += 8;
    return val;
};

Protobuf.prototype.readDouble = function() {
    var val = ieee754.read(this.buf, this.pos, true, 52, 8);
    this.pos += 8;
    return val;
};

Protobuf.prototype.readVarint = function() {
    // TODO: bounds checking
    var pos = this.pos;
    if (this.buf[pos] <= 0x7f) {
        this.pos++;
        return this.buf[pos];
    } else if (this.buf[pos + 1] <= 0x7f) {
        this.pos += 2;
        return (this.buf[pos] & 0x7f) | (this.buf[pos + 1] << 7);
    } else if (this.buf[pos + 2] <= 0x7f) {
        this.pos += 3;
        return (this.buf[pos] & 0x7f) | (this.buf[pos + 1] & 0x7f) << 7 | (this.buf[pos + 2]) << 14;
    } else if (this.buf[pos + 3] <= 0x7f) {
        this.pos += 4;
        return (this.buf[pos] & 0x7f) | (this.buf[pos + 1] & 0x7f) << 7 | (this.buf[pos + 2] & 0x7f) << 14 | (this.buf[pos + 3]) << 21;
    } else if (this.buf[pos + 4] <= 0x7f) {
        this.pos += 5;
        return ((this.buf[pos] & 0x7f) | (this.buf[pos + 1] & 0x7f) << 7 | (this.buf[pos + 2] & 0x7f) << 14 | (this.buf[pos + 3]) << 21) + (this.buf[pos + 4] * 268435456);
    } else {
        this.skip(Protobuf.Varint);
        return 0;
        // throw new Error("TODO: Handle 6+ byte varints");
    }
};

Protobuf.prototype.readSVarint = function() {
    var num = this.readVarint();
    if (num > 2147483647) throw new Error('TODO: Handle numbers >= 2^30');
    // zigzag encoding
    return ((num >> 1) ^ -(num & 1));
};

Protobuf.prototype.readString = function() {
    var bytes = this.readVarint();
    // TODO: bounds checking
    var chr = String.fromCharCode;
    var b = this.buf;
    var p = this.pos;
    var end = this.pos + bytes;
    var str = '';
    while (p < end) {
        if (b[p] <= 0x7F) str += chr(b[p++]);
        else if (b[p] <= 0xBF) throw new Error('Invalid UTF-8 codepoint: ' + b[p]);
        else if (b[p] <= 0xDF) str += chr((b[p++] & 0x1F) << 6 | (b[p++] & 0x3F));
        else if (b[p] <= 0xEF) str += chr((b[p++] & 0x1F) << 12 | (b[p++] & 0x3F) << 6 | (b[p++] & 0x3F));
        else if (b[p] <= 0xF7) p += 4; // We can't handle these codepoints in JS, so skip.
        else if (b[p] <= 0xFB) p += 5;
        else if (b[p] <= 0xFD) p += 6;
        else throw new Error('Invalid UTF-8 codepoint: ' + b[p]);
    }
    this.pos += bytes;
    return str;
};

Protobuf.prototype.readBuffer = function() {
    var bytes = this.readVarint();
    var buffer = this.buf.subarray(this.pos, this.pos + bytes);
    this.pos += bytes;
    return buffer;
};

Protobuf.prototype.readPacked = function(type) {
    // TODO: bounds checking
    var bytes = this.readVarint();
    var end = this.pos + bytes;
    var array = [];
    while (this.pos < end) {
        array.push(this['read' + type]());
    }
    return array;
};

Protobuf.prototype.skip = function(val) {
    // TODO: bounds checking
    var type = val & 0x7;
    switch (type) {
        /* varint */ case Protobuf.Varint: while (this.buf[this.pos++] > 0x7f); break;
        /* 64 bit */ case Protobuf.Int64: this.pos += 8; break;
        /* length */ case Protobuf.Message: var bytes = this.readVarint(); this.pos += bytes; break;
        /* 32 bit */ case Protobuf.Int32: this.pos += 4; break;
        default: throw new Error('Unimplemented type: ' + type);
    }
};

// === WRITING =================================================================

Protobuf.prototype.writeTag = function(tag, type) {
    this.writeVarint((tag << 3) | type);
};

Protobuf.prototype.realloc = function(min) {
    var length = this.buf.length;
    while (length < this.pos + min) length *= 2;
    if (length != this.buf.length) {
        var buf = new Buffer(length);
        this.buf.copy(buf);
        this.buf = buf;
    }
};

Protobuf.prototype.finish = function() {
    return this.buf.slice(0, this.pos);
};

Protobuf.prototype.writePacked = function(type, tag, items) {
    if (!items.length) return;

    var message = new Protobuf();
    for (var i = 0; i < items.length; i++) {
        message['write' + type](items[i]);
    }
    var data = message.finish();

    this.writeTag(tag, Protobuf.Packed);
    this.writeBuffer(data);
};

Protobuf.prototype.writeUInt32 = function(val) {
    this.realloc(4);
    this.buf.writeUInt32LE(val, this.pos);
    this.pos += 4;
};

Protobuf.prototype.writeTaggedUInt32 = function(tag, val) {
    this.writeTag(tag, Protobuf.Int32);
    this.writeUInt32(val);
};

Protobuf.prototype.writeVarint = function(val) {
    val = Number(val);
    if (isNaN(val)) {
        val = 0;
    }

    if (val <= 0x7f) {
        this.realloc(1);
        this.buf[this.pos++] = val;
    } else if (val <= 0x3fff) {
        this.realloc(2);
        this.buf[this.pos++] = 0x80 | ((val >>> 0) & 0x7f);
        this.buf[this.pos++] = 0x00 | ((val >>> 7) & 0x7f);
    } else if (val <= 0x1ffffff) {
        this.realloc(3);
        this.buf[this.pos++] = 0x80 | ((val >>> 0) & 0x7f);
        this.buf[this.pos++] = 0x80 | ((val >>> 7) & 0x7f);
        this.buf[this.pos++] = 0x00 | ((val >>> 14) & 0x7f);
    } else if (val <= 0xfffffff) {
        this.realloc(4);
        this.buf[this.pos++] = 0x80 | ((val >>> 0) & 0x7f);
        this.buf[this.pos++] = 0x80 | ((val >>> 7) & 0x7f);
        this.buf[this.pos++] = 0x80 | ((val >>> 14) & 0x7f);
        this.buf[this.pos++] = 0x00 | ((val >>> 21) & 0x7f);
    } else {
        while (val > 0) {
            var b = val & 0x7f;
            val = Math.floor(val / 128);
            if (val > 0) b |= 0x80
            this.realloc(1);
            this.buf[this.pos++] = b;
        }
    }
};

Protobuf.prototype.writeTaggedVarint = function(tag, val) {
    this.writeTag(tag, Protobuf.Varint);
    this.writeVarint(val);
};

Protobuf.prototype.writeSVarint = function(val) {
    if (val >= 0) {
        this.writeVarint(val * 2);
    } else {
        this.writeVarint(val * -2 - 1);
    }
};

Protobuf.prototype.writeTaggedSVarint = function(tag, val) {
    this.writeTag(tag, Protobuf.Varint);
    this.writeSVarint(val);
};

Protobuf.prototype.writeBoolean = function(val) {
    this.writeVarint(Boolean(val));
};

Protobuf.prototype.writeTaggedBoolean = function(tag, val) {
    this.writeTaggedVarint(tag, Boolean(val));
};

Protobuf.prototype.writeString = function(str) {
    str = String(str);
    var bytes = Buffer.byteLength(str);
    this.writeVarint(bytes);
    this.realloc(bytes);
    this.buf.write(str, this.pos);
    this.pos += bytes;
};

Protobuf.prototype.writeTaggedString = function(tag, str) {
    this.writeTag(tag, Protobuf.String);
    this.writeString(str);
};

Protobuf.prototype.writeFloat = function(val) {
    this.realloc(4);
    this.buf.writeFloatLE(val, this.pos);
    this.pos += 4;
};

Protobuf.prototype.writeTaggedFloat = function(tag, val) {
    this.writeTag(tag, Protobuf.Int32);
    this.writeFloat(val);
};

Protobuf.prototype.writeDouble = function(val) {
    this.realloc(8);
    this.buf.writeDoubleLE(val, this.pos);
    this.pos += 8;
};

Protobuf.prototype.writeTaggedDouble = function(tag, val) {
    this.writeTag(tag, Protobuf.Int64);
    this.writeDouble(val);
};

Protobuf.prototype.writeBuffer = function(buffer) {
    var bytes = buffer.length;
    this.writeVarint(bytes);
    this.realloc(bytes);
    buffer.copy(this.buf, this.pos);
    this.pos += bytes;
};

Protobuf.prototype.writeTaggedBuffer = function(tag, buffer) {
    this.writeTag(tag, Protobuf.String);
    this.writeBuffer(buffer);
};

Protobuf.prototype.writeMessage = function(tag, protobuf) {
    var buffer = protobuf.finish();
    this.writeTag(tag, Protobuf.Message);
    this.writeBuffer(buffer);
};

}).call(this,require("buffer").Buffer)
},{"buffer":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/browserify/node_modules/buffer/index.js","ieee754":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/pbf/node_modules/ieee754/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/pbf/node_modules/ieee754/index.js":[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js":[function(require,module,exports){
'use strict';

module.exports = Point;

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype = {
    clone: function() { return new Point(this.x, this.y); },

    add:     function(p) { return this.clone()._add(p);     },
    sub:     function(p) { return this.clone()._sub(p);     },
    mult:    function(k) { return this.clone()._mult(k);    },
    div:     function(k) { return this.clone()._div(k);     },
    rotate:  function(a) { return this.clone()._rotate(a);  },
    matMult: function(m) { return this.clone()._matMult(m); },
    unit:    function() { return this.clone()._unit(); },
    perp:    function() { return this.clone()._perp(); },
    round:   function() { return this.clone()._round(); },

    mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    equals: function(p) {
        return this.x === p.x &&
               this.y === p.y;
    },

    dist: function(p) {
        return Math.sqrt(this.distSqr(p));
    },

    distSqr: function(p) {
        var dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    angle: function() {
        return Math.atan2(this.y, this.x);
    },

    angleTo: function(b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    angleWith: function(b) {
        return this.angleWithSep(b.x, b.y);
    },

    // Find the angle of the two vectors, solving the formula for the cross product a x b = |a||b|sin(θ) for θ.
    angleWithSep: function(x, y) {
        return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y);
    },

    _matMult: function(m) {
        var x = m[0] * this.x + m[1] * this.y,
            y = m[2] * this.x + m[3] * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _add: function(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    },

    _sub: function(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },

    _mult: function(k) {
        this.x *= k;
        this.y *= k;
        return this;
    },

    _div: function(k) {
        this.x /= k;
        this.y /= k;
        return this;
    },

    _unit: function() {
        this._div(this.mag());
        return this;
    },

    _perp: function() {
        var y = this.y;
        this.y = this.x;
        this.x = -y;
        return this;
    },

    _rotate: function(angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = cos * this.x - sin * this.y,
            y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _round: function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
};

// constructs Point from an array if necessary
Point.convert = function (a) {
    if (a instanceof Point) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point(a[0], a[1]);
    }
    return a;
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/queue-async/queue.js":[function(require,module,exports){
(function() {
  var slice = [].slice;

  function queue(parallelism) {
    var q,
        tasks = [],
        started = 0, // number of tasks that have been started (and perhaps finished)
        active = 0, // number of tasks currently being executed (started but not finished)
        remaining = 0, // number of tasks not yet finished
        popping, // inside a synchronous task callback?
        error = null,
        await = noop,
        all;

    if (!parallelism) parallelism = Infinity;

    function pop() {
      while (popping = started < tasks.length && active < parallelism) {
        var i = started++,
            t = tasks[i],
            a = slice.call(t, 1);
        a.push(callback(i));
        ++active;
        t[0].apply(null, a);
      }
    }

    function callback(i) {
      return function(e, r) {
        --active;
        if (error != null) return;
        if (e != null) {
          error = e; // ignore new tasks and squelch active callbacks
          started = remaining = NaN; // stop queued tasks from starting
          notify();
        } else {
          tasks[i] = r;
          if (--remaining) popping || pop();
          else notify();
        }
      };
    }

    function notify() {
      if (error != null) await(error);
      else if (all) await(error, tasks);
      else await.apply(null, [error].concat(tasks));
    }

    return q = {
      defer: function() {
        if (!error) {
          tasks.push(arguments);
          ++remaining;
          pop();
        }
        return q;
      },
      await: function(f) {
        await = f;
        all = false;
        if (!remaining) notify();
        return q;
      },
      awaitAll: function(f) {
        await = f;
        all = true;
        if (!remaining) notify();
        return q;
      }
    };
  }

  function noop() {}

  queue.version = "1.0.7";
  if (typeof define === "function" && define.amd) define(function() { return queue; });
  else if (typeof module === "object" && module.exports) module.exports = queue;
  else this.queue = queue;
})();

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/rbush/rbush.js":[function(require,module,exports){
/*
 (c) 2013, Vladimir Agafonkin
 RBush, a JavaScript library for high-performance 2D spatial indexing of points and rectangles.
 https://github.com/mourner/rbush
*/

(function () { 'use strict';

function rbush(maxEntries, format) {

    // jshint newcap: false, validthis: true
    if (!(this instanceof rbush)) return new rbush(maxEntries, format);

    // max entries in a node is 9 by default; min node fill is 40% for best performance
    this._maxEntries = Math.max(4, maxEntries || 9);
    this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));

    if (format) {
        this._initFormat(format);
    }

    this.clear();
}

rbush.prototype = {

    all: function () {
        return this._all(this.data, []);
    },

    search: function (bbox) {

        var node = this.data,
            result = [],
            toBBox = this.toBBox;

        if (!intersects(bbox, node.bbox)) return result;

        var nodesToSearch = [],
            i, len, child, childBBox;

        while (node) {
            for (i = 0, len = node.children.length; i < len; i++) {

                child = node.children[i];
                childBBox = node.leaf ? toBBox(child) : child.bbox;

                if (intersects(bbox, childBBox)) {
                    if (node.leaf) result.push(child);
                    else if (contains(bbox, childBBox)) this._all(child, result);
                    else nodesToSearch.push(child);
                }
            }
            node = nodesToSearch.pop();
        }

        return result;
    },

    load: function (data) {
        if (!(data && data.length)) return this;

        if (data.length < this._minEntries) {
            for (var i = 0, len = data.length; i < len; i++) {
                this.insert(data[i]);
            }
            return this;
        }

        // recursively build the tree with the given data from stratch using OMT algorithm
        var node = this._build(data.slice(), 0, data.length - 1, 0);

        if (!this.data.children.length) {
            // save as is if tree is empty
            this.data = node;

        } else if (this.data.height === node.height) {
            // split root if trees have the same height
            this._splitRoot(this.data, node);

        } else {
            if (this.data.height < node.height) {
                // swap trees if inserted one is bigger
                var tmpNode = this.data;
                this.data = node;
                node = tmpNode;
            }

            // insert the small tree into the large tree at appropriate level
            this._insert(node, this.data.height - node.height - 1, true);
        }

        return this;
    },

    insert: function (item) {
        if (item) this._insert(item, this.data.height - 1);
        return this;
    },

    clear: function () {
        this.data = {
            children: [],
            height: 1,
            bbox: empty(),
            leaf: true
        };
        return this;
    },

    remove: function (item) {
        if (!item) return this;

        var node = this.data,
            bbox = this.toBBox(item),
            path = [],
            indexes = [],
            i, parent, index, goingUp;

        // depth-first iterative tree traversal
        while (node || path.length) {

            if (!node) { // go up
                node = path.pop();
                parent = path[path.length - 1];
                i = indexes.pop();
                goingUp = true;
            }

            if (node.leaf) { // check current node
                index = node.children.indexOf(item);

                if (index !== -1) {
                    // item found, remove the item and condense tree upwards
                    node.children.splice(index, 1);
                    path.push(node);
                    this._condense(path);
                    return this;
                }
            }

            if (!goingUp && !node.leaf && contains(node.bbox, bbox)) { // go down
                path.push(node);
                indexes.push(i);
                i = 0;
                parent = node;
                node = node.children[0];

            } else if (parent) { // go right
                i++;
                node = parent.children[i];
                goingUp = false;

            } else node = null; // nothing found
        }

        return this;
    },

    toBBox: function (item) { return item; },

    compareMinX: function (a, b) { return a[0] - b[0]; },
    compareMinY: function (a, b) { return a[1] - b[1]; },

    toJSON: function () { return this.data; },

    fromJSON: function (data) {
        this.data = data;
        return this;
    },

    _all: function (node, result) {
        var nodesToSearch = [];
        while (node) {
            if (node.leaf) result.push.apply(result, node.children);
            else nodesToSearch.push.apply(nodesToSearch, node.children);

            node = nodesToSearch.pop();
        }
        return result;
    },

    _build: function (items, left, right, height) {

        var N = right - left + 1,
            M = this._maxEntries,
            node;

        if (N <= M) {
            // reached leaf level; return leaf
            node = {
                children: items.slice(left, right + 1),
                height: 1,
                bbox: null,
                leaf: true
            };
            calcBBox(node, this.toBBox);
            return node;
        }

        if (!height) {
            // target height of the bulk-loaded tree
            height = Math.ceil(Math.log(N) / Math.log(M));

            // target number of root entries to maximize storage utilization
            M = Math.ceil(N / Math.pow(M, height - 1));
        }

        // TODO eliminate recursion?

        node = {
            children: [],
            height: height,
            bbox: null
        };

        // split the items into M mostly square tiles

        var N2 = Math.ceil(N / M),
            N1 = N2 * Math.ceil(Math.sqrt(M)),
            i, j, right2, right3;

        multiSelect(items, left, right, N1, this.compareMinX);

        for (i = left; i <= right; i += N1) {

            right2 = Math.min(i + N1 - 1, right);

            multiSelect(items, i, right2, N2, this.compareMinY);

            for (j = i; j <= right2; j += N2) {

                right3 = Math.min(j + N2 - 1, right2);

                // pack each entry recursively
                node.children.push(this._build(items, j, right3, height - 1));
            }
        }

        calcBBox(node, this.toBBox);

        return node;
    },

    _chooseSubtree: function (bbox, node, level, path) {

        var i, len, child, targetNode, area, enlargement, minArea, minEnlargement;

        while (true) {
            path.push(node);

            if (node.leaf || path.length - 1 === level) break;

            minArea = minEnlargement = Infinity;

            for (i = 0, len = node.children.length; i < len; i++) {
                child = node.children[i];
                area = bboxArea(child.bbox);
                enlargement = enlargedArea(bbox, child.bbox) - area;

                // choose entry with the least area enlargement
                if (enlargement < minEnlargement) {
                    minEnlargement = enlargement;
                    minArea = area < minArea ? area : minArea;
                    targetNode = child;

                } else if (enlargement === minEnlargement) {
                    // otherwise choose one with the smallest area
                    if (area < minArea) {
                        minArea = area;
                        targetNode = child;
                    }
                }
            }

            node = targetNode;
        }

        return node;
    },

    _insert: function (item, level, isNode) {

        var toBBox = this.toBBox,
            bbox = isNode ? item.bbox : toBBox(item),
            insertPath = [];

        // find the best node for accommodating the item, saving all nodes along the path too
        var node = this._chooseSubtree(bbox, this.data, level, insertPath);

        // put the item into the node
        node.children.push(item);
        extend(node.bbox, bbox);

        // split on node overflow; propagate upwards if necessary
        while (level >= 0) {
            if (insertPath[level].children.length > this._maxEntries) {
                this._split(insertPath, level);
                level--;
            } else break;
        }

        // adjust bboxes along the insertion path
        this._adjustParentBBoxes(bbox, insertPath, level);
    },

    // split overflowed node into two
    _split: function (insertPath, level) {

        var node = insertPath[level],
            M = node.children.length,
            m = this._minEntries;

        this._chooseSplitAxis(node, m, M);

        var newNode = {
            children: node.children.splice(this._chooseSplitIndex(node, m, M)),
            height: node.height
        };

        if (node.leaf) newNode.leaf = true;

        calcBBox(node, this.toBBox);
        calcBBox(newNode, this.toBBox);

        if (level) insertPath[level - 1].children.push(newNode);
        else this._splitRoot(node, newNode);
    },

    _splitRoot: function (node, newNode) {
        // split root node
        this.data = {
            children: [node, newNode],
            height: node.height + 1
        };
        calcBBox(this.data, this.toBBox);
    },

    _chooseSplitIndex: function (node, m, M) {

        var i, bbox1, bbox2, overlap, area, minOverlap, minArea, index;

        minOverlap = minArea = Infinity;

        for (i = m; i <= M - m; i++) {
            bbox1 = distBBox(node, 0, i, this.toBBox);
            bbox2 = distBBox(node, i, M, this.toBBox);

            overlap = intersectionArea(bbox1, bbox2);
            area = bboxArea(bbox1) + bboxArea(bbox2);

            // choose distribution with minimum overlap
            if (overlap < minOverlap) {
                minOverlap = overlap;
                index = i;

                minArea = area < minArea ? area : minArea;

            } else if (overlap === minOverlap) {
                // otherwise choose distribution with minimum area
                if (area < minArea) {
                    minArea = area;
                    index = i;
                }
            }
        }

        return index;
    },

    // sorts node children by the best axis for split
    _chooseSplitAxis: function (node, m, M) {

        var compareMinX = node.leaf ? this.compareMinX : compareNodeMinX,
            compareMinY = node.leaf ? this.compareMinY : compareNodeMinY,
            xMargin = this._allDistMargin(node, m, M, compareMinX),
            yMargin = this._allDistMargin(node, m, M, compareMinY);

        // if total distributions margin value is minimal for x, sort by minX,
        // otherwise it's already sorted by minY
        if (xMargin < yMargin) node.children.sort(compareMinX);
    },

    // total margin of all possible split distributions where each node is at least m full
    _allDistMargin: function (node, m, M, compare) {

        node.children.sort(compare);

        var toBBox = this.toBBox,
            leftBBox = distBBox(node, 0, m, toBBox),
            rightBBox = distBBox(node, M - m, M, toBBox),
            margin = bboxMargin(leftBBox) + bboxMargin(rightBBox),
            i, child;

        for (i = m; i < M - m; i++) {
            child = node.children[i];
            extend(leftBBox, node.leaf ? toBBox(child) : child.bbox);
            margin += bboxMargin(leftBBox);
        }

        for (i = M - m - 1; i >= m; i--) {
            child = node.children[i];
            extend(rightBBox, node.leaf ? toBBox(child) : child.bbox);
            margin += bboxMargin(rightBBox);
        }

        return margin;
    },

    _adjustParentBBoxes: function (bbox, path, level) {
        // adjust bboxes along the given tree path
        for (var i = level; i >= 0; i--) {
            extend(path[i].bbox, bbox);
        }
    },

    _condense: function (path) {
        // go through the path, removing empty nodes and updating bboxes
        for (var i = path.length - 1, siblings; i >= 0; i--) {
            if (path[i].children.length === 0) {
                if (i > 0) {
                    siblings = path[i - 1].children;
                    siblings.splice(siblings.indexOf(path[i]), 1);

                } else this.clear();

            } else calcBBox(path[i], this.toBBox);
        }
    },

    _initFormat: function (format) {
        // data format (minX, minY, maxX, maxY accessors)

        // uses eval-type function compilation instead of just accepting a toBBox function
        // because the algorithms are very sensitive to sorting functions performance,
        // so they should be dead simple and without inner calls

        // jshint evil: true

        var compareArr = ['return a', ' - b', ';'];

        this.compareMinX = new Function('a', 'b', compareArr.join(format[0]));
        this.compareMinY = new Function('a', 'b', compareArr.join(format[1]));

        this.toBBox = new Function('a', 'return [a' + format.join(', a') + '];');
    }
};


// calculate node's bbox from bboxes of its children
function calcBBox(node, toBBox) {
    node.bbox = distBBox(node, 0, node.children.length, toBBox);
}

// min bounding rectangle of node children from k to p-1
function distBBox(node, k, p, toBBox) {
    var bbox = empty();

    for (var i = k, child; i < p; i++) {
        child = node.children[i];
        extend(bbox, node.leaf ? toBBox(child) : child.bbox);
    }

    return bbox;
}

function empty() { return [Infinity, Infinity, -Infinity, -Infinity]; }

function extend(a, b) {
    a[0] = Math.min(a[0], b[0]);
    a[1] = Math.min(a[1], b[1]);
    a[2] = Math.max(a[2], b[2]);
    a[3] = Math.max(a[3], b[3]);
    return a;
}

function compareNodeMinX(a, b) { return a.bbox[0] - b.bbox[0]; }
function compareNodeMinY(a, b) { return a.bbox[1] - b.bbox[1]; }

function bboxArea(a)   { return (a[2] - a[0]) * (a[3] - a[1]); }
function bboxMargin(a) { return (a[2] - a[0]) + (a[3] - a[1]); }

function enlargedArea(a, b) {
    return (Math.max(b[2], a[2]) - Math.min(b[0], a[0])) *
           (Math.max(b[3], a[3]) - Math.min(b[1], a[1]));
}

function intersectionArea (a, b) {
    var minX = Math.max(a[0], b[0]),
        minY = Math.max(a[1], b[1]),
        maxX = Math.min(a[2], b[2]),
        maxY = Math.min(a[3], b[3]);

    return Math.max(0, maxX - minX) *
           Math.max(0, maxY - minY);
}

function contains(a, b) {
    return a[0] <= b[0] &&
           a[1] <= b[1] &&
           b[2] <= a[2] &&
           b[3] <= a[3];
}

function intersects (a, b) {
    return b[0] <= a[2] &&
           b[1] <= a[3] &&
           b[2] >= a[0] &&
           b[3] >= a[1];
}

// sort an array so that items come in groups of n unsorted items, with groups sorted between each other;
// combines selection algorithm with binary divide & conquer approach

function multiSelect(arr, left, right, n, compare) {
    var stack = [left, right],
        mid;

    while (stack.length) {
        right = stack.pop();
        left = stack.pop();

        if (right - left <= n) continue;

        mid = left + Math.ceil((right - left) / n / 2) * n;
        select(arr, left, right, mid, compare);

        stack.push(left, mid, mid, right);
    }
}

// sort array between left and right (inclusive) so that the smallest k elements come first (unordered)
function select(arr, left, right, k, compare) {
    var n, i, z, s, sd, newLeft, newRight, t, j;

    while (right > left) {
        if (right - left > 600) {
            n = right - left + 1;
            i = k - left + 1;
            z = Math.log(n);
            s = 0.5 * Math.exp(2 * z / 3);
            sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (i - n / 2 < 0 ? -1 : 1);
            newLeft = Math.max(left, Math.floor(k - i * s / n + sd));
            newRight = Math.min(right, Math.floor(k + (n - i) * s / n + sd));
            select(arr, newLeft, newRight, k, compare);
        }

        t = arr[k];
        i = left;
        j = right;

        swap(arr, left, k);
        if (compare(arr[right], t) > 0) swap(arr, left, right);

        while (i < j) {
            swap(arr, i, j);
            i++;
            j--;
            while (compare(arr[i], t) < 0) i++;
            while (compare(arr[j], t) > 0) j--;
        }

        if (compare(arr[left], t) === 0) swap(arr, left, j);
        else {
            j++;
            swap(arr, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}

function swap(arr, i, j) {
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}


// export as AMD/CommonJS module or global variable
if (typeof define === 'function' && define.amd) define(function() { return rbush; });
else if (typeof module !== 'undefined') module.exports = rbush;
else if (typeof self !== 'undefined') self.rbush = rbush;
else window.rbush = rbush;

})();

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/unitbezier/index.js":[function(require,module,exports){
/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Ported from Webkit
 * http://svn.webkit.org/repository/webkit/trunk/Source/WebCore/platform/graphics/UnitBezier.h
 */

module.exports = UnitBezier;

function UnitBezier(p1x, p1y, p2x, p2y) {
    // Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
    this.cx = 3.0 * p1x;
    this.bx = 3.0 * (p2x - p1x) - this.cx;
    this.ax = 1.0 - this.cx - this.bx;

    this.cy = 3.0 * p1y;
    this.by = 3.0 * (p2y - p1y) - this.cy;
    this.ay = 1.0 - this.cy - this.by;

    this.p1x = p1x;
    this.p1y = p2y;
    this.p2x = p2x;
    this.p2y = p2y;
}

UnitBezier.prototype.sampleCurveX = function(t) {
    // `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
    return ((this.ax * t + this.bx) * t + this.cx) * t;
};

UnitBezier.prototype.sampleCurveY = function(t) {
    return ((this.ay * t + this.by) * t + this.cy) * t;
};

UnitBezier.prototype.sampleCurveDerivativeX = function(t) {
    return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
};

UnitBezier.prototype.solveCurveX = function(x, epsilon) {
    if (typeof epsilon === 'undefined') epsilon = 1e-6;

    var t0, t1, t2, x2, i;

    // First try a few iterations of Newton's method -- normally very fast.
    for (t2 = x, i = 0; i < 8; i++) {

        x2 = this.sampleCurveX(t2) - x;
        if (Math.abs(x2) < epsilon) return t2;

        var d2 = this.sampleCurveDerivativeX(t2);
        if (Math.abs(d2) < 1e-6) break;

        t2 = t2 - x2 / d2;
    }

    // Fall back to the bisection method for reliability.
    t0 = 0.0;
    t1 = 1.0;
    t2 = x;

    if (t2 < t0) return t0;
    if (t2 > t1) return t1;

    while (t0 < t1) {

        x2 = this.sampleCurveX(t2);
        if (Math.abs(x2 - x) < epsilon) return t2;

        if (x > x2) {
            t0 = t2;
        } else {
            t1 = t2;
        }

        t2 = (t1 - t0) * 0.5 + t0;
    }

    // Failure.
    return t2;
};

UnitBezier.prototype.solve = function(x, epsilon) {
    return this.sampleCurveY(this.solveCurveX(x, epsilon));
};

},{}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/vector-tile/index.js":[function(require,module,exports){
module.exports.VectorTile = require('./lib/vectortile.js');
module.exports.VectorTileFeature = require('./lib/vectortilefeature.js');
module.exports.VectorTileLayer = require('./lib/vectortilelayer.js');

},{"./lib/vectortile.js":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/vector-tile/lib/vectortile.js","./lib/vectortilefeature.js":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/vector-tile/lib/vectortilefeature.js","./lib/vectortilelayer.js":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/vector-tile/lib/vectortilelayer.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/vector-tile/lib/vectortile.js":[function(require,module,exports){
'use strict';

var VectorTileLayer = require('./vectortilelayer');

module.exports = VectorTile;

function VectorTile(buffer, end) {

    this.layers = {};
    this._buffer = buffer;

    end = end || buffer.length;

    while (buffer.pos < end) {
        var val = buffer.readVarint(),
            tag = val >> 3;

        if (tag == 3) {
            var layer = this.readLayer();
            if (layer.length) this.layers[layer.name] = layer;
        } else {
            buffer.skip(val);
        }
    }
}

VectorTile.prototype.readLayer = function() {
    var buffer = this._buffer,
        bytes = buffer.readVarint(),
        end = buffer.pos + bytes,
        layer = new VectorTileLayer(buffer, end);

    buffer.pos = end;

    return layer;
};

},{"./vectortilelayer":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/vector-tile/lib/vectortilelayer.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/vector-tile/lib/vectortilefeature.js":[function(require,module,exports){
'use strict';

var Point = require('point-geometry');

module.exports = VectorTileFeature;

function VectorTileFeature(buffer, end, extent, keys, values) {

    this.properties = {};

    // Public
    this.extent = extent;
    this.type = 0;

    // Private
    this._buffer = buffer;
    this._geometry = -1;

    end = end || buffer.length;

    while (buffer.pos < end) {
        var val = buffer.readVarint(),
            tag = val >> 3;

        if (tag == 1) {
            this._id = buffer.readVarint();

        } else if (tag == 2) {
            var tagEnd = buffer.pos + buffer.readVarint();

            while (buffer.pos < tagEnd) {
                var key = keys[buffer.readVarint()];
                var value = values[buffer.readVarint()];
                this.properties[key] = value;
            }

        } else if (tag == 3) {
            this.type = buffer.readVarint();

        } else if (tag == 4) {
            this._geometry = buffer.pos;
            buffer.skip(val);

        } else {
            buffer.skip(val);
        }
    }
}

VectorTileFeature.types = ['Unknown', 'Point', 'LineString', 'Polygon'];

VectorTileFeature.prototype.loadGeometry = function() {
    var buffer = this._buffer;
    buffer.pos = this._geometry;

    var bytes = buffer.readVarint(),
        end = buffer.pos + bytes,
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        lines = [],
        line;

    while (buffer.pos < end) {
        if (!length) {
            var cmd_length = buffer.readVarint();
            cmd = cmd_length & 0x7;
            length = cmd_length >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += buffer.readSVarint();
            y += buffer.readSVarint();

            if (cmd === 1) {
                // moveTo
                if (line) {
                    lines.push(line);
                }
                line = [];
            }

            line.push(new Point(x, y));
        } else if (cmd === 7) {
            // closePolygon
            line.push(line[0].clone());
        } else {
            throw new Error('unknown command ' + cmd);
        }
    }

    if (line) lines.push(line);

    return lines;
};

VectorTileFeature.prototype.bbox = function() {
    var buffer = this._buffer;
    buffer.pos = this._geometry;

    var bytes = buffer.readVarint(),
        end = buffer.pos + bytes,

        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        x1 = Infinity,
        x2 = -Infinity,
        y1 = Infinity,
        y2 = -Infinity;

    while (buffer.pos < end) {
        if (!length) {
            var cmd_length = buffer.readVarint();
            cmd = cmd_length & 0x7;
            length = cmd_length >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += buffer.readSVarint();
            y += buffer.readSVarint();
            if (x < x1) x1 = x;
            if (x > x2) x2 = x;
            if (y < y1) y1 = y;
            if (y > y2) y2 = y;

        } else if (cmd !== 7) {
            throw new Error('unknown command ' + cmd);
        }
    }

    return [x1, y1, x2, y2];
};

},{"point-geometry":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/point-geometry/index.js"}],"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/vector-tile/lib/vectortilelayer.js":[function(require,module,exports){
'use strict';

var VectorTileFeature = require('./vectortilefeature.js');

module.exports = VectorTileLayer;
function VectorTileLayer(buffer, end) {
    // Public
    this.version = 1;
    this.name = null;
    this.extent = 4096;
    this.length = 0;

    // Private
    this._buffer = buffer;
    this._keys = [];
    this._values = [];
    this._features = [];

    var val, tag;

    end = end || buffer.length;

    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        if (tag === 15) {
            this.version = buffer.readVarint();
        } else if (tag === 1) {
            this.name = buffer.readString();
        } else if (tag === 5) {
            this.extent = buffer.readVarint();
        } else if (tag === 2) {
            this.length++;
            this._features.push(buffer.pos);
            buffer.skip(val);

        } else if (tag === 3) {
            this._keys.push(buffer.readString());
        } else if (tag === 4) {
            this._values.push(this.readFeatureValue());
        } else {
            buffer.skip(val);
        }
    }
}

VectorTileLayer.prototype.readFeatureValue = function() {
    var buffer = this._buffer,
        value = null,
        bytes = buffer.readVarint(),
        end = buffer.pos + bytes,
        val, tag;

    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        if (tag == 1) {
            value = buffer.readString();
        } else if (tag == 2) {
            throw new Error('read float');
        } else if (tag == 3) {
            value = buffer.readDouble();
        } else if (tag == 4) {
            value = buffer.readVarint();
        } else if (tag == 5) {
            throw new Error('read uint');
        } else if (tag == 6) {
            value = buffer.readSVarint();
        } else if (tag == 7) {
            value = Boolean(buffer.readVarint());
        } else {
            buffer.skip(val);
        }
    }

    return value;
};

// return feature `i` from this layer as a `VectorTileFeature`
VectorTileLayer.prototype.feature = function(i) {
    if (i < 0 || i >= this._features.length) throw new Error('feature index out of bounds');

    this._buffer.pos = this._features[i];
    var end = this._buffer.readVarint() + this._buffer.pos;

    return new VectorTileFeature(this._buffer, end, this.extent, this._keys, this._values);
};

},{"./vectortilefeature.js":"/home/pnorman/vector_tiles/mapbox-gl-js/node_modules/vector-tile/lib/vectortilefeature.js"}]},{},["/home/pnorman/vector_tiles/mapbox-gl-js/js/mapbox-gl.js"])