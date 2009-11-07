prefix = ./dist

all: jet

clean:
	@@echo "Removing Jet.js from:" ${prefix}
	@@rm -f ${prefix}/jet.js ${prefix}/jet.min.js
	@@echo "Done."
	
jet:
	@@echo "Building" ${prefix}/jet.js
	@@mkdir -p ${prefix}
	
	@@cat src/jet.js > "${prefix}/jet.js"
	@@echo
	@@echo "Jet build complete."
	
min: jet
	@@java -jar ./build/shrinksafe.jar ${prefix}/jet.js > ${prefix}/jet.min.js
