---
title: "Introducing: Scheduler"
slug: "/introducing-django-task-scheduler"
date: "2018-11-25T02:54:52.000Z"
featured: false
draft: false
tags: ["python","programming","project","library","scheduler","django","celery"]
---

Scheduler is a small task scheduling utility built for Django using Celery.

A lot of interesting projects start by solving a simple but essential problems of some other major problem. So was the case with [Scheduler](https://github.com/tejasjadhav/django-scheduler). At [m.Paani](https://mpaani.com), I had similar such problem.

# Problem statement
I had to execute a task at specific intervals. At first, I tried the one and only, fan-favorite, _cronjob_. Luckily, Celery has something which does the exact same thing - `@periodic_task`. Just enter your cron rule and your job is done. Voila! Problem solved. Celebrations were too early and I just discovered a few scenarios which could not be done with cron jobs alone.

To understand this, let's see how a complicated rule of our old, faithful cron looks like.
```cron
5-30/3 */2 * 1,5,9 2
```
The above rule translates to,
> At every 3rd minute from 5 through 30 past every 2nd hour on Tuesday in January, May, and September. <small>[crontab.guru](https://crontab.guru/). You can check the interpretation of the above rule [here](https://crontab.guru/#5-30/3_*/2_*_1,5,9_2_).</small>

This seems all nice and fair. However, I had some bizaare use cases.

1. Task should execute every 2nd Friday
2. Task should execute on second last day on every month
3. Task should execute on every even day

Cron rule for first is still manageable in some cases. For second, it is impossible. And for 3rd, it fails after every month with odd number of days (though the non-standard way of doing it is `0 0 2/2 * *`). After head banging for a day and countless Google searches, I just glanced at my [calendar app](https://play.google.com/store/apps/details?id=com.google.android.calendar&hl=en) and saw some recurring events, like weekly sprints, month-end discussions, etc. When I tried to create one with a repetition pattern, I saw half a dozen of configurations. Initially, it seemed like some Google kinda stuff (of course, you can only expect such sophistications from a Google-like company). But, then I saw similar settings on [Evolution](https://wiki.gnome.org/Apps/Evolution). To my utter surprise, I could edit the reccurence rules set for the event on Google Calendar, and then on the app, those changes got sync'd up. This commonality means that there's some practice or convention followed by both. After digging about it for some time, I hit the jackpot. It's called _Recurrence Rules_ which is an actual [standard set by the IEFT](https://tools.ietf.org/html/rfc2445) (the gods behind everything related to internet including HTTP, LDAP, sockets, etc. You can check the list of standards they have in place [here](https://www.rfc-editor.org/rfc-index.html).)

# Recurrence rules _(RRULE)_
They are similar to cron jobs. Like cron, they solve the problem of defining rules for programming date and time patterns. Unlike cron, RRULE is a complete [DSL](https://blog.tejasjadhav.xyz/2016/06/06/domain-specific-languages-using-python-part-1/) with limited grammar. You can stack multiple RRULEs to create an inclusion-exclusion pattern. Look at this example below,
```rrule
RRULE:FREQ=DAILY;COUNT=5
```
The above rule executes every day for the next 5 days. Not amused, take another example,
```rrule
RRULE:FREQ=MONTHLY;COUNT=3;BYDAY=-2MO
```
This rule executes every second last day of the month for the next 3 months. Sounds familiar? Yes, this solves my second use case too.
```rrule
RRULE:FREQ=DAILY;INTERVAL=2;BYSETPOS=2
```

# Implementation
One by one, all my usecases were handled by RRULEs. But building a complete RRULE parser in Python is a prodigious chore. I had written an article about writing DSLs in Python a while back which you may refer to understand how much does it take to build a basic DSL. This was just too much for me to do. I almost settled for cronjobs again when I realised that the [`python-dateutil`](https://pypi.python.org/pypi/python-dateutil) library has something already built related to RRULEs. Oh yes! They had built an RRULE parser ([`dateutil.rrule`](https://dateutil.readthedocs.io/en/stable/rrule.html)) which, in fact, also has a Python API giving an even greater control of the individual elements of the RRULE. Such a sweet delight!

The library has a function `dateutil.rrule.rrulestr` which converts a raw RRULE string into a `rrule` object. The best part about this object is, some parameters of the RRULE can be changed directly by modifying the object properties, like the `dtstart` parameter. Also, the best part is, the `rrule` object is a generator, which means I can iterate over it and it will give me the next timestamp in the sequence. Overall, this utility provided the perfect suite for managing RRULEs.

Th initial idea for flow was,

1. Get the RRULEs from the database defined by the user
2. Build the `rrule` object
3. Get the next timestamp in the sequence
4. Pickle the `rrule` object and store it in the database and execute the function at the specified timestamp using the `eta` argument in Celery's `apply_async` function.
5. When the function gets executed, unpickle the `rrule` object, get the next timestamp and then repeat step 4.
6. Repeat until `rrule` no longer returns a timestamp.

However, there was one major issue. The `rrule` object was [unpickable](https://docs.python.org/3.7/library/pickle.html#pickle-picklable). Further I realised, the `rrule` object was not a generator but an iterator instead. A workaround for this (a hack!) was to get the time when the function last executed and keep fetching the next timestamp from the `rrule` iterator until the next timestamp was greater than the current one. Since I no longer had to pickle the `rrule` object, I just stored the last executed timestamp in the database which, in my opinion, is a much cleaner solution and much more library agnostic.

Also, I didn't want to interfere with the usual way Celery works and wanted this flow to be introduced with as little custom code as possible. So, instead of creating a new task decorator, I preferred [Celery's task inheritence](http://docs.celeryproject.org/en/latest/userguide/tasks.html#task-inheritance) and created a base task class called `RepeatTask` which contained the entire logic for fetching the function, fetching the arguments and keyword arguments, executing the function, getting the next timestamp and then scheduling the task for next execution.

I've added the installation and usage details in the [README](https://github.com/tejasjadhav/django-scheduler/blob/master/README.md) of the [repository](https://github.com/tejasjadhav/django-scheduler/). Please check it out. The library is still in alpha and yet to be published on PyPI.
