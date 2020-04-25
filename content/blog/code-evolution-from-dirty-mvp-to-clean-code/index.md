---
title: "Code evolution: From dirty MVP to clean code"
slug: "/code-evolution-from-dirty-mvp-to-clean-code"
date: ""
featured: false
draft: false
tags: []
---

We'll be building the server side implementation of a simple note sharing app, which would have the following features,

1. A note is just a text where the first line (limited to first 50 characters) is the note title
2. You (user) can create, edit, delete and view notes that you created
3. You can set the visibility of these notes to public (anyone can read), shared (only people with whom the note is shared can read) or private (only you can read)

I'll be using Python for building this app.

However, in whatever step our project is, we will always ensure that,

1. Our code remains readable
2. Our commits and commit messages are complete

# 0. Project setup

Let's create our project directory first

```bash
take ~/Playground/code-evolution
```

<small>`take` is equivalent of `mkdir -p $1 && cd $1`</small>

We'll initialize our Git repository and copy an auto-generated .gitignore file from [gitignore.io](https://gitignore.io/)

```bash
git init
curl https://gitignore.io/api/flask,python -o .gitignore
```

Create a Python virtual environment for our project

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install Flask

```bash
pip install flask
pip freeze > requirements.txt
```

Add a simple `README.md`

```bash
cat > README.md <<EOF
# Notefy
Note sharing for dummies

## TODO
1. Complete this README
EOF
```

Make our first commit

```bash
git add --all
git commit -m 'Setup project with core dependencies and README'
```

# MVP 1: Simple CRUD API for notes

To begin with, our MVP stage 1 would have the following objectives,

1. Simple CRUD API for notes
2. No authentication or user data required
