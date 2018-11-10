// TODO: import jsyaml directly, so we don't need it in vanilla.html

const confpath = 'docker-compose.yml';

// Simplest way to create an RSTWorkbench instance:
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
        const config = await loadConfig(filepath);
        const rstParsers = getRSTParsers(config);
        return new RSTWorkbench(config, rstParsers);
    }

    async getParseResults(text) {
        this.rstParsers.forEach(async (parser) => {
            parser.parse(text)
                .then(output => addToResults(parser.name, output))
                .catch(e => addToErrors(parser.name, e))
        });
    }

    async getParseImages(text) {
        this.rstParsers.forEach(async (parser) => {
            parser.parse(text)
                .then(output => {
                    addToResults(parser.name, output);
                    this.rstConverter.convert(output, parser.format, 'rs3')
                        .then(rs3 => {
                            this.rstWeb.rs3ToImage(rs3)
                                .then(image => addToResults(parser.name, image))
                                .catch(e => addToErrors(`rstWeb for ${parser.name}`, e))
                        })
                        .catch(e => addToErrors(`rst-converter-service for ${parser.name}`, e))
                })
                .catch(e => addToErrors(parser.name, e))
        });
    }
}

// addToElement adds a title and content to the given DOM element, e.g.
// <div id={$elementID}>
//   <div>
//     <h2>{$title}</h2>
//     <p>{$content}</p>
//   </div>
// </div>
function addToElement(elementID, title, content) {
    let resultsElem = document.getElementById(elementID);

    let resultElem = document.createElement('div');
    let titleElem = document.createElement('h2');
    titleElem.innerText = title;

    let contentElem = document.createElement('p');
    contentElem.innerText = content;

    resultElem.appendChild(titleElem);
    resultElem.appendChild(contentElem);
    resultsElem.appendChild(resultElem);
}

// addToResults adds a title (e.g. the name of a parser) and some content
// to the results section of the page.
function addToResults(title, content) {
    addToElement('results', title, content);
}

// addToErrors adds a title (e.g. the name of the parser that produced
// the error) and and error message to the  section of the page.
function addToErrors(title, error) {
    addToElement('errors', title, error.stack);
}

// loadConfig loads a YAML config file from the given path and returns
// a Promise(Object) representing the config file.
async function loadConfig(filepath) {
    const res = await fetch(filepath);
    const text = await res.text();
    return jsyaml.safeLoad(text);
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

        let response = await fetch(`http://localhost:${this.port}/convert?input_format=rs3&output_format=png-base64`, options);
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
        data.append('output_format', 'original'); // FIXME: rm after cleanup of parser APIs

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
