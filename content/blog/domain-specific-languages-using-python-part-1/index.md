---
title: "Domain Specific Languages using Python"
slug: "/domain-specific-languages-using-python-part-1"
date: "2016-06-05T13:19:00.000Z"
featured: false
draft: false
tags: ["python","dsl","programming"]
---

import Gist from "react-gist"

# Introduction

If you don't know about DSLs _(Domain Specific Languages)_, they are intermediate languages used purely for convenience and focus more on the actual business requirements than code. They give a beautiful makeup to their underlying ugly implementation code. They often provide higher level abstractions to frequently performed tasks. DSLs are mostly intended for people who don't write code but, actually, decide the logic and business flow or those who do data analysis.

For example, suppose a business is specifically targeting adults in its next campaign. Here, we would want to fetch all users having age greater than or equal to 18 years. An SQL query for this would look like,
```sql
SELECT * FROM users WHERE age >= 18;
```
In the above code, how much percentage of code actually conveys the business logic? I think except for `users` and `age >= 18`, rest everything is just boilerplate code that has nothing to do with the user or his/her age. Now, how about this,
```
User.age >= 18
```
Short and simple, isn't it? But, then my fellow programmer friends would say,

* _"That looks incomplete!"_
* _"Where's the object definition?"_
* _"Where's the output handler?"_
* _"You didn't even mention the database connection part. How is it supposed to know where to fetch from?"_

Exactly! Why should a non-programmer bother about these trivial things if all the above code accurately conveys the business requirement in minimum corpus? Just a text box where they can put their minimal code, hit the execute button and _lo_, you got your list of users. No need to carry around your programmer guy for each of your business meetings. All the boilerplate code (object definitions, variable initializtion, etc.), backend complexities, error handling is what programmers have to deal with, not the business team. From their perspective, this is more of a boon (although, a UI solution would be a _dream-come-true_ for them). The best part is, DSLs isolate your code and logic which, I feel, is just way too awesome! Welcome to the world of DSLs!

# Language features

Let's decide what our language can do.

1. Assigning variables.
2. Perform basic arithmetic between constants and variables.
3. Perform basic IO like printing output and reading input from keyboard.

That's it for the first version. We will build a purely mathematical language and eventually add more complex features like strings, conditions, loops and functions.

# Syntax

The essence of DSLs is simple and readable syntax. We will try to make the syntax as minimal as possible but without affecting the readability.

```{numberLines: true}
define pi 3.14159
input radius

define circumference 2 * pi * radius
output circumference
output pi * r * r
```

Our simple language can take input from the user, print the output and can do some basic arithmetic with variables. I've written a very basic implementation for the above syntax. Check the code below. I've added comments everywhere so that the code becomes pretty easy to understand.

<Gist id="b79980055bb7a9e56e9476e9a19a5ead" />

# Execution

To see it in action, download the above files `main.py` and `utils.py` in a folder. Make sure you have Python 3 installed. Run the `main.py` file and enter our DSL code line by line.
```bash{outputLines: 2-9}
python3 main.py
> define pi 3.14159
> input radius
5
> define circumference 2 * pi * radius
> output circumference
31.4159
> output pi * radius * radius
78.53975
```
Exit the console with <kbd>CTRL</kbd>+<kbd>C</kbd>.

# Conclusion
This is just the beginning. We can add so much more in the above example like adding loops, conditions, functions, etc. But that remains out of this demonstration. This was just to show you can making your own language is not hard at all. All it needs is a really well thought syntax keeping the stakeholders' convenience in mind. After all, that's what DSLs are for.

On a side note,
> Python has always amazed me. Not for the fact that it is beginner friendly and, at the same time, quite powerful to be used in complex mathematical and scientific calculations. But, it is one such language which gives you quite a lot of surprises every time. The moment you feel that you got a grip of the language and its standard libraries, something pops up that you never expected could be done by it.
