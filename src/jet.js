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


// Summary:
//		The core functionality of Jet.js
var Jet = this.Jet = this.Jet ? this.Jet : {};

// Summary:
//		If true, jet will log messages to the console to tell you 
//		exactly what it's doing and when it's doing it.
jet.debug = true;

// summary:
//		The path to where all JavaScript files should be loaded 
//		from. This is overwritten by {{{jet.findBasePath}}}.
jet.basePath = '';

// summary:
//		A reference to the global scope of Jet.js.
jet.global = this;


// summary:
//		Calculates the current path of Jet, in order to work out 
//		where to load all other files from.
//	tags:
//		private
jet._findBasePath = (function(){
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


// TODO:

jet.getObjectByName = function(namespace){
	
};

jet.provide = function(namespace){
	
};

jet.require = function(namespace){
	
};

jet.declare = function(namespace, dependencies, methods){
	
};
