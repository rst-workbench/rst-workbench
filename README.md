# rst-workbench

<img align="left" src="frontend/img/logo.png" width="300"> The `rst-workbench` lets you easily
install and run existing RST parsers usind Docker containers.
It provides a convenient web app for running multiple RST parsers concurrently
and allows you to visualize and post-edit the trees produced by the parsers.
<br clear="left"/>

<a href="https://www.youtube.com/watch?v=-zpdhp5nu-M">
  <img align="right" src="frontend/img/demo-video-screenshot.png" alt="screenshot from rst-workbench demo video" width="500">
</a>

Here's a [video](https://www.youtube.com/watch?v=-zpdhp5nu-M) demonstrating its usage.
You can also try our demo server: https://rst-workbench.arne.cl/ .
For installation instructions and usage examples, see [below](#installation).
<br clear="right"/>

## Supported Parsers

Currently, we support the following RST parsers that we provide as Docker
containers with a REST API and pre-trained on RST-DT:

- HILDA (Hernault et al. 2010) [[our repo](https://github.com/nlpbox/hilda-service)] [[paper](http://journals.linguisticsociety.org/elanguage/dad/article/download/591/591-2300-1-PB.pdf)]
  - HILDA itself is only available from the [Prendinger lab](http://research.nii.ac.jp/%7Eprendinger/),
    so we can't provide automated builds but only the build scripts here.

- Feng and Hirst (2014) [[our repo](https://github.com/NLPbox/feng-hirst-service)] [[paper](https://www.aclweb.org/anthology/P14-1048/)]

- DPLP (Ji and Eisenstein 2014) [[our repo](https://github.com/NLPbox/dplp-service)] [[paper](https://www.aclweb.org/anthology/P14-1002/)]

- Heilman and Sagae (2015) [[our repo](https://github.com/NLPbox/heilman-sagae-2015-service)] [[paper](https://arxiv.org/abs/1505.02425)]

- CODRA (Joty et al. 2015) [[our repo](https://github.com/NLPbox/codra-service)] [[paper](https://www.mitpressjournals.org/doi/abs/10.1162/COLI_a_00226)]

- StageDP (Wang et al. 2017) [[our repo](https://github.com/nlpbox/stagedp-service)] [[paper](https://www.aclweb.org/anthology/P17-2029/)]
  - the parser requires EDU-segmented input, so we combine it with the NeuralEDUSeg discourse segmenter [(Wang et al. 2018)](https://www.aclweb.org/anthology/D18-1116/)


## Installation

## Usage



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

## Citation

If you use rst-workbench, rst-converter-service or any of the dockerized RST parsers,
please consider citing our paper:

```
@inproceedings{neumann-2021-rst-workbench,
    title = "Using and comparing {R}hetorical {S}tructure {T}heory parsers with rst-workbench",
    author = "Neumann, Arne",
    booktitle = "Proceedings of the 16th Conference of the European Chapter of the Association for Computational Linguistics: System Demonstrations",
    month = apr,
    year = "2021",
    address = "Online",
    publisher = "Association for Computational Linguistics",
    url = "https://www.aclweb.org/anthology/2021.eacl-demos.1",
    pages = "1--6",
}
```
