#!/usr/bin/env python3.7
# coding: utf-8

import argparse
import asyncio
import codecs
import os
import sys

import aiohttp

from update_all_containers import DOCKER_COMPOSE_CONFIG_PATH, yamlfile2dict


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


def make_output_filepath(output_dirpath, parser_config):
    parser_name = parser_config['labels']['name']
    parser_format = parser_config['labels']['format']
    output_filename = f"{parser_name}.{parser_format}"
    return os.path.join(output_dirpath, output_filename)


def ensure_output_dir(output_dirpath):
    if not os.path.exists(output_dirpath):
        os.mkdir(output_dirpath)
    else:
        if not os.path.isdir(output_dirpath):
            raise ValueError(f"Given output path is not a directory: {output_dirpath}")


async def post_file(host, port, input_filepath):
    """Send the given file via HTTP POST to the given host:port"""
    url = f'http://{host}:{port}/parse'
    data = aiohttp.FormData()
    data.add_field('input', open(input_filepath, 'r'))

    async with aiohttp.ClientSession(raise_for_status=True) as session:
        async with await session.post(url, data=data) as resp:
            return await resp.text()


async def parse_file(input_filepath, output_dirpath, parsers):
    """Parse the given file with all available parsers and write the results
    to the output directory.
    """
    for service_name in parsers:
        parser_config = parsers[service_name]
        port = get_host_port(parser_config)

        ensure_output_dir(output_dirpath)
        output_filepath = make_output_filepath(output_dirpath, parser_config)
        try:
            result = await post_file('localhost', port, 'input.txt')
        except Exception as err:
            result = err.__repr__()
            output_filepath += ".error"

        with codecs.open(output_filepath, 'w', 'utf-8') as output_file:
            output_file.write(result)


async def main():
    parser = argparse.ArgumentParser()

    parser.add_argument('-f', '--output-format',
                        help='Output format to be produced (in addition to original parser outputs')

    parser.add_argument('input_file')
    parser.add_argument('output_dir', nargs='?', default="./output")

    args = parser.parse_args(sys.argv[1:])

    parsers = get_rst_parsers()
    await parse_file(args.input_file, args.output_dir, parsers)


if __name__ == '__main__':
    asyncio.run(main())








