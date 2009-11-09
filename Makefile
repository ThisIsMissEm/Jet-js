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
	@@java -jar ./tools/shrinksafe.jar ${prefix}/jet.js > ${prefix}/jet.min.js
	@@rm ${prefix}/jet.js
	@@mv ${prefix}/jet.min.js ${prefix}/jet.js
