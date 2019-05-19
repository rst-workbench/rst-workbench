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


def get_converter(config_filepath=DOCKER_COMPOSE_CONFIG_PATH):
    config = yamlfile2dict(DOCKER_COMPOSE_CONFIG_PATH)
    return config['services']['rst-converter-service']


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


async def post_file(host, port, path, input_filepath):
    """Send the given file via HTTP POST to the given host:port"""
    url = f'http://{host}:{port}{path}'
    data = aiohttp.FormData()
    data.add_field('input', open(input_filepath, 'r'))

    async with aiohttp.ClientSession(raise_for_status=True) as session:
        async with await session.post(url, data=data) as resp:
            return await resp.text()


async def convert_file(input_filepath, input_format, output_dirpath, output_formats, converter):
    port = get_host_port(converter)
    for output_format in output_formats:
        api_path = f'/convert/{input_format}/{output_format}'
        input_filename = os.path.basename(input_filepath)
        output_filename = f'{input_filename}.CONVERTED.{output_format}'
        output_filepath = os.path.join(output_dirpath, output_filename)
        try:
            result = await post_file('localhost', port, api_path, 'input.txt')

        except Exception as err:
            result = err.__repr__()
            output_filename += ".error"

        with codecs.open(output_filepath, 'w', 'utf-8') as output_file:
            output_file.write(result)


async def parse_file(input_filepath, output_dirpath, parsers, converter=None, output_formats=None):
    """Parse the given file with all available parsers and write the results
    to the output directory.
    """
    for service_name in parsers:
        parser_config = parsers[service_name]
        parser_format = parser_config['labels']['format']
        port = get_host_port(parser_config)

        ensure_output_dir(output_dirpath)
        parse_filepath = make_output_filepath(output_dirpath, parser_config)
        try:
            result = await post_file('localhost', port, '/parse', 'input.txt')

            if converter is not None and output_formats is not None:
                await convert_file(
                    input_filepath=parse_filepath,
                    input_format=parser_format,
                    output_dirpath=output_dirpath,
                    output_formats=output_formats,
                    converter=converter)

        except Exception as err:
            result = err.__repr__()
            parse_filepath += ".error"

        with codecs.open(parse_filepath, 'w', 'utf-8') as output_file:
            output_file.write(result)


async def get_output_formats(converter):
    port = get_host_port(converter)
    url = f'http://localhost:{port}/output-formats'

    async with aiohttp.ClientSession(raise_for_status=True) as session:
        async with await session.get(url) as resp:
            return await resp.text()


async def main():
    import datetime
    now = datetime.datetime.now()
    default_outputdir = f"./output-{now.isoformat()}"
    
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '-l', '--list-output-formats', action='store_true',
        help=('Lists all output formats that can be currently produced.'))
    parser.add_argument(
        '-f', '--output-formats',
        help=('Comma-separated list of outputs format to be produced '
              '(in addition to original parser outputs'))

    parser.add_argument('input_file')
    parser.add_argument('output_dir', nargs='?', default=default_outputdir)

    args = parser.parse_args(sys.argv[1:])
    converter = get_converter()

    if args.list_output_formats is True:
        available_formats = await get_output_formats(converter)
        print(available_formats)
        sys.exit(0)

    parsers = get_rst_parsers()
    output_formats = args.output_formats.split(',')
    await parse_file(
        input_filepath=args.input_file,
        output_dirpath=args.output_dir,
        parsers=parsers,
        converter=converter,
        output_formats=output_formats)


if __name__ == '__main__':
    asyncio.run(main())
