---
name: t
description: describes how agent tasks work
---

# Tasks

The tasks are located in an `.agents/tasks` directory, or `[project-name].agents/tasks` for projects

## Read a task

Read `.agents/tasks/[task-name]` to list the task files. If a `state.md` file is there read it: it details the task progression.

## Write to a task

Check if an `.agents/tasks/[task-name]` directory exists, if not create it. You can write markdown files in it.

## Execute or continue a task

Check what is remaining to do. Avoid verifying previous phases and execute the relevant phase(s) directly

## To do after a task is executed or created

If the task is completed ask the user to confirm if everything is all right. If yes delete the task directory.

If the task is not completed create or update`.agents/tasks/[task-name]/state.md` to indicate briefly what was done and what remains to do to complete the quickstart task. This file should contains step by step instructions and their state.