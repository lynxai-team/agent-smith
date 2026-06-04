/*
# tool
name: notify-user
description: use to send a notification to the user
arguments:
    title:
        description: 'the title of the notification. Format: "From [your-name]: notification title"'
        required: true
    message:
        description: the short to send to the user in a notification
        required: true
*/
// @ts-ignore
import pkg from 'node-notifier';
const { notify } = pkg;

async function action(args: Record<string, any>, options: Record<string, any>) {
    //console.log("NA", args);
    //console.log("NO", options);
    notify({
        message: args.message,
        title: args.title,
    });
    return "Done"
}

export {
    action,
}