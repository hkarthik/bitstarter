#!/usr/bin/env node

var fs = require("fs");
var program = require("commander");
var cheerio = require("cheerio");
var rest = require("restler");

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
  var instr = infile.toString();
  if(!fs.existsSync(instr)) {
    console.log("%s does not exist. Exiting.", instr);
    process.exit(1);
  }
  return instr;
};

var cheerioHtmlFile = function(htmlFile) {
  return cheerio.load(fs.readFileSync(htmlFile));
};

var loadChecks = function(checksFile) {
  return JSON.parse(fs.readFileSync(checksFile));
};

var checkHtmlUrl = function(url, checksFile) {
  rest.get(url).on('complete', function(data) {
    $ = cheerio.load(data);
    var checkJson = checkHtml($, checksFile);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
  });
};

var checkHtmlFile = function(htmlFile, checksFile) {
  $ = cheerioHtmlFile(htmlFile);
  return checkHtml($,checksFile);
};

var checkHtml = function($, checksFile) {
  var checks = loadChecks(checksFile).sort();
  var out = {};
  for (var ii in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
};

var clone = function(fn) {
  return fn.bind({});
};

if(require.main == module) {
  program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url>', 'Path to url')
    .parse(process.argv);

  if(program.url !== null && program.url.length > 0) {
    checkHtmlUrl(program.url, program.checks);
  } else {
    checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
  }
} else {
  exports.checkHtmlFile = checkHtmlFile;
}
