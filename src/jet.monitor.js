jet.monitor = function(/*String*/ ns){
	// summary:
	//		Prints a rough idea of what data is passing through functions into the console.
	// tags:
	//		alpha/unstable
	// example:
	//		function test(){/* do cool stuff.. */};
	//		test = jet.monitor("test");
	//
	//		jet.test("test", ["a", jet], null, 0, false);
	//		#=> jet.test(test, a,[object Object], , 0, false)
	//
	var parts = ns.split("."),
	    m = parts.pop();
	fn = jet.namespace(parts.join("."))[m];
	return function(){
		console.log(ns+"("+Array.prototype.join.call(arguments, ", ")+")");
		return fn.apply(jet.global, arguments || []);
	};
};
