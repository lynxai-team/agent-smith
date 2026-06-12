---
name: t
description: describes how agent tasks work
---

# Tasks

The tasks are located in an `.agents/tasks` directory, or `[project-name].agents/tasks` for projects

## Read a task

Read `.agents/tasks/[task-name]` to list the task files. If a `state.md` file is there read it: it details the task progression.

## Create or update a task

Check if an `.agents/tasks/[task-name]` directory exists, if not create it. You can write markdown files in it.

When asked to create a task do it and then report to the user before executing the task

## Execute or continue a task

Check what is remaining to do. Avoid verifying previous phases and execute the next phase directly. Always execute the phases one by one. Update the sate after each phase to mark it done.

## After a task is executed or created: manage the state

When the task is completed it is important to ask the user if everything is all right. If he confirms you can then delete the task directory.

If the task is not completed create or update`.agents/tasks/[task-name]/state.md` to indicate briefly what was done and what remains to do to complete the quickstart task. This file should contains step by step instructions and their state.