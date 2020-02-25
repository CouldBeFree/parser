const parser = require('fast-xml-parser');
const he = require('he');
const fs = require('fs');
const sass = require('node-sass');

// Connection to db
require('./database/connection/connection');
const Skins = require('./models/skins');

const options = {
  attributeNamePrefix : "@_",
  attrNodeName: "attr", //default is 'false'
  textNodeName : "#text",
  ignoreAttributes : true,
  ignoreNameSpace : false,
  allowBooleanAttributes : false,
  parseNodeValue : true,
  parseAttributeValue : false,
  trimValues: true,
  cdataTagName: "__cdata", //default is 'false'
  cdataPositionChar: "\\c",
  parseTrueNumberOnly: false,
  arrayMode: false, //"strict"
  attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
  tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a
  stopNodes: ["parse-me-as-string"]
};

// Parse xml
const xmlData = fs.readFileSync('./public/xmlexport.xml', {encoding: 'utf-8'});
const stylesObject = {};
let sassCode = '';

// Create object and sass string with parsed styles
try{
  const jsonObj = parser.parse(xmlData, options, true);
  const styles = jsonObj.content.customer;

  const { background, text, cardbg, cardtext, buttonbg, buttontext, topictext } = styles;
  stylesObject.background = background;
  stylesObject.text = text;
  stylesObject.cardbg = cardbg;
  stylesObject.cardtext = cardtext;
  stylesObject.buttonbg = buttonbg;
  stylesObject.buttontext = buttontext;
  stylesObject.topictext = topictext;

  if(background) {
    sassCode = `${sassCode} $body-bg: ${background};`
  }
  if(text) {
    sassCode = `${sassCode} $text-color: ${text};`
  }
  if(cardbg) {

  }
  if(cardtext) {
    //sassCode = `${sassCode} $card-text: ${cardtext};`
  }
  if(buttonbg) {
    sassCode = `${sassCode} $btn-default-bg: ${buttonbg};`;
    sassCode = `${sassCode} $well-bg: ${cardbg};`;
    sassCode = `${sassCode} $panel-bg: ${cardbg};`;
    sassCode = `${sassCode} $brand-primary: ${buttonbg};`;
    sassCode = `${sassCode} $navbar-default-bg: ${buttonbg};`;
  }
  if(buttontext) {
    sassCode = `${sassCode} $btn-default-color: ${buttontext};`
  }
  if(topictext) {
    //sassCode = `${sassCode} $topic-text: ${topictext};`
  }
  sassCode += `:root {
  --navbar-color: ${buttonbg};
  --hover-color: ${buttonbg};
  --btn-color: ${buttonbg};
}`;
  console.log(sassCode);
} catch(error){
  console.log(error.message);
}

// Create variables.scss
fs.readFile('./scss/variables-template.scss', (err, data) => {
  if(err) throw err;

  let file = data.toString();
  file = `${sassCode} ${file}`;

  fs.writeFileSync('./scss/variables.scss', file, (err) => {
    if(err) return console.log(err);
  });
});

// Compile styles
sass.render({
  file: './scss/style.scss',
  outFile: './css/index.css',
  sourceMap: true,
  includePaths: [ 'lib/', 'mod/', 'css/', 'scss/' ],
  omitSourceMapUrl: true
  //outputStyle: 'compressed'
}, function(error, result) { // node-style callback from v3.0.0 onwards
  if (error) {
    console.log(error.status); // used to be "code" in v2x and below
    console.log(error.column);
    console.log(error.message);
    console.log(error.line);
  }
  else {
    fs.writeFileSync('./css/output.css', result.css.toString());
  }
});

// Write styles to db
fs.readFile('./css/output.css', (err, data) => {
  if(err) throw err;

  const file = data.toString();

  Skins.findOne({
    where: {
      title: 'simple_forklift_de'
    }
  })
    .then(skin => {
      skin.variables = stylesObject;
      skin.style = file;
      skin.save();
    })
    .then(() => console.log('Done'))
    .catch(e => console.log(e));
});
