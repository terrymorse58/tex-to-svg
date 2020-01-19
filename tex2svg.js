#! /usr/bin/env node

/**
 * tex2svg - convert a TeX file to SVG
 *
 * Usage: node tex2svg <path>
 *
 *   where:
 *
 *   <path> = path of TeX file
 *
 * Will create SVG file in same directory as TeX file
 */

var mjAPI = require('mathjax-node-sre');
const fs = require('fs');

const options = {
  inline: {
    boolean: true,
    describe: 'process as in-line TeX'
  },
  speech: {
    boolean: true,
    default: true,
    describe: 'include speech text'
  },
  linebreaks: {
    boolean: true,
    describe: 'perform automatic line-breaking'
  },
  font: {
    default: 'TeX',
    describe: 'web font to use'
  },
  ex: {
    default: 6,
    describe: 'ex-size in pixels'
  },
  width: {
    default: 100,
    describe: 'width of container in ex'
  },
  extensions: {
    default: '',
    describe: 'extra MathJax extensions e.g. \'Safe,TeX/noUndefined\''
  }
};

mjAPI.config({
  MathJax: { SVG: { font: options.font.default } },
  extensions: options.extensions.default
});

// get name of TeX file from command line argument
const texFilename = process.argv[2];
const nameOnly = texFilename.substring(0, texFilename.lastIndexOf('.'));
const svgFilename = nameOnly + '.svg';
console.log(`Converting ${texFilename} -> ${svgFilename} ...`);

fs.readFile(texFilename, 'utf8', (err, data) => {
  let math = data;
  if (err) {
    console.log(`ERROR reading ${texFilename}`,err);
    return;
  }

  mjAPI.typeset({
    math: math,  // string containing TeX
    format: (options.inline.default ? 'inline-TeX' : 'TeX'),
    svg: true,
    speakText: options.speech.default,
    ex: options.ex.default,
    width: options.width.default,
    linebreaks: options.linebreaks.default
  }, function (data) {
    if (!data.errors) {
      fs.writeFile(svgFilename, data.svg, (err) => {
        if (!err) {
          console.log(`Wrote ${data.svg.length} bytes to ${svgFilename}`);
        } else {
          console.log('fsWriteFile err:', err);
        }
      });
    } else {
      console.log('Conversion errors: ', JSON.stringify(data.errors, null, 2));
    }
  });
});