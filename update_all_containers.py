#!/usr/bin/env python3
# coding: utf-8

"""This script checks if all images used in docker-compose.yml are up-to-date
and updates the file if necessary.

Specifically, it looks on Docker Hub if there are successful builds for
the given repositories whose tags indicidate that they are newer than
the builds that are currently referenced in docker-compose.yml.
"""

import re
import sys

import requests
import yaml


DOCKER_COMPOSE_CONFIG_PATH = "docker-compose.yml"
DOCKER_HUB_ENDPOINT = "https://hub.docker.com/v2/repositories"

DATE_TAG_RE = re.compile("\d{4}-\d{2}-\d{2}(-\d+)?")
IMAGE_RE = re.compile("(?P<organisation>.*?)/(?P<repo>.*?):(?P<tag>.*)")
INTEGER_RE = re.compile('([0-9]+)')


def natural_sort_key(s):
    """Returns a key that can be used in sort functions.

    When we use this function as a key to the sort function,
    the natural order of the integer is considered.

    >>> print sorted(items, key=natural_sort_key)
    ['A99', 'a1', 'a2', 'a10', 'a12', 'a24', 'a100']
    """
    return [int(text) if text.isdigit() else text
            for text in re.split(INTEGER_RE, str(s))]


def yamlfile2dict(yaml_filepath):
    with open(yaml_filepath, 'r') as yaml_file:
        return yaml.safe_load(yaml_file)


def yamldict2file(yaml_dict, output_filepath=None):
    """Write a YAML dict to a file preserving key order.
    
    (The YAML spec DOES NOT guarantee key order, but YAML files
    are normally edited by humans who expect things to be in the
    order that they wrote them down.)
    """
    if output_filepath is None:
        return yaml.safe_dump(yaml_dict, sort_keys=False)

    with open(output_filepath, 'w') as yaml_file:
        yaml.safe_dump(yaml_dict, yaml_file, sort_keys=False)


def get_image_tags(organisation, repo):
    url = f"{DOCKER_HUB_ENDPOINT}/{organisation}/{repo}/tags/"
    res = requests.get(url)
    if res.ok:
        res_json = res.json()
        return [tag['name'] for tag in res_json['results']]
    else:
        raise ValueError(f"Docker Hub returned this: {res.content}\nfor URL: {url}")


def get_most_recent_tag(tags):
    """Given a list of Docker Hub repo tags, return the most recent tag.

    We can't rely on 'latest' to be the most recent one, so we use the tags
    that we have attached ourselves to the repo.
    """
    matching_tags = [tag for tag in tags if DATE_TAG_RE.match(tag)]
    if matching_tags:
        return sorted(matching_tags, key=natural_sort_key, reverse=True)[0]

    # There are no tags that start with a date in the form YYYY-MM-DD.
    # As a fallback, we will assume tags with incremented numbers.
    return sorted([int(t) for t in tags if t.isdigit()], reverse=True)[0]


def update_images(config_filepath='docker-compose.yml'):
    config = yamlfile2dict(config_filepath)
    for service in config['services']:
        match = IMAGE_RE.match(config['services'][service].get('image', ''))
        if match:  # local images (i.e. HILDA) can't be matched
            organisation = match.groupdict()['organisation']
            repo = match.groupdict()['repo']
            current_tag = match.groupdict()['tag']
            try:
                tags = get_image_tags(organisation, repo)
                most_recent_tag = get_most_recent_tag(tags)

                if current_tag != most_recent_tag:
                    most_recent_image = f"{organisation}/{repo}:{most_recent_tag}"
                    config['services'][service]['image'] = most_recent_image
            except ValueError:
                sys.stderr.write(f"Can't find tags online for image '{match.group()}'.\n")
    yamldict2file(config, config_filepath)


if __name__ == '__main__':
    update_images('docker-compose.yml')
    update_images('docker-compose-server.yml')
