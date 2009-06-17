PREFIX = .
DIST_DIR = ${PREFIX}/dist

all: jet

clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}
	@@echo "Done."
	
jet:
	@@echo "Building" ${DIST_DIR}/Jet.js
	@@mkdir -p ${DIST_DIR}
	
	@@cat src/Jet._intro.js\
	      src/Jet._base.js\
          src/Jet.Lang.js\
          src/Jet.Event.js\
          src/Jet.Console.js\
          src/Jet._outro.js > "${DIST_DIR}/Jet.js"
	@@echo
	@@echo "Jet build complete."
