#!/bin/bash

tmp=`readlink -f "$0"`
dir=`dirname $tmp`
source_dir="${dir}/src"
# target_dir="${dir}/build"
target_dir="/tmp/build"
extra_dir="/home/gheja/works/extra"
final_dir="${dir}"
min_dir="${dir}/tmp/min"

if [ -e "$target_dir" ]; then
	rm -r "$target_dir"
fi

mkdir "$target_dir"

cd "$target_dir"


### stage1 - compilation of typescript to javascript, minimization of javascript and css files

mkdir stage1
cd stage1

now=`date +%Y%m%d_%H%M%S`

rsync -xa --exclude '*.js' --exclude '*.js.map' --exclude '*.zip' "${source_dir}/" ./

zip -r9 ${now}_original.zip .

if [ -d "${extra_dir}" ]; then
	rsync -xa "${extra_dir}/" ./
fi

if [ ! -d ./node_modules/google-closure-compiler ]; then
	npm install typescript-closure-compiler
fi

if [ ! -d ./node_modules/typescript-closure-compiler ]; then
	npm install google-closure-compiler
fi

export PATH="${target_dir}/stage1/node_modules/.bin:${PATH}"

javascript_files=`cat index.html | grep -E '<script.* src="([^"]+)"' | grep -Eo 'src=\".*\"' | cut -d \" -f 2`
typescript_files=`echo "$javascript_files" | sed -r 's/\.js$/.ts/g'`
css_files=`cat index.html | grep -E '<link type="text/css" rel="stylesheet" href="([^"]+)"' | grep -Eo 'href=\".*\"' | cut -d \" -f 2`

# cat ./src/$i | sed -e '/DEBUG BEGIN/,/\DEBUG END/{d}' | grep -vE '^\"use strict\";$' >> ./build/stage1/merged.js

tscc $typescript_files || exit 1

google-closure-compiler \
	--compilation_level ADVANCED \
	--warning_level VERBOSE \
	--language_in ECMASCRIPT_2018 \
	--language_out ECMASCRIPT_2018 \
	--formatting PRETTY_PRINT \
	--formatting SINGLE_QUOTES \
	--js_output_file min_pretty.js \
	$javascript_files || exit 1

google-closure-compiler \
	--compilation_level WHITESPACE \
	--language_in ECMASCRIPT_2018 \
	--language_out ECMASCRIPT_2018 \
	--formatting SINGLE_QUOTES \
	--js_output_file min.js \
	min_pretty.js || exit 1

cat $css_files | \
	sed -r 's/^\s+//g' | \
	sed -r 's/\s+$//g' | \
	tr -d '\r\n' | \
	sed -r 's/}/}\n/g' \
	> min.css

cd ..


### stage2 - compiling the final html and creating zip files

mkdir stage2
cd stage2

cp ../stage1/min.css ../stage1/min.js ../stage1/index.min.html ../stage1/gui/twemoji.ttf ./

cat index.min.html | sed \
	-e '/<!-- insert minified javascript here -->/{' \
	-e 'i <script>' \
	-e 'r min.js' \
	-e 'a </script><script src="/socket.io/socket.io.js"></script>' \
	-e 'd}' \
	-e '/<!-- insert minified css here -->/{' \
	-e 'i <style>' \
	-e 'r min.css' \
	-e 'a </style>' \
	-e 'd}' \
	> index.html

zip -9 ${now}.zip index.html
zip -9 ${now}_twemoji.zip index.html twemoji.ttf

cd ..


### final steps

cp stage1/*.zip ./
cp stage2/*.zip ./

ls -alb stage2/ *.zip

cp *.zip ${final_dir}/

if [ -e "${min_dir}" ]; then
	rm -r ${min_dir}
fi

mkdir -p "${min_dir}"

cd ${min_dir}

cp ${final_dir}/${now}_twemoji.zip ./
unzip ${now}_twemoji.zip

