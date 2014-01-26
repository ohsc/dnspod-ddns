lint:
	find . -name '*.js' -not -regex './node_modules.*' -print0 | xargs -0 ./node_modules/.bin/jslint --sloppy --stupid --node --color --git
