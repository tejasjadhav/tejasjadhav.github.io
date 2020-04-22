---
title: "The Actor model"
slug: "/the-actor"
date: "2016-04-22T18:56:51.000Z"
featured: false
draft: false
tags: ["actor model","architecture","model","concept"]
---

# The Model

Have you heard of the _Actor model_ in context of software architecture before? If you have, then continue reading for a quick revision; else, be prepared to understand one of the most amazing software architectures ever thought of. The Actor model somewhat works like this:

* There's a guy called as the _Actor_ who is extremely good at doing one specific thing. He also has some good letter writing skills.
* Imaging this guy is kept alone in a closed room without windows and doors, but just a small letter slot.
* All this guy has to do is, whenever he gets a letter from the letter slot, he reads it, writes his reply in a new letter and sends the new letter out from the same letter slot.
* The guy doesn't know from whom he received the letter and doesn't even know who will read his letter. All he has to do is respond to the incoming letters. If the content of the letter is intended for him, he can reply. Else, he may just ignore.
* The guy who is sending him the letter can be another _Actor_ sitting in some other closed room like him or any third party agent.

This is it. This is called the _Actor model_. This model is pretty close to pure functional programming if you relate _Actors_ to _functions_. In fact, one of the high functional programming language, Erlang, is completely based out of the _Actor model_.

## What's so great about this model

Imagine, individual entities doing their own job without having a dependency on any other entity and exchanging data through strict message passing. Doesn't that sound great? Since _Actors_ are restricted from communicating directly with each other, we can ensure that communication between them is transparent. Another interesting thing is, it's more of a Publisher-Subscriber (PubSub) architecture where the _Actors_ send the message out in the wild. Other _Actors_ can read this message and if they find something in that message that is related to their job, they can reply back with another message and it all across.

As _Actors_ perform like individual entities, they can be put anywhere as long as the messaging channel is available to them. Think of this in context with servers distributed across a huge network. Each server is an _Actor_ and the network is the messaging channel.

I mentioned earlier that _Actor model_ strongly resembles functional programming. Here's a small piece of code to demonstrate that,

```python{numberLines: true}
def apple_actor(message):
    if message.contains('apple'):
        return 'An Apple a day, keeps the doctor away.'

def length_actor(message):
    if len(message) > 10:
        return 'That was some really some long message.'
```

The `apple_actor` is concerned with only those messages which have the word `apple` in them. Similarly, `length_actor` is concerned with only those messages which are more than `10` characters. So, despite the fact that they may receive all the messages, they will respond to only those with whom they are related to. In return, they will respond with another message which will be broadcast everywhere.

For instance, `length_actor` can respond to the response of `apple_actor` since it exceeds the 10 character count. This is how _Actors_ actually communicate without knowing the source or destination.

Since these entities _act_ to certain messages, they are called _Actors_.
