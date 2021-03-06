/* 
capture.js - phantomjs script for capturing a webpage screenshot
(c) 2016 Rolando Islas - https://www.rolandoislas.com

This file is part of StreamSite.

StreamSite is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

StreamSite is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with StreamSite.  If not, see <http://www.gnu.org/licenses/>.
*/

var system = require("system");
var args = system.args;

phantom.onError = function(msg, trace) {
	console.log(msg);
};

if (args.length < 9) {
	console.log("usage: phantomjs capture.js <url> <delay> <width> <height>" + 
		" <bool verbose> <bool reload> <picture format> <background color> <parent pid>");
	phantom.exit();
}

var url = args[1];
var delay = args[2];
var width = args[3];
var height = args[4];
var verbose = args[5] == "true";
var reload = args[6] == "true";
var format = args[7];
var background = args[8];
var pid = args[9];

var page = require("webpage").create();
page.onError = function(msg, trace) {
	console.log(msg);
};
page.onConsoleMessage = function(msg, lineNum, sourceId) {
	if (verbose)
		console.log("Console: " + msg);
};
page.onResourceError = function(resourceError) {
	console.log("Failed to load resource: " + resourceError.url);
	console.log(resourceError.errorCode + ": " + resourceError.errorString);
};
page.onResourceTimeout = function(request) {
	console.log("Request timeout: " + request.url);
};
page.viewportSize = {width: width, height: height};
page.clipRect = {top: 0, left: 0, width: width, height: height};
page.onLoadFinished = function(status) {
	if (status !== "success") {
        setTimeout(function () {
            console.log("Reloading");
            page.open(url);
        }, 10000);
        console.log("Attempting to reload in 10 seconds");
	}
	else if (reload) {
		renderPage(page);
		setTimeout(page.reload, delay * 1000);
	}
	else {
		setInterval(function() {
				renderPage(page);
			}, delay * 1000);
	}
};

page.open(url);

function renderPage(page) {
	if (verbose)
		console.log("Page Rendered " + new Date().toLocaleTimeString());
    page.evaluate(function(background) {
        document.body.bgColor = background;
    }, background);
	page.render("screenshot." + pid + "." + format);
}

