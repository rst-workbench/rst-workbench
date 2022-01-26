const confPath = 'docker-compose.yml';
const setupType = 'local'; // options: 'local' or 'server'
const hostName = 'localhost';

const IN_PROGRESS_SYMBOL = '<div class="lds-hourglass"></div>';
const DONE_SYMBOL = '✅';
const ERROR_SYMBOL = '💥';


/* This would be the "main" function in a sane programming language.
 * 
   Here, this code is triggered when the rst-workbench website is fully loaded.
   It creates an RSTWorkbench instance and calls its getParseImages
   method on the content of the RST form whenever the submit button is pressed. */
window.addEventListener("load", async () => {
  // access the form element ...
  let rstForm = document.getElementById("rst");

  // make the workbench instance globally available
  window.rstworkbench = await RSTWorkbench.fromConfigFile();

  // ...and take over its submit event.
  rstForm.addEventListener("submit", async (event) => {
    event.preventDefault();

	// delete the contents of the results / errors section
	// in case we want to use the parsers more than once
	document.getElementById("progress").textContent = "";
	document.getElementById("results").textContent = "";
	document.getElementById("errors").textContent = "";
	// Ensure the results / errors section is invisible.
	// They will be made visible when the sections are filled later on.
	ensureElementInvisible("progress_section");
	ensureElementInvisible("results_section");
	ensureElementInvisible("errors_section");

    // parse the form content and display the results.
    let sourceText = rstForm["input-text"].value;
    let sourceLangElem = rstForm["source-lang"];
    if (sourceLangElem === undefined) {
		// assume source language is English
		window.rstworkbench.getParseImages(sourceText);
	} else {
		let sourceLang = sourceLangElem.value;
		if (sourceLang === 'EN') {
			window.rstworkbench.getParseImages(sourceText);
		} else { // source is not English -> translate to English, then run RST parsers
			try {
				const translatorName = `DeepL-translate-${sourceLang}-EN`;
				updateProgress(translatorName, IN_PROGRESS_SYMBOL);
				let englishText = await translate(sourceText, sourceLang, 'EN');
				updateProgress(translatorName, `<a href="#results-${translatorName}">${DONE_SYMBOL}</a>`);
				window.rstworkbench.getParseImages(englishText);
			} catch (err) {
				addToErrors(translatorName, err);
				updateProgress(translatorName, `<a href="#errors-${translatorName}">${ERROR_SYMBOL}</a>`);
			}
		}
		
	}
  });
});


/* RSTWorkbench makes different RST parsers and converters accessible via
   a common interface.

   To create an RSTWorkbench instance:
     let wb = await RSTWorkbench.fromConfigFile(); */
class RSTWorkbench {
    /* configObject: docker-compose file parsed into an Object
       rstParsers: Array of {name: string, format: string, port: number}} */
    constructor(configObject, rstParsers) {
        this.config = configObject
        this.rstParsers = rstParsers
        this.rstConverter = RSTConverter.fromConfigObject(configObject)
        this.rstWeb = RSTWeb.fromConfigObject(configObject)

        this.parseResults = null
    }

    /* fromConfigFile creates a Promise(RSTWorkbench) from a
       docker-compose config file. */
    static async fromConfigFile(filepath = confPath) {
        const config = await this.loadConfig(filepath);
        const rstParsers = this.getRSTParsers(config);
        return new RSTWorkbench(config, rstParsers);
    }

    /* loadConfig loads a YAML config file from the given path and returns
       a Promise(Object) representing the config file. */
    static async loadConfig(filepath) {
        const res = await fetch(filepath);
        const text = await res.text();
        return jsyaml.safeLoad(text);
    }

    /* getRSTParsers returns the metadata of all RST parsers from the object
       representation of a docker-compose.yml file. */
    static getRSTParsers(yamlObject) {
        let parsers = [];
        for (let serviceKey of Object.keys(yamlObject.services)) {
            const service = yamlObject.services[serviceKey];
            const serviceLabel = service.labels;
            if (serviceLabel.type === 'rst-parser' ) {
                const parser = new RSTParser(
                    serviceLabel.name,
                    serviceLabel.format,
                    getPort(service));
                parsers.push(parser);
            }
        }
        return parsers;
    }

    /* getParseResults retrieves parses from all configured RST parsers for
       the given text and adds them to the "Results" section of the page. */
    async getParseResults(text) {
        this.rstParsers.forEach(async (parser) => {
            parser.parse(text)
                .then(output => addToResults(parser.name, output, `${parser.name}-parser-output`))
                .catch(e => addToErrors(parser.name, e))
        });
    }

    /* getParseImages parses the given text with all configured parsers, converts
       the results into images and adds those to the "Results" section of the page.
       
       This is the 'entry' function that gets called when the "Run RST parser"
       button is pressed. */
    async getParseImages(text) {
		// make "progress bar" visible
		ensureElementVisible("progress_section");

        this.rstParsers.forEach(async (parser) => this.parseTextToImage(parser, text));
    }

    /* parseTextToImage parses the given text with the given parser, converts
       it to an image (via .rs3) and adds it to the "Results" section of the page. */
    async parseTextToImage(parser, text) {
        let parseOutput;
        try {
			updateProgress(`${parser.name}`, `${IN_PROGRESS_SYMBOL}`);

            parseOutput = await parser.parse(text);
            let parseOutputElemID = `${parser.name}-parser-output`;
            let showhideButtonStr = `<button class="btn btn-primary" onclick="showhide('${parseOutputElemID}')">Show/Hide original parser output</button>`
            let showhideButton = stringToElement(showhideButtonStr);
            addToResults(parser.name, parseOutput, parseOutputElemID);
            
            showhide(parseOutputElemID); // hide original parser output by default
            addToButtonRow(parser.name, showhideButton);

        } catch (err) {
            addToErrors(parser.name, err);
            updateProgress(`${parser.name}`, `<a href="#errors-${parser.name}">${ERROR_SYMBOL}</a>`);
            return;
        }

        let rs3Output;
        try {
            rs3Output = await this.rstConverter.convert(parseOutput, parser.format, 'rs3');
            addRS3DownloadButton(parser.name, rs3Output);
            addRSTWebEditButton(parser.name, rs3Output);
        } catch (err) {
			const errorId = `rst-converter-service for ${parser.name}`;
            addToErrors(errorId, err);
            updateProgress(`${parser.name}`, `<a href="#errors-${errorId}">${ERROR_SYMBOL}</a>`);
            return;
        }

        /* convert .rs3 to an SVG image and add it to the output
         * and add it to the output (as an base64 image embedded in the HTML) */
        let svgOutput;
        try {
            svgOutput = await this.rstConverter.convert(rs3Output, 'rs3', 'svgtree-base64');
            addSVGtoResults(parser.name, svgOutput);

            // separate output of different parsers
            const hrElem = document.createElement('hr');
            addToSection('results', parser.name, hrElem, 'rs3-image');

            updateProgress(`${parser.name}`, `<a href="#results-${parser.name}">${DONE_SYMBOL}</a>`);

        } catch (err) {
			const errorId = `rst-converter-service for ${parser.name} (rs3 to SVG)`; 
            addToErrors(errorId, err);
            updateProgress(`${parser.name}`, `<a href="#errors-${errorId}">${ERROR_SYMBOL}</a>`);
            return;
        }
    }
}


/* addRS3DownloadButton adds an RS3 download button to the results section of the
   given parser. */
function addRS3DownloadButton(parserName, rs3String) {
    let rs3DownloadButtonString = `<form onsubmit="return download('${parserName}-result.rs3', this['text'].value)">
        <textarea name="text" style='display:none;'>${rs3String}</textarea>
        <input class="btn btn-primary" type="submit" value="Download as .rs3 file">
    </form>`;
    let rs3DownloadButton = stringToElement(rs3DownloadButtonString);
    addToButtonRow(parserName, rs3DownloadButton);
}

/* addRSTWebEditButton adds a button to the results section of the
   given parser that will load the given .rs3 into rstWeb for further editing. */
function addRSTWebEditButton(parserName, rs3String) {
    let actionUrl;
    if (this.setup == 'server') {
        actionUrl = `http://${hostName}/rstweb/api/convert?input_format=rs3&output_format=editor`;
    } else {
        actionUrl = `http://${hostName}:${window.rstworkbench.rstWeb.port}/api/convert?input_format=rs3&output_format=editor`;
    }
    
    let rs3EditButtonString = `<form action="${actionUrl}" id="open_${parserName}_in_rstweb" method="post" target="_blank">
    <textarea class="text" name="input_file" form="open_${parserName}_in_rstweb" style='display:none;'>${rs3String}</textarea>
    <input type="submit" class="btn btn-primary submitButton" value="Edit in rstWeb">
    </form>`;

    let rs3EditButton = stringToElement(rs3EditButtonString);
    addToButtonRow(parserName, rs3EditButton);
}


/* RSTConverter defines a REST API for the rst-converter-service,
   which converts RST trees between a variety of formats. */
class RSTConverter {
    constructor(port, name = 'rst-converter', setup = setupType) {
        this.port = port;
        this.name = name;
        this.setup = setup;
    }

    // fromConfigObject creates an RSTConverter instance from a configuration object.
    static fromConfigObject(config) {
        let service = config.services["rst-converter-service"];
        let port = getPort(service);
        return new RSTConverter(port, name = service.labels.name);
    }

    /* convert converts the string representation of an RST tree from the given
       input format into the given output format. */
    async convert(document, inputFormat, outputFormat) {
        const data = new FormData();
        data.append('input', document);

        const options = {
          method: 'POST',
          body: data,
        };

        let convertUrl;
        if (this.setup == 'server') {
            convertUrl = `https://${hostName}/${this.name}/convert/${inputFormat}/${outputFormat}`;
        } else {
            convertUrl = `http://${hostName}:${this.port}/convert/${inputFormat}/${outputFormat}`;
        }

        let response = await fetch(convertUrl, options);
        let output = await response.text();
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}\n${output}`);
        }

        return output;
    }
}


// RSTWeb defines a client for the REST API of the rstWeb annotation tool.
class RSTWeb {
    constructor(port, name = 'rstweb', setup = setupType) {
        this.port = port;
        this.name = name;
        this.setup = setup;
    }

    // fromConfigObject creates an RSTWeb instance from a configuration object.
    static fromConfigObject(config) {
        let service = config.services["rstweb-service"];
        let port = getPort(service);
        return new RSTWeb(port, name = service.labels.name);
    }

    /* rs3ToImage converts the content of an rs3 file into a base64-encoded PNG
       image of the underlying RST tree (via calling rstweb-service). */
    async rs3ToRSTWebPNG(document) {
        const data = new FormData();
        data.append('input_file', document);

        const options = {
          method: 'POST',
          body: data,
        };

        let convertUrl;
        if (this.setup == 'server') {
            convertUrl = `https://${hostName}/${this.name}/api/convert?input_format=rs3&output_format=png-base64`;
        } else {
            convertUrl = `http://${hostName}:${this.port}/api/convert?input_format=rs3&output_format=png-base64`;
        }

        let response = await fetch(convertUrl, options);
        let output = await response.text();
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}\n${output}`);
        }

        return output;
    }
}


/* RSTParser defines a common client for the REST APIs of several RST parsers.
   The REST APIs were added to existing RST parsers as part of the rst-workbench
   project. */
class RSTParser {
    constructor(name, format, port, setup = setupType) {
        this.name = name;
        this.format = format;
        this.port = port;
        this.setup = setup;
    }

    // TODO: add GET /status to all parser APIs
    async isRunning() {
        let running = false;

        let statusUrl;
        if (this.setup == 'server') {
            statusUrl = `https://${hostName}/${this.name}/status`;
        } else {
            statusUrl = `http://${hostName}:${this.port}/status`;
        }

        const response = await fetch(statusUrl);
        if (response.ok && response.status == 200) {
            running = true;
        }
        return running;
    }

    // parse converts plain text into an RST tree (in the output format) that
    // this RST parser uses.
    async parse(input) {
        const data = new FormData();
        data.append('input', input);
        data.append('output_format', 'original'); // TODO: rm after cleanup of parser APIs

        const options = {
          method: 'POST',
          body: data,
        };

        let parseUrl;
        if (this.setup == 'server') {
            parseUrl = `https://${hostName}/${this.name}/parse`;
        } else {
            parseUrl = `http://${hostName}:${this.port}/parse`;
        }

        let response = await fetch(parseUrl, options);
        let output = await response.text();
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}\n${output}`);
        }

        return output;
    }
}


/* stringToElement converts a string representing an HTML element into an
   actual DOM element, cf. https://stackoverflow.com/a/35385518 */
function stringToElement(htmlString) {
    let template = document.createElement('template');
    htmlString = htmlString.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = htmlString;
    return template.content.firstChild;
}

/* download downloads the given input string in a file with the given name to
   the user's computer.
   source: https://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server */
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  document.body.removeChild(element);

  // We have to return false, because this function is called in "onsubmit" of
  // a form.
  // cf. https://stackoverflow.com/questions/19454310/stop-form-refreshing-page-on-submit/19454378
  return false;
}

/* addToSection adds a title and content to the existing, given section (i.e.
   the "results" or "errors" div element, e.g.

<div id=${section}> // "results" or "errors"
  <div id=${section}-${title}> // e.g. "results-codra"
    <h2>{$title}</h2> // e.g. "codra"
    <div id=${contentClass}>{$content}</div> // <div id='parser-output'>Lots of parser output...</div>
  </div>
</div> */
function addToSection(section, title, content, contentClass) {
    const contentElem = wrapInDiv(content, contentClass);

    // If the subsection already exists, add to id.
    // If it doesn't, create it first.
    const subsectionID = `${section}-${title}`;
    let subElem = document.getElementById(subsectionID);
    if (subElem === null) {
        const sectionElem = document.getElementById(section);

        subElem = document.createElement('div');
        subElem.id = subsectionID;

        const titleElem = document.createElement('h2');
        titleElem.innerText = title;

        const buttonRowElem = document.createElement('div');
        buttonRowElem.id = `${section}-${title}-buttons`;
        buttonRowElem.className = 'row text-center';

        subElem.appendChild(titleElem);
        subElem.appendChild(contentElem);
        subElem.appendChild(buttonRowElem);
        sectionElem.appendChild(subElem);
    } else {
        subElem.appendChild(contentElem);
    }
}

// adds the given button as a column to the "button row" of the given parser's results section
function addToButtonRow(parserName, element) {
    const buttonRowElem = document.getElementById(`results-${parserName}-buttons`);

    const buttonColElem = document.createElement('div');
    buttonColElem.className = 'col';
    buttonRowElem.appendChild(buttonColElem);

    buttonColElem.appendChild(element);
}


/* wrapContent wraps the given content (either a DOM element or a string)
   into a div element. */
function wrapInDiv(strOrElement, divID) {
    const contentElem = document.createElement('div');
    contentElem.id = divID;
    // add some space above and below the <div>,
    // cf. https://getbootstrap.com/docs/4.3/utilities/spacing/
    contentElem.className = "mt-3 mb-2";

    if (typeof strOrElement === "string") {
        contentElem.innerText = strOrElement;
    } else {
        contentElem.appendChild(strOrElement);
    }
    return contentElem;
}

/* addToResults adds a title (e.g. the name of a parser) and some content
   to the results section of the page. */
function addToResults(title, content, contentClass) {
	ensureElementVisible('results_section');
    addToSection('results', title, content, contentClass);
}

/* addPNGtoResults adds the given base64 encoded PNG image to the results
   section under the given title.

   Example:

<div>
  <div id="results-codra-images">
    <a href="#codra">
      <img class="img-fluid" alt="codra RST parse" src="data:image/png;base64...">
    </a>
    <a href="#_" class="lightbox" id="codra">
      <img class="img-fluid" alt="codra RST parse" src="data:image/png;base64...">
    </a>
  </div>
</div> */
function addPNGtoResults(title, pngBase64) {
    addBase64ImagetoResults(title, pngBase64, 'png');
}

function addSVGtoResults(title, svgBase64) {
    addBase64ImagetoResults(title, svgBase64, 'svg+xml');
}

function addBase64ImagetoResults(title, imageBase64, imageType) {
    let img = document.createElement('img');
    img.className = "img-fluid";
    img.alt = title + " RST parse";
    img.src = `data:image/${imageType};base64,${imageBase64}`;

    //addToSection('results', title, divResultsImages, 'rs3-image');
    addToSection('results', title, img, 'rs3-image');

}



/* addToErrors adds a title (e.g. the name of the parser that produced
   the error) and and error message to the  section of the page. */
function addToErrors(title, error) {
	ensureElementVisible('errors_section');
    addToSection('errors', title, error.toString(), 'error');
}

/* updateProgress adds/updates the parser status row in the progress table.
   given parser. */
function updateProgress(parserName, message) {
	const parserProgressElementName = `${parserName}-progress`;
	let parserProgress = document.getElementById(parserProgressElementName);
	let newParserProgress = stringToElement(`<tr id="${parserName}-progress"><th scope="row">${parserName}</th><td>${message}</td></tr>`);

	if (parserProgress === null) {
		// create parser progress table row
		let progressTable = document.getElementById('progress');		
		progressTable.appendChild(newParserProgress);
	} else {
		// update existing parser progress table row
		parserProgress.replaceWith(newParserProgress);
	}
}

/* getPort returns a Port number given a service Object.
   service = {build: Object, image: string, ports: Array(string)} */
function getPort(service) {
    portString = service.ports[0].split(':')[0];
    return Number(portString);
}


// showhide toggles the visibility of the given DOM element
function showhide(elementId) {
  var x = document.getElementById(elementId);
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

// ensure that the given DOM element is visible
function ensureElementVisible(elementId) {
	var x = document.getElementById(elementId);
	x.style.display = "block";
}

// ensure that the given DOM element invisible
function ensureElementInvisible(elementId) {
	var x = document.getElementById(elementId);
	x.style.display = "none";
}

// translate a string from source language to target language using DeepL.
async function translate(text, source_lang = 'DE', target_lang = 'EN') {
	const data = new FormData();
	data.append('auth_key', '31daab55-b4ad-cb6a-4caf-ffe280ce5e4f:fx');
	data.append('text', text);
	data.append('source_lang', source_lang);
	data.append('target_lang', target_lang);

	const options = {
	  method: 'POST',
	  body: data,
	};

	let response = await fetch('https://api-free.deepl.com/v2/translate', options);
	if (!response.ok) {
		throw new Error(`${response.status}: ${response.statusText}\n${output}`);
	}
	let output = await response.json();
	return output.translations[0].text;
}
