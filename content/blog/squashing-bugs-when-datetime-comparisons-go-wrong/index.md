---
title: "Squashing bugs: When datetime comparisons go wrong"
slug: "/squashing-bugs-when-datetime-comparisons-go-wrong"
date: "2018-12-06T15:19:32.000Z"
featured: false
draft: false
tags: ["python","programming","life experience","debugging","localoye"]
---

This is a debugging story at my first job at LocalOye, where we encountered a bug which I still consider to be one of the best I've ever encountered.

---

# Background

LocalOye was a mass-market services aggregator startup (now shutdown). We connected the service providers (plumbers, electricians, carpenters, yoga trainers, etc.) to the consumers through our app.

Like all tech startups in their early booming days, ours too was on a feature spree. We had around half a dozen of major features rolling out in a single release. We used to call these as _big bang releases_. Our tech stack was [Django](https://www.djangoproject.com/) with [MySQL](https://www.mysql.com/) and the entire system was split into a bunch of microservices.

We were rolling out a bunch of features, but for sake brevity, let's just focus on the one that caused the issue. When booking for an appointment for a service, the customer has to answer a bunch of questions including the type of service, location, cost range, timing, etc. We introduced something called as variable time slots where providers can define their own time slots for the whole day, assign the time range they will be working in and the size of a time slot per customer.

There were around 19 [feature branches](https://danielkummer.github.io/git-flow-cheatsheet/) written by our team of 6 backend engineers, which were supposed to be merged and pushed on production and I was given this messy work. After fighting the nightmarish merge conflicts, last minute fixes, syntax errors (on staging!), cyclic dependencies and migration conflicts, I somehow managed to get it all in one branch. It was also my longest day at work (37 hours, though I'm no longer proud of this achievement). Yet we were on an ass-on-fire situation because the deployment was still not done.

Finally, the next day we got a green flag from QA and we're ready to deploy. Like all our major releases, this was gonna go on production at night. We still didn't have CI/CD in place, so all deployments were manual (login to the instance, pull the code, restart server). We decided the deployment to be done at around 4 AM since the load was minimal and if anything goes haywire, we had minimal loss. We had stayed back in the office including the backend team, frontend team, our backend lead (_Gauri_) and head of technology (_Vivek_).

The deployment happened at around 6 AM and we did a basic test whether everything was working fine. It seemed the deployment was a success. We felt relieved! Everyone was almost half asleep at this point and were really happy that they finally got this release done and now they can cozily lay back on their beds and enjoy their well deserved sleep. I was particularly a zombie at this point since I just had a 7 hour sleep after that humongous 37 hour stint and I was up again for 16 hours now. Soon everyone packed their bags and left one by one. Me and _Gauri_ stayed back. While she wrote the _"Deployment successful"_ email, marking our product managers, business teams and CEO, I was busy closing my code editors, terminals, ticking off points on the deployment checklist and, finally, shutting down my laptop.

---

# One by one, things fell apart

Everything was nice and happy and we decided to step down for a quick breakfast. While coming back, _Gauri_ got a nice good morning call from _Vivek_ informing that he was getting API timeout errors on web. All AJAX calls to the server waited for 30 seconds (default for HTTP requests) and would return with a timeout error. We quickly headed back to the office, turned on our laptops and started monitoring our servers using the all time reliable Linux's [top](http://man7.org/linux/man-pages/man1/top.1.html)! One of the servers that hosted our microserivce, which is responsible for reading data from server and contained most of the business logic, shot to 100% CPU. We waited for sometime, but it still didn't seem to settle. Since it affected all other microservices, we spent minimal time investigating and _Gauri_ just `kill -9`'d  the service processes and spawned them again. We again monitored for 15-20 minutes. Nothing went wrong now. All seemed fine.

We thought that was some random one-off error. Might be some edge case. _Gauri_ called back _Vivek_ and notified him that the server was all fine and he should test again. After a quick test, _Vivek_ gave a confirmation that it was all okay now. We were relieved but super confused. In the end, we said "chuck it" and moved on. By this time, our operations team and customer support team started coming to office one by one, astonished to see both of us still in office. It was 8 AM now.

Just when I closed my terminal, one of the guys from the operations came to our desk and informed that all the dashboards are empty. Nothing was showing up, these guys couldn't even open up a single service request on the dashboard. I went with him to investigate (using our beloved Chome Developer Tools) and found the same error _Vivek_ was getting earlier. APIs were timing out. I quickly ran to _Gauri_ and asked her to monitor the servers and bam! The CPU was again on 100%. Now I almost started freaking out. As a software engineer, I feel disgraced when something I build doesn't work and the end user is affected. I started thinking of all possible places where I could have gone wrong - _"Perhaps the merge didn't end well. What if there's a cyclic dependency which is causing the Python interpreter to freak out? Maybe I removed some essential piece of code in merge conflicts which is causing this issue? Did internet just go off on Digital Ocean servers?"_. And there stood _Gauri_, as calm as the sea, steadfast, neatly monitoring any patterns in this behavior and without even the slightest bit of stress on her face, and comforting me that there's nothing to panic and I should stay calm. She found that, not only the CPU went 100%, even the RAM usage slowly went from 15% to 78%! She again killed the processes and started again and everything went back to normal.

I was puzzled beyond imagination. My first thought was to review the all the code that went on production. Yes, all of it! All code in those 19 feature branches, which would amount to around 10K lines. _Gauri_ told me to add logs everywhere - start and end of function body, API endpoints, RPC calls, etc. I quickly managed to do it, at least in the new code that was deployed. But we were running out of time. It was 9AM and people from other teams were arriving one by one only to find an occasional service disruption. At this point, we didn't even bother checking the [Crashlytics](https://fabric.io/kits/android/crashlytics) dashboard because even the app was getting the same timeout errors. Our main website opened with an empty header since that's where we displayed the service categories we provided, since the API for that too was getting timed out. The frequency of this disruption exacerbated as the day progressed and more and more users started using the app.

The thing is, no one had any idea what caused it. Being amateur developers, we made one of the most common beginner mistakes - insufficient logging. _Gauri_ called up everyone in the team to come to office as soon as they can and it as a P0 situation. Most of them were in their deep sleep at this point and the few who answered also started panicking like crazy. While everyone was on their way, _Gauri_ told me the last thing I wanted to hear - _"Let's rollback the release."_. This was even more disgraceful. Something that you built was so bad that it had to be taken down. The release was already delayed by three days and I didn't want to get it delayed any further. I resisted and asked for a bit more time. Seeing that I hadn't given on this hopeless situation, _Gauri_ also decided to give me another hour and if nothing happens, she would rollback the release at 11AM.

---

# Finally, a ray of hope

After mindlessly testing and hopelessly trying to reproduce the issue on my local environment, I decided to test all the frontend apps on my machine. The first one that I had already setup on my laptop was the main website. I started randomly opening all the pages, tried creating a service request. Just when I tried creating a service request for some random category, the network request stalled and, for the first time in life, I was happy to see an error in browser console - **504 Gateway Timeout**. I screamed out _"Gauri! I could reproduce the issue on my machine!"_. I killed the server process, spawned it again, created the same request and the server timed out again. My happiness had no bounds at that time! By this time the other guys in our team also came in one by one and started maniacally glaring into their laptops, browsing through the code they wrote, nervously thinking whether their code was the culprit. Meanwhile, _Gauri_ was on her newly acquired routine on the production server - monitor, kill, spawn again, repeat.

But, then came a sudden twist. My fellow teammate tried created a service request on his machine and it worked. Some guy created one on staging and it worked. Hell, someone created one on production too and it worked! In a second, all my happiness got flushed out and I was back to stage one. To my utter disgusting surprise, even I couldn't reproduce it on my machine now. I almost surrendered and gave in for the idea of rolling back the release, but then I checked why it went 100% CPU for that specific case. I furiously kept hitting the back button on the browser until I reached that page where I was able to reproduce the issue. And voila! It went 100% again.

It was for the plumber category that the issue got reproduced. I tried to replicate it on staging, couldn't reproduce. I tried it on my teammate's machine, couldn't replicate it. Tried on production, went 100% again. I wanted to double check whether this was because of my request and not someone else's, I reproduced it 10 times in a row. And yes, it was reproduced exactly when I opened the plumber category page. I knew it was not an environment specific issue for sure. Meanwhile I had isolated the code block where this was happening and that's where I got the breakthrough.

# Digging into the code

While our investigation was still going on, it was well past 11AM now. I could glance at the other side where the operations team was seated to find them browsing Facebook, playing games, some busy doing work not related to the dashboard, some falling back to trusted old Excel sheets. Overall, it was a very depressing scene wherein the operations team and customer support teams weren't able to do their work because of some fuck up on our end. I felt really ashamed of myself as I was still not able to debug the issue.

While reading the relevant code, the problematic part was a function which looked  like this,

```python{numberLines: true}
from datetime import datetime, time, date

from dateutil.relativedelta import relativedelta

def get_next_slot(work_timings, duration):
    start_hour, end_hour = map(int, work_timings.split('-'))
    start_datetime = datetime.combine(date.today(), time(hour=start_hour))
    end_datetime = datetime.combine(date.today(), time(hour=end_hour))
    slot = relativedelta(minutes=duration)

    while start_datetime.time() <= end_datetime.time():
        end_slot = start_datetime + relativedelta(minutes=duration)

        yield start_datetime.time(), end_slot.time()
        start_datetime = end_slot
```
**NOTE:** The above snippet is not the exact piece of code that was causing the issue. This is a workable example written from the memory I had of that incident.

A `while` loop with an unclear loop invariant. What could possibly go wrong! But actually, nothing in this code was incorrect. The conditions were correct it would give right output for a lot of cases which I had generated in my mind. Let's say, for work timings `9-18` (9AM in the morning till 6PM in the evening) and duration of `30` minutes per slot, the above function would generate the following output,

```python
(datetime.time(9, 0), datetime.time(9, 30))
(datetime.time(9, 30), datetime.time(10, 0))
(datetime.time(10, 0), datetime.time(10, 30))
(datetime.time(10, 30), datetime.time(11, 0))
(datetime.time(11, 0), datetime.time(11, 30))
(datetime.time(11, 30), datetime.time(12, 0))
(datetime.time(12, 0), datetime.time(12, 30))
(datetime.time(12, 30), datetime.time(13, 0))
(datetime.time(13, 0), datetime.time(13, 30))
(datetime.time(13, 30), datetime.time(14, 0))
(datetime.time(14, 0), datetime.time(14, 30))
(datetime.time(14, 30), datetime.time(15, 0))
(datetime.time(15, 0), datetime.time(15, 30))
(datetime.time(15, 30), datetime.time(16, 0))
(datetime.time(16, 0), datetime.time(16, 30))
(datetime.time(16, 30), datetime.time(17, 0))
(datetime.time(17, 0), datetime.time(17, 30))
(datetime.time(17, 30), datetime.time(18, 0))
(datetime.time(18, 0), datetime.time(18, 30))
```

Then I looked up why it was failing for the plumber category. I checked the database and got the entry timeslot definitions. The work timings were `9-23` (9AM in the morning till 11PM at night) and duration was `60` minutes. I mentally evaluated the code and I still couldn't get what was happening  here. Meanwhile, the guy who had written this code was pulling his hair out trying to understand what's happening here while staring at my screen. Then it clicked! It was the biggest WTF moment of my life. I figured out why it failed and I started laughing hysterically. Everyone was astonished at first, giving me an eager look, waiting for me to stop laughing so that they get to know what the hell this issue really was. The guy who wrote the code started shaking me fiercely, _"Tejas, what the hell happened? Tell me! What was the issue? Please tell me ASAP. Stop laughing, you moron!"_.

I somehow caught my breath and regained by senses, and saw the entire section of the office was staring at me - our team, HR, product managers, a few guys from the operations team, marketing guys, and even our CEO - all of them waiting for that one answer. I quickly stabilized myself, looked at that helpless guy and started asking him simple date and time arithmetic,

> Me: How much is 9 AM + 1 hour?
>
> Him: Stop this stupid thing. Tell me what happened!
>
> Me: You will figure out yourself. Just give me the answer.
>
> Him: 10AM
>
> Me: +1 hour?
>
> Him: 11 AM.
>
> Me: Okay. What's 10PM  + 1 hour?
>
> Him: 11PM
>
> Me: +1 hour?
>
> Him: 12AM.
>
> Me: No. In 24 hour format?
>
> Him: 0 hours. Wait! oh... fuck!
>
> Me: Yes! Python `time` objects use 24-hour format instead of 12-hour format. And 0 hours is still less than 23 hours, which still satisfies the loop criteria. Since time is cyclic, this condition will always be true and thus your while loop becomes an infinite loop. Moreover, you're yielding the timeslots at each iteration which explains the slow rise in RAM usage, and infinite loop explains why CPU went 100%.

It was the biggest 'Aha' moment on the floor. I could see a lot of them holding their heads and some still processing what I explained. Of all, _Gauri_ was giving her widest smile. One by one I was giving an explanation to everyone what happened and how it became an infinite loop. The poor guy put his head down on the table thinking how he couldn't catch this one case and even he gave a smile in the end.

The reason it was never captured on his machine or on the staging server was because no one had tested that condition! Whereas, just the night before the deployment, I had dumped the production data for categories on my local database for testing out a few things. But I never tested the website, so it wasn't caught even on my machine.

# Resolution

It was really simple. Just compare the `datetime` objects instead of `time` objects so that at 12AM, the day also increments which no longer satisfies the loop conditions and the loop breaks out.

The change was quickly made, tested on the same category. This time it worked without blowing the CPU usage off the roof. I still didn't understand why did he prefer comparing `time` objects instead of `datetime` objects. But it's fine. The patch was pushed on production and it worked correctly now for that same category. All dashboards were up and working and everybody, after enjoying their little free time, were back to their work. It was 12PM by now. I was definitely a zombie at this point. I spend another few hours figuring out other such pieces in code along with other team members and finally left for home early at 4PM.

---

# Important takeaways

* NEVER EVER DO BIG BANG RELEASES! Release incrementally, in small chunks. It's easier to find needle among a few sticks of hay than an entire haystack.
* Logging is crucial. Learn how to log. Though I personally would not recommend, but log at every checkpoint in the code. If feel you would be inundated with logs, use log levels _(DEBUG, INFO, WARNING, ERROR)_ and configure it with environment flags.
* No matter how rigorous QA testing you do, some things still escape the eyes of all. We can't help it. But at least ensure that all the cases already defined by the business teams are fully covered in the tests.
* Software engineers are humans. They can't be right all the time. Neither can someone think of all possible edge cases that may arise in the code, let alone something that would be defined by the end user. Empathize them and understand that such issues are not because they are incompetent but rather something which was inevitable. Rather I would think of that incident this way - of the 10K+ lines of code that went on production, only one line was the culprit.
* To this day, I really appreciate _Gauri_'s stand. She's very strict in maintaining code quality and business logic implementation, and scolded us a lot for our mistakes. But in that moment, she was the only one who was fighting for us against the whole company and gave us as much time as she could afford. Not only her, even our CEO was very relaxed and despite knowing that every minute that we spent debugging this issue costed him money, he still supported us and didn't freak out either. Things would have gone horribly wrong if it wasn't for them. As a manager, stressing out your teams in such situations just makes everything worse. The team needs someone who would shield them from everyone else while they just focus on fixing the issue.
