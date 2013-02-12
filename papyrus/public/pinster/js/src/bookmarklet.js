(function() {
    var css = [
        'styles/pinster.css'
    ];
    var js = [
        '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js',
        '../../../javascripts/lib/json2-pinster.js',
        '../../../javascripts/lib/underscore.1.4.3.js',
        '../../../javascripts/lib/jquery-ui-1.9.0.custom.js',
        '../../../javascripts/lib/jquery-cookie/jquery.cookie.js',
        '../../../javascripts/markdown-serializer.js',
        '../../../javascripts/lib/markdown-js/lib/markdown.js',
        '../../../javascripts/lib/jquery.ae.image.resize.js',
        '../../../javascripts/lib/canvas-to-blob.js',
        '../../../javascripts/lib/load-image/load-image.min.js',
        '../../../javascripts/lib/html2canvas.js',
        '../../../javascripts/lib/file-upload/js/jquery.iframe-transport.js',
        '../../../javascripts/lib/file-upload/js/jquery.fileupload.js',
        '../../../javascripts/lib/jquery.zrssfeed.js',
        '../../../javascripts/lib/omniture_web_s_code_2012-8-3.js',
        '../../../javascripts/lib/resig-js-classes.js',
        'pinster-lightbox.js',
        'pinster-extractor.js',
        'jquery.pinster.js'
    ];
    var script = document.getElementById('pinster-root'),
        root = script.getAttribute('data-root'),
        version = script ? script.getAttribute('data-version') : -1,
        init = function () {
            var $ = jQuery.noConflict('deep');
            $(document).pinster($.origin(root), root, version);
            return false;
        };

    document.body.style.cursor = 'wait';

    for (var i=0; i<css.length; i++) {
        var link = document.createElement("link");
        link.rel = 'stylesheet';
        link.href = css[i].match(/^(https?:)?\/\//) ? css[i] : root + css[i];
        link.className = 'pinster-resource';
        (document.head||document.body).appendChild(link);
    }

    var load_js = function(js, callback) {
        var script = document.createElement("script");
        script.src = js.match(/^(https?:)?\/\//) ? js : root + js;
        script.async = false; // dynamicly created scripts are async by default in some browsers
        script.className = 'pinster-resource';
        script.onload = callback;
        (document.head||document.body).appendChild(script);
    }

    if ("async" in document.createElement("script"))
        // allows the scripts to load in parallel but run synchronously (running init afterwards)
        for (var i=0; i<js.length; i++)
            load_js(js[i], i == js.length - 1 ? init : null);
    else {
        // chain the js loading to avoid the scripts running in parallel (running init afterwards)
        for (var i= js.length-1, callback=init; i>=0; i--)
            callback = (function (js, callback) { return function() {load_js(js, callback)} })(js[i], callback);
        callback();
    }
})();


// 80x60px GIF image (color black, base64 data):
var b64Data = 'R0lGODdhUAA8AIABAAAAAP///ywAAAAAUAA8AAACS4SPqcvtD6' +
        'OctNqLs968+w+G4kiW5omm6sq27gvH8kzX9o3n+s73/g8MCofE' +
        'ovGITCqXzKbzCY1Kp9Sq9YrNarfcrvcLDovH5PKsAAA7',
    imageUrl = 'data:image/gif;base64,' + b64Data,
    blob = window.dataURLtoBlob && window.dataURLtoBlob(imageUrl);
