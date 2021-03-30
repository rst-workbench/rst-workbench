rst-workbench
=============

<img align="left" src="logo.png"> The `rst-workbench` lets you easily
install and run six existing RST parsers usind Docker containers.
It provides a convenient web app for visually comparing and post-editing
the trees produced by the RST parsers.


## [Charniak/BLLIP (Charniak and Johnson 2005)](https://github.com/BLLIP/bllip-parser)

*Description*: Charniak-Johnson reranking parser (commandline interface).
This parser is used by CODRA.

*Dockerized repo*: [charniak-docker](https://github.com/NLPbox/charniak-docker)
[![Travis Build Status](https://travis-ci.org/NLPbox/charniak-docker.svg?branch=master)](https://travis-ci.org/NLPbox/charniak-docker)
*Docker hub*: [nlpbox/charniak](https://hub.docker.com/r/nlpbox/charniak)
[![Docker Build Status](https://img.shields.io/docker/build/nlpbox/charniak.svg)](https://hub.docker.com/r/nlpbox/charniak/builds/)

## [discoursegraphs (Neumann 2015)](https://github.com/arne-cl/discoursegraphs)

*Description*: discoursegraphs is a graph-based converter library for linguistic file formats.

*Dockerized repo*: [arne-cl/discoursegraphs](https://github.com/arne-cl/discoursegraphs)
[![Travis Build Status](https://travis-ci.org/arne-cl/discoursegraphs.svg?branch=master)](https://travis-ci.org/arne-cl/discoursegraphs)
*Docker hub*: [nlpbox/discoursegraphs](https://hub.docker.com/r/nlpbox/discoursegraphs)
[![Docker Build Status](https://img.shields.io/docker/build/nlpbox/discoursegraphs.svg)](https://hub.docker.com/r/nlpbox/discoursegraphs/builds/)

### [rst-converter-service](https://github.com/arne-cl/rst-converter-service)

*Description*: REST API on top of discoursegraphs that converts between several RST file formats.

```TODO: add automated tests for Travis CI```
[![Travis Build Status](https://travis-ci.org/arne-cl/rst-converter-service.svg?branch=master)](https://travis-ci.org/arne-cl/rst-converter-service)
*Docker hub*: [nlpbox/rst-converter-service](https://hub.docker.com/r/nlpbox/rst-converter-service)
[![Docker Build Status](https://img.shields.io/docker/build/nlpbox/rst-converter-service.svg)](https://hub.docker.com/r/nlpbox/rst-converter-service/builds/)
*Supported input formats*: `codra`, `dis`, `dplp`, `hilda`, `hs2015`, `rs3`
*Supported output formats*: `dis`, `rs3`, `tree` (pretty-printed ASCII version of an nltk.Tree)


## [rstviewer](https://github.com/arne-cl/rstviewer)

*Description*: rstviewer converts *.rs3 files to PNG images.

*Dockerized repo*: [arne-cl/rstviewer](https://github.com/arne-cl/rstviewer)
[![Travis Build Status](https://travis-ci.org/arne-cl/rstviewer.svg?branch=master)](https://travis-ci.org/arne-cl/rstviewer)
*Docker hub*: [nlpbox/rstviewer](https://hub.docker.com/r/nlpbox/rstviewer)
[![Docker Build Status](https://img.shields.io/docker/build/nlpbox/rstviewer.svg)](https://hub.docker.com/r/nlpbox/rstviewer/builds/)

## [rstviewer-service](github.com/nlpbox/rstviewer-service)

*Description*: REST API around rstviewer

*Dockerized repo*: [nlpbox/rstviewer-service](https://github.com/nlpbox/rstviewer-service)
[![Travis Build Status](https://travis-ci.org/NLPbox/rstviewer-service.svg?branch=master)](https://travis-ci.org/NLPbox/rstviewer-service)
*Docker hub*: [nlpbox/rstviewer](https://hub.docker.com/r/nlpbox/rstviewer-service)
[![Docker Build Status](https://img.shields.io/docker/build/nlpbox/rstviewer-service.svg)](https://hub.docker.com/r/nlpbox/rstviewer-service/builds/)


## [DPLP (Ji and Eisenstein 2014)](https://github.com/jiyfeng/DPLP)

### dplp-docker

*Description*: DPLP RST parser commandline interface.

*Dockerized repo*: [dplp-docker](https://github.com/NLPbox/dplp-docker)
[![Travis Build Status](https://travis-ci.org/NLPbox/dplp-docker.svg?branch=master)](https://travis-ci.org/NLPbox/dplp-docker)
*Docker hub*: [nlpbox/dplp](https://hub.docker.com/r/nlpbox/dplp/)
[![Docker Build Status](https://img.shields.io/docker/build/nlpbox/dplp.svg)](https://img.shields.io/docker/build/nlpbox/dplp.svg)

### dplp-service

*Description*: REST API around the DPLP RST parser.

*Dockerized repo*: [dplp-service](https://github.com/NLPbox/dplp-service)
[![Travis Build Status](https://travis-ci.org/NLPbox/dplp-service.svg?branch=master)](https://travis-ci.org/NLPbox/dplp-service)
*Docker hub*: [nlpbox/dplp-service](https://hub.docker.com/r/nlpbox/dplp-service/)
[![Docker Build Status](https://img.shields.io/docker/build/nlpbox/dplp-service.svg)](https://img.shields.io/docker/build/nlpbox/dplp-service.svg)
*Supported output formats*: `dplp` (DPLP-specific, tabular format), `rs3` (using discoursegraphs for conversion)

## [CODRA (Joty et al. 2015)](http://alt.qcri.org/tools/discourse-parser/)

### codra-docker

*Description*: CODRA RST parser commandline interface.

*Dockerized repo*: [codra-docker](https://github.com/NLPbox/codra-docker)
[![Travis Build Status](https://travis-ci.org/NLPbox/codra-docker.svg?branch=master)](https://travis-ci.org/NLPbox/codra-docker)
*Docker hub*: [nlpbox/codra](https://hub.docker.com/r/nlpbox/codra/)
[![Docker Build Status](https://img.shields.io/docker/build/nlpbox/codra.svg)](https://hub.docker.com/r/nlpbox/codra/)

### codra-service

*Description*: REST API around the CODRA RST parser.

*Dockerized repo*: [codra-service](https://github.com/NLPbox/codra-service)
[![Travis Build Status](https://travis-ci.org/NLPbox/codra-service.svg?branch=master)](https://travis-ci.org/NLPbox/codra-service)
*Docker hub*: [nlpbox/codra-service](https://hub.docker.com/r/nlpbox/codra-service/)
[![Docker Build Status](https://img.shields.io/docker/build/nlpbox/codra-service.svg)](https://hub.docker.com/r/nlpbox/codra-service/)
*Supported output formats*: `cpdra` (dis/RST-DT-like, s-expression format with CODRA-specific escaping), `rs3` (using discoursegraphs for conversion)

## [Heilman and Sagae (2015)](https://github.com/EducationalTestingService/discourse-parsing)

### heilman-sagae-2015-docker

*Description*: Heilman and Sagae (2015) RST parser commandline interface.

*Dockerized repo*: [heilman-sagae-2015-docker](https://github.com/NLPbox/heilman-sagae-2015-docker)
[![Travis Build Status](https://travis-ci.org/NLPbox/heilman-sagae-2015-docker.svg?branch=master)](https://travis-ci.org/NLPbox/heilman-sagae-2015-docker)
*Docker hub*: [nlpbox/heilman-sagae-2015](https://hub.docker.com/r/nlpbox/heilman-sagae-2015/)
[![Docker Build Status](https://img.shields.io/docker/build/nlpbox/heilman-sagae-2015.svg)](https://hub.docker.com/r/nlpbox/heilman-sagae-2015/)

### heilman-sagae-2015-service

*Description*: REST API around the Heilman and Sagae (2015) RST parser.

*Dockerized repo*: [heilman-sagae-2015-service](https://github.com/NLPbox/heilman-sagae-2015-service)
[![Travis Build Status](https://travis-ci.org/NLPbox/heilman-sagae-2015-service.svg?branch=master)](https://travis-ci.org/NLPbox/heilman-sagae-2015-service)
*Docker hub*: [nlpbox/heilman-sagae-2015-service](https://hub.docker.com/r/nlpbox/heilman-sagae-2015-service/)
[![Docker Build Status](https://img.shields.io/docker/build/nlpbox/heilman-sagae-2015-service.svg)](https://hub.docker.com/r/nlpbox/heilman-sagae-2015-service/)
*Supported output formats*: `hs2015` (a list of EDUs and an s-expression tree)

## [HILDA (Hernault et al. 2010)](https://github.com/NLPbox/hilda-docker)

### hilda-docker

*Description*: HILDA RST parser commandline interface. HILDA itself is only
available from the [Prendinger lab](http://research.nii.ac.jp/%7Eprendinger/),
so we can't provide automated builds but only the build scripts here.

*Dockerized repo*: [hilda-docker](https://github.com/NLPbox/hilda-docker)


## Troubleshooting

If running the rst-workbench with the command ``docker-compose up`` produces
an unexpected error like this one,

```
Starting rst-workbench_rst-converter-service_1 ... done
Attaching to rst-workbench_rst-converter-service_1
rst-converter-service_1  | xvfb-run: error: Xvfb failed to start
rst-workbench_rst-converter-service_1 exited with code 1
```

try to run it using ``DOMAIN=localhost docker-compose up --build --force-recreate`` instead.
``HOSTNAME`` refers to the name under which the host machine (i.e. the machine on which you run
``docker-compose``) is reachable from the outside world.
If you set the ``HOSTNAME`` to ``localhost``, the rst-workbench will be only available on the
machine were you run this command.
