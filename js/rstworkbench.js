// TODO: import jsyaml directly, so we don't need it in vanilla.html

const confpath = 'docker-compose.yml';

// RSTWorkbench makes different RST parsers and converters accessible via
// a common interface.
//
// To create an RSTWorkbench instance:
// let wb = await RSTWorkbench.fromConfigFile();
class RSTWorkbench {
    // configObject: docker-compose file parsed into an Object
    // rstParsers: Array of {name: string, format: string, port: number}}
    constructor(configObject, rstParsers) {
        this.config = configObject
        this.rstParsers = rstParsers
        this.rstConverter = RSTConverter.fromConfigObject(configObject)
        this.rstWeb = RSTWeb.fromConfigObject(configObject)

        this.parseResults = null
    }

    // fromConfigFile creates a Promise(RSTWorkbench) from a
    // docker-compose config file.
    static async fromConfigFile(filepath = confpath) {
        const config = await this.loadConfig(filepath);
        const rstParsers = getRSTParsers(config);
        return new RSTWorkbench(config, rstParsers);
    }

    // loadConfig loads a YAML config file from the given path and returns
    // a Promise(Object) representing the config file.
    static async loadConfig(filepath) {
        const res = await fetch(filepath);
        const text = await res.text();
        return jsyaml.safeLoad(text);
    }

    // getParseResults retrieves parses from all configured RST parsers for
    // the given text and adds them to the "Results" section of the page.
    async getParseResults(text) {
        this.rstParsers.forEach(async (parser) => {
            parser.parse(text)
                .then(output => addToResults(parser.name, output))
                .catch(e => addToErrors(parser.name, e))
        });
    }

    // getParseImages parses the given text with all configured parsers, converts
    // the results into images and adds those to the "Results" section of the page.
    async getParseImages(text) {
        this.rstParsers.forEach(async (parser) => this.parseTextToImage(parser, text));
    }

    // parseTextToImage parses the given text with the given parser, converts
    // it to an image (via .rs3) and adds it to the "Results" section of the page.
    async parseTextToImage(parser, text) {
        let parseOutput;
        try {
            parseOutput = await parser.parse(text);
            addToResults(parser.name, parseOutput);
        } catch (err) {
            addToErrors(parser.name, err);
            return;
        }

        let rs3Output;
        try {
            rs3Output = await this.rstConverter.convert(parseOutput, parser.format, 'rs3');
        } catch (err) {
            addToErrors(`rst-converter-service for ${parser.name}`, err);
            return;
        }

        try {
            const parseImage = await this.rstWeb.rs3ToImage(rs3Output);
            addPNGtoResults(parser.name, parseImage);
        } catch (err) {
            addToErrors(`rstWeb for ${parser.name}`, err);
        }
    }

}


// addToSection adds a title and content to the existing, given DOM element, e.g.
// <div id={$section}>
//   <div>
//     <h2>{$title}</h2>
//     <p>{$content}</p>
//   </div>
// </div>
function addToSection(section, title, content) {
    const contentElem = wrapContent(content);

    const subsectionID = `${section}-${title}`;
    let subElem = document.getElementById(subsectionID);
    if (subElem === null) {
        const sectionElem = document.getElementById(section);

        subElem = document.createElement('div');
        subElem.id = subsectionID;

        const titleElem = document.createElement('h2');
        titleElem.innerText = title;

        subElem.appendChild(titleElem);
        subElem.appendChild(contentElem);
        sectionElem.appendChild(subElem);
    } else {
        subElem.appendChild(contentElem);
    }
}

// wrapContent wraps the given content (either a DOM element or a string)
// into a div element.
function wrapContent(content) {
    const contentElem = document.createElement('div');

    if (typeof content === "string") {
        contentElem.innerText = content;
    } else {
        contentElem.appendChild(content);
    }
    return contentElem;
}

// addToResults adds a title (e.g. the name of a parser) and some content
// to the results section of the page.
function addToResults(title, content) {
    addToSection('results', title, content);
}

// addPNGtoResults adds the given base64 encoded PNG image to the results
// section under the given title.
function addPNGtoResults(title, pngBase64) {
    let img = document.createElement('img');
    img.alt = "Embedded Image";
    img.src = `data:image/png;base64,${pngBase64}`;
    addToSection('results', title, img);
}

// addToErrors adds a title (e.g. the name of the parser that produced
// the error) and and error message to the  section of the page.
function addToErrors(title, error) {
    addToSection('errors', title, error.stack);
}

// getRSTParsers returns the metadata of all RST parsers from the object
// representation of a docker-compose.yml file.
function getRSTParsers(yamlObject) {
    let parsers = [];
    for (let serviceKey of Object.keys(yamlObject.services)) {
        service = yamlObject.services[serviceKey]
        serviceLabel = service.labels
        if (serviceLabel.type === 'rst-parser' ) {
            let parser = new RSTParser(
                serviceLabel.name,
                serviceLabel.format,
                getPort(service));
            parsers.push(parser);
        }
    }
    return parsers;
}


class RSTConverter {
    constructor(port) {
        this.port = port
    }

    static fromConfigObject(config) {
        let service = config.services["rst-converter-service"];
        let port = getPort(service);
        return new RSTConverter(port);
    }

    async convert(document, inputFormat, outputFormat) {
        const data = new FormData();
        data.append('input', document);

        const options = {
          method: 'POST',
          body: data,
        };

        let response = await fetch(`http://localhost:${this.port}/convert/${inputFormat}/${outputFormat}`, options);
        let output = await response.text();
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}\n${output}`);
        }

        return output;
    }
}


class RSTWeb {
    constructor(port) {
        this.port = port
    }

    static fromConfigObject(config) {
        let service = config.services["rstweb-service"];
        let port = getPort(service);
        return new RSTWeb(port);
    }

    async rs3ToImage(document) {
        const data = new FormData();
        data.append('input_file', document);

        const options = {
          method: 'POST',
          body: data,
        };

        let response = await fetch(`http://localhost:${this.port}/api/convert?input_format=rs3&output_format=png-base64`, options);
        let output = await response.text();
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}\n${output}`);
        }

        return output;
    }
}


// getPort returns a Port number given a service Object.
// service = {build: Object, image: string, ports: Array(string)}
function getPort(service) {
    portString = service.ports[0].split(':')[0];
    return Number(portString);
}


class RSTParser {
    constructor(name, format, port) {
        this.name = name
        this.format = format
        this.port = port
    }

    // TODO: add GET /status to all parser APIs
    async isRunning() {
        let running = false;

        const response = await fetch(`http://localhost:${this.port}/status`);
        if (response.ok && response.status == 200) {
            running = true;
        }
        return running;
    }

    async parse(input) {
        const data = new FormData();
        data.append('input', input);
        data.append('output_format', 'original'); // TODO: rm after cleanup of parser APIs

        const options = {
          method: 'POST',
          body: data,
        };

        let response = await fetch(`http://localhost:${this.port}/parse`, options);
        let output = await response.text();
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}\n${output}`);
        }

        return output;
    }
}
