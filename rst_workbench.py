#!/usr/bin/env python3.7
# coding: utf-8

import argparse
import codecs
import os
import sys

import requests

from update_all_containers import DOCKER_COMPOSE_CONFIG_PATH, yamlfile2dict


def post_file(host, port, input_filepath):
    """Send the given file via HTTP POST to the given host:port"""
    with open(input_filepath) as input_file:
        input_text = input_file.read()
        return requests.post(f'http://{host}:{port}/parse',
                             files={'input': input_text})


def get_rst_parsers(config_filepath=DOCKER_COMPOSE_CONFIG_PATH):
    config = yamlfile2dict(DOCKER_COMPOSE_CONFIG_PATH)

    rst_parsers = {}
    for service in config['services']:
        try:
            service_type = config['services'][service]['labels']['type']
            if service_type == 'rst-parser':
                rst_parsers[service] = config['services'][service]
        except Exception as e:
            sys.stderr.write(f"Can't parse config for {service}: {e}\n")
    return rst_parsers


def get_host_port(service_dict):
    ports = service_dict['ports']
    return ports[0].split(':')[0]



def parse_file(input_filepath, output_dirpath, parsers):
    results = []
    for service_name in parsers:
        port = get_host_port(parsers[service_name])
        result = post_file('localhost', port, 'input.txt')
        results.append((service_name, result))

    for service_name, result in results:
        parser_config = parsers[service_name]
        parser_name = parser_config['labels']['name']
        parser_format = parser_config['labels']['format']
        output_filename = f"{parser_name}.{parser_format}"
        if not result.ok:
            output_filename += ".error"

        if not os.path.isdir(output_dirpath):
            os.mkdir(output_dirpath)

        with codecs.open(os.path.join(output_dirpath, output_filename), 'w', 'utf-8') as output_file:
            output_file.write(result.content.decode('utf-8'))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument('-f', '--output-format',
                        help='Output format to be produced (in addition to original parser outputs')
    
    parser.add_argument('input_file')
    parser.add_argument('output_dir', nargs='?', default="./output")

    args = parser.parse_args(sys.argv[1:])

    parsers = get_rst_parsers()
    parse_file(args.input_file, args.output_dir, parsers)









