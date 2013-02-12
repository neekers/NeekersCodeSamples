StylesInlinerTest = TestCase("StylesInlinerTest");

StylesInlinerTest.prototype.setUp = function() {

    var head = document.getElementsByTagName('head')[0];
    // create a new div and store it in objects variable
    this.mainDiv = document.createElement('div');
    this.mainDiv.id = 'main';

    // create inner div
    var innerDiv = document.createElement('div');
    innerDiv.id = 'sub';
    innerDiv.className = 'pinster-text';
    innerDiv.innerHTML = "Hello word.";
    this.mainDiv.appendChild(innerDiv);
    // create another inner div
    var innerDiv2 = document.createElement('div');
    innerDiv2.id = 'sub2';
    innerDiv2.className = 'pinster-error-text';
    this.mainDiv.appendChild(innerDiv2);

    // add whole thing to document body
    document.body.appendChild(this.mainDiv);

    var styleNode = document.createElement('script');
    styleNode.type = "text/css";
    var styleText = document.createTextNode('pinster-text { color: rgb(200, 200, 200); font-size: 90%; }');
    styleNode.appendChild(styleText);
    head.appendChild(styleNode);
    
    var styleNode = document.createElement('script');
    styleNode.type = "text/css";
    var styleText = document.createTextNode('pinster-error-text { color: rgb(255, 0, 0); font-size: 200%; }');
    styleNode.appendChild(styleText);
    head.appendChild(styleNode);

};

StylesInlinerTest.prototype.tearDown = function() {
    // clean up document
    var mainDiv = document.getElementById('main');
    document.body.removeChild(mainDiv);
    // var head = document.getElementsByTagName('head')[0];
};

StylesInlinerTest.prototype.testThatSetupCreatesOurHtml = function() {
    var mainDiv = document.getElementById('main');
    var child = mainDiv.childNodes[0];

    // stored object is the same as the one found in the document
    assertEquals(this.mainDiv, mainDiv);
    assertEquals("pinster-text", child.className);
    assertEquals("Hello word.", child.innerHTML);

    // var inliner = new myapp.StylesInliner();
};

StylesInlinerTest.prototype.testGetsPageStyleFromElement = function() {

    jstestdriver.console.log("style for text: " + $("#main").css("color"));

    assertEquals($("#main").css("color"), "rgb(0, 0, 0)");

    jstestdriver.console.log("style for text: " + $("#sub").html());

    newDiv = document.createElement('div');
    newDiv.id = 'copy';
    newDiv.innerHTML = "New thang";

    // document.body.appendChild(newDiv);
    this.mainDiv.appendChild(newDiv);
    $("#sub").css("color", "red");

    assertEquals($("#sub").css("color"), "rgb(255, 0, 0)");

    $("#copy").copyCSS("#sub");

    assertEquals($("#copy").css("color"), $("#sub").css("color"));

    jstestdriver.console.log("copy color: " + $("#copy").css("color"));

};

StylesInlinerTest.prototype.testCanInlineAllStyles = function() {
	
    assertEquals($("#sub").attr("style"), null);
    assertEquals($("#sub2").attr("style"), null);
    assertEquals($("#sub").attr("class")!=null, true);
    assertEquals($("#sub2").attr("class")!=null, true);

    jstestdriver.console.log("before: " + $(this.mainDiv).html());
    $("*").inlineAllStyles();
    jstestdriver.console.log("after inlining: " + $(this.mainDiv).html());
    jstestdriver.console.log("after inlining: " + $("#sub2").html());
    
    assertEquals($("#sub").attr("class"), null);
    assertEquals($("#sub2").attr("class"), null);
    
    assertEquals($("#sub").attr("style")!=null, true);
    assertEquals($("#sub2").attr("style")!=null, true);
};

StylesInlinerTest.prototype.testGetAllInlineAllStyles = function() {
	
	var styles = $("*").getAllInlineStyles();
	
	jstestdriver.console.log("styles: " + styles.toString());
	jstestdriver.console.log("results[pinster-text]: " + styles["pinster-text"]);
	jstestdriver.console.log("results[pinster-error-text]: " + styles["pinster-error-text"]);
	

};