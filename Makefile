prefix = ./dist

all: jet

clean:
	@@echo "Removing Jet.js from:" ${prefix}
	@@rm -f ${prefix}/Jet.js ${prefix}/Jet.min.js
	@@echo "Done."
	
jet:
	@@echo "Building" ${prefix}/Jet.js
	@@mkdir -p ${prefix}
	
	@@cat src/_intro.js \
	      src/Base.js \
          src/_outro.js > "${prefix}/Jet.js"
	@@echo
	@@echo "Jet build complete."
	
min: jet
	@@java -jar ./build/shrinksafe.jar ${prefix}/Jet.js > ${prefix}/Jet.min.js
	@@rm ${prefix}/Jet.js
