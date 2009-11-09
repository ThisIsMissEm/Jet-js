//
// Jet.js is available under *either* the terms of the 
// modified BSD license *or* the Academic Free License 
// version 3.0. 
//
// As a recipient of Jet.js, you may choose which license 
// to receive this code under. No external contributions 
// are allowed under licenses which are fundamentally 
// incompatible with the AFL or BSD licenses that Jet.js 
// is distributed under.
// 
// The text of these licenses can be found in license.html
// or LICENSE.

// Clear IP Assignment, all code held by BrandedCode <http://brandedcode.com>, 
// all contributors need to sign the Dojo Foundation CLA <http://www.dojofoundation.org/about/cla/>.


// Initial declaration.
var undefined = undefined;
var jet = this.jet = this.jet ? this.jet : {};

// Summary:
//		If true, jet will log messages to the console to tell you 
//		exactly what it's doing and when it's doing it.
jet.debug = true;

// summary:
//		A reference to the global scope of Jet.js.
jet.global = this;

// summary:
//		The path to where all JavaScript files should be loaded 
//		from. This is overwritten by {{{jet.findBasePath}}}.
jet.basePath = '';

//==============================================================================
// Development Utilities:
//==============================================================================

jet.experimental = function(namespace, extra){
	// summary: 
	//		Marks code as experimental. (Stolen from Dojo Toolkit.)
	// description: 
	//		This can be used to mark a function, file, or module as
	//		experimental.  Experimental code is not ready to be used, and the
	//		APIs are subject to change without notice.  Experimental code may be
	//		completed deleted without going through the normal deprecation
	//		process.
	// namespace: 
	//		The name of a module, or the name of a module file or a specific
	//		function
	// example:
	//	|	jet.experimental("dojo.data.Result");
	// example:
	//	|	jet.experimental("dojo.weather.toKelvin()", "PENDING approval from NOAA");
	if(window["console"] && window.console["warn"] && jet.debug){
		console.warn("EXPERIMENTAL: " + namespace + " -- APIs subject to change without notice. "+(extra ? extra : ""));
	}
}

jet.incomplete = function(namespace, extra){
	// summary:
	//		Marks code as incomplete, in a similar fashion to jet.experimental();
	// description:
	//		See jet.experimental for details.
	if(window["console"] && window.console["warn"] && jet.debug){
		console.warn("INCOMPLETE: " + namespace + " -- This functionality is not yet complete, and may change without notice. "+(extra ? extra : ""));
	}
}


jet.mixin = function(/*Object*/ target, /*Object*/ source){
	var tobj = {};
	for(var x in source){
		if(tobj[x] === undefined || tobj[x] != source[x]){
			target[x] = source[x];
		}
	}
	return target;
}


//==============================================================================
// The Loader
//==============================================================================

jet._provided = [];

jet._findBasePath = (function(){
	// summary:
	//		Calculates the current path of Jet, in order to work out 
	//		where to load all other files from.
	//	tags:
	//		private
	
	if(!jet.basePath || jet.basePath == ""){
		var doc = jet.global.document,
			 result = doc.location.href;
		if(doc && doc.getElementsByTagName){
			var scripts = doc.getElementsByTagName("script");
			
			for (var script, i = 0, src, match; script = scripts[i]; i++) {
				src = script.getAttribute('src');
				if(!src || !(src.length > 0)){
					continue;
				}

				if(match = src.match(/jet(?:\.min)?\.js/i)){
					result = src.substr(0, match.index);
					break;
				}
			}
		}
		jet.basePath = result;
	}
})();

jet._findPath = function(/*String*/ namespace){
	
	
};

jet.namespace = function(/*String*/ namespace, /*Object?*/ properties){
	// summary:
	//		Creates & Resolves an objects structure based on the given Namespace string.
	// namespace:
	//		A string representing an object tree, each level separated by a period.
	// example:
	//	|	jet.namespace("a.b.c");
	//	|	#=> a = {}; a.b={}; a.b.c={};
	// example:
	//	|	jet.namespace("a.b").c = function(){};
	// example:
	// |	jet.namespace("a.b.c", function(){});
	var current = jet.global;		 
	for(var node, parts = namespace.split('.'); parts.length && (node = parts.shift());){
/*		if(properties && parts.length == 0){
			if(Object.prototype.toString.call(properties) === '[object Function]'){
				current = (current[node] = properties);
			} else {
				current = (current[node] = jet.mixin(current[node] || {}, properties) || {});
			}
		} else {*/
			current = (current[node] = (current[node] === undefined) ? {} : current[node]);
		/*}*/
	}
	
	return current;
};

jet.provide = function(namespace){
	// summary: 
	//		A basic way to tell Jet what code exists within a file.
	// tags:
	//		incomplete
	jet.incomplete("jet.provide");
	
	jet.namespace(namespace);
	jet._provided.push(namespace);
};


jet.require = function(namespace){
	jet.incomplete("jet.require");
	console.log("Should load: "+namespace);
};



jet.declare = function(namespace, dependencies, methods){
	jet.experimental("jet.declare");
	
	for(var dep; dependencies.length && (dep = dependencies.shift());){
		jet.require(dep);
	}

	var parts = namespace.split("."),
	    m = parts.pop();
	    
	jet.namespace(parts.join("."))[m] = methods;
};




//==============================================================================
// Awesome Team Interoperability.
//==============================================================================

jet.map = function(/*String*/ target, /*String|Object*/source){
	//	summary:
	//		Creates and links source on to target, when target is called, 
	//		the function passes the infomation on to the source function or object.
	//	target:
	//		The path of the object tree to which we want to map `source` to.
	//	source:
	//		The data that should be present at target, this can be either a 
	//		function, object, or string. If it is a string, it shall be treated 
	//		as if it is a namespace, and be followed appropriately.
	//	example:
	//	|	jet.require("dojo");
	//	|	jet.map("goog.dom.query", "dojo.query");
	//	|	// can now use goog.dom.query as if we had loaded it up using jet.require('goog.dom');
	jet.experimental("jet.map");
	
	var current = jet.global,
		 source = (typeof source == "string" ? jet.namespace(source) : source);

	for(var node, parts = target.split('.'); parts.length && (node = parts.shift());){
		if(parts.length == 0){
			current = (current[node] = source);
		} else {
			current = (current[node] = (current[node] === undefined) ? {} : current[node]);
		}
	}
};
