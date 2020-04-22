---
title: "Common database table design patterns"
slug: "/common-database-table-designs"
date: "2019-01-05T05:24:42.000Z"
featured: false
draft: true
tags: ["programming","database","table","design"]
---

> This article is yet to be finished.

# Content

These tables are for storing pure content. A really good example would be blog articles. This data is often formatted and showed to the end users over a read-only channel. There is usually a moderator or an editor who can change this data.

It often has full CRUD (create-read-update-delete) access though certain actions are restricted to certain roles. For example, a blog editor can create, update or even delete an article but the end user can only read it.

This data can be accessed and controlled with pure RESTful APIs and they usually have a 1:1 mapping with the database actions - POST for create, GET for read, PUT/PATCH for update and DELETE for deleting.

# Transaction

These are immutable datasets. Once added, no data can be changed or deleted. These are ideal for storing transactional activities like book keeping, virtual currencies, etc. They also feature a non-serial primary key or unique key (a random string or UUID or equivalent) so that the sequence cannot be predicted.

It only has CR (create-read) access, though in certain cases, minor updates are allowed which do not drastically affect the transactional data.

Access to the data is usually access controlled and isolated for users. Users cannot access each others' data and can neither modify their own. Usually RESTful practices are limited because of limited data access.

# Log

These tables are used for recording change in data for a given table.  Similar to transaction tables, these are immutable. They denote the history of value a field at a given point in time. Common use cases are value transitions, changelog, etc.

Like transaction tables, these are strictly CR (create-read). Occasionally, they also contain information about the user who made the change and reason for change.

<figure>
<table class="monospace">
    <thead>
        <tr>
            <th>_id</th>
            <th>profile_id</th>
            <th>field</th>
            <th>value</th>
            <th>user_id</th>
            <th>comment</th>
            <th>timestamp</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>12</td>
            <td>39</td>
            <td>status</td>
            <td>verified</td>
            <td>23</td>
            <td>User marked as verified after validating email.</td>
            <td>2019-01-02T15:32:12Z</td>
        </tr>
        <tr>
            <td>28</td>
            <td>39</td>
            <td>first_name</td>
            <td>Tejas</td>
            <td>23</td>
            <td>User changed profile information.</td>
            <td>2019-01-02T17:11:54Z</td>
        </tr>
        <tr>
            <td>31</td>
            <td>39</td>
            <td>status</td>
            <td>active</td>
            <td>23</td>
            <td>User activated after completing profile.</td>
            <td>2019-01-02T17:13:01Z</td>
        </tr>
    </tbody>
</table>

<figcaption>Example: Log table for tracking user profile changes</figcaption>
</figure>

Unlike previous tables, data from table is never directly exposed to the user. Thus there are no RESTful endpoints. Though they are seldom used for administrative purposes to track user activity and troubleshoot issues. Access for such purposes is usually done using a server-side rendered page or using custom internal APIs which are very specific to the use case.

# Mapping

These are only used for creating a relations between two or more tables. Such tables are often called many-to-many mapping tables, though, using appropriate UNIQUE keys, they can be restricted to many-to-one or even one-to-one mapping. They only store foreign keys to related tables. A good example would be assigning multiple tags to multiple articles.

Based on the behavior of the related tables, mapping tables can be CRUD (create-read-update-delete) or CR (create-read) only. Like log tables, they can also contain additional data for each mapping.

<table class="monospace">
    <thead>
        <tr>
            <th>_id</th>
            <th>order_id</th>
            <th>sku_id</th>
            <th>quantity</th>
            <th>timestamp</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>9</td>
            <td>87</td>
            <td>12</td>
            <td>1</td>
            <td>2019-01-02T12:09:35Z</td>
        </tr>
        <tr>
            <td>10</td>
            <td>87</td>
            <td>5</td>
            <td>5</td>
            <td>2019-01-02T12:09:58Z</td>
        </tr>
        <tr>
            <td>15</td>
            <td>91</td>
            <td>12</td>
            <td>2</td>
            <td>2019-01-02T13:01:19Z</td>
        </tr>
    </tbody>
</table>

Data from mapping tables is never exposed directly to the end user. It's always indirectly used along with data from content tables and related data is shown in nested fashion. Pure RESTful APIs will usually nest the related data.
