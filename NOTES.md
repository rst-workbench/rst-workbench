# Docker Hub

If you push your repo to github (and it is connected to Docker Hub),
each commit on the master branch will be build by Docker Hub using the
``latest`` tag. This makes it impossible to retrieve the previous build
(using ``docker pull``) in case your newest build brakes.

In order to be able to pull earlier, working builds, we need to add a tag
to our commit and push the tag alongside the commit.

Before we can do so, we first need to tell Docker Hub to watch for
incoming tags. To do so, log in to your Docker Hub account, go to the
repo you're working on, click on "Build Settings" and "+",
select the following:

**Type**: ``Tag``  
**Name**: ``/^([0-9a-z-.]+)$/``
**Dockerfile Location**: ``/``
**Docker Tag Name**: (leave empty)

Afterwards, click on "Save changes". From now on, you can tag and push
your commits like this to trigger build on Docker Hub.

```
git tag 2018-05-01
git push --tags
```

You can now refer / pull those builds via ``user_name/repo_name:tag_name``.
