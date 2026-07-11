import { getLogicalDateString } from "./dateUtils";

export function isSubscriptionEditable(subscription: any): boolean {
    if (!subscription || subscription.type !== 'caldav') return false;
    if (subscription.readonly === true) return false;
    const provider = subscription.provider || 'generic';
    if (provider === 'wecom') return true;
    if (provider === 'dingtalk') return false;
    if (provider === 'feishu') return false;
    if (provider === 'qq') return false;
    return subscription.caldavEditable !== false;
}

export function isSubscriptionDeletable(subscription: any): boolean {
    if (!subscription || subscription.type !== 'caldav') return false;
    if (subscription.readonly === true) return false;
    const provider = subscription.provider || 'generic';
    if (provider === 'wecom') return true;
    if (provider === 'qq') return true;
    if (provider === 'feishu' || provider === 'dingtalk') return false;
    return subscription.caldavDeletable !== false;
}

export function isEventPast(event: any): boolean {
    const now = new Date();
    const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const formatTime = (d: Date) => {
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const today = formatDate(now);
    const currentTime = formatTime(now);

    if (!event.date) return false;

    const endD = event.endDate || event.date;
    const endT = event.endTime || event.time;

    if (endT) {
        if (endD < today) return true;
        if (endD > today) return false;
        return endT <= currentTime;
    } else {
        return endD < today;
    }
}

export async function getEnvironmentSafeAllReminders(
    plugin: any,
    projectId?: string,
    filterType?: 'sidebar' | 'matrix' | 'none'
): Promise<any> {
    try {
        const mainReminders = (plugin && typeof plugin.loadReminderData === 'function')
            ? await plugin.loadReminderData()
            : await plugin.loadData("reminder.json") || {};

        let filteredMainReminders = mainReminders;
        if (projectId) {
            filteredMainReminders = {};
            Object.keys(mainReminders).forEach(key => {
                const reminder = mainReminders[key];
                if (reminder && reminder.projectId === projectId) {
                    filteredMainReminders[key] = reminder;
                }
            });
        }

        const subscriptionData = (plugin && typeof plugin.loadSubscriptionData === 'function')
            ? await plugin.loadSubscriptionData()
            : await plugin.loadData("ics_subscriptions.json") || {};
        let subscriptions = subscriptionData ? Object.values(subscriptionData.subscriptions || {}) : [];

        if (projectId) {
            subscriptions = subscriptions.filter((sub: any) => sub.projectId === projectId);
        }

        let allReminders = { ...filteredMainReminders };

        for (const subscription of subscriptions as any[]) {
            if (subscription.enabled) {
                if (filterType === 'sidebar' && !subscription.showInSidebar) continue;
                if (filterType === 'matrix' && !subscription.showInMatrix) continue;

                const subTasks = (plugin && typeof plugin.loadSubscriptionTasks === 'function')
                    ? await plugin.loadSubscriptionTasks(subscription.id)
                    : await plugin.loadData(`subscribe/${subscription.id}.json`) || {};

                Object.keys(subTasks).forEach(key => {
                    const task = subTasks[key];
                    if (task.manualDelete) {
                        return;
                    }

                    if (task.repeat && task.repeat.enabled) {
                        allReminders[key] = {
                            ...task,
                            isSubscribed: true,
                            subscriptionId: subscription.id,
                            subscriptionType: subscription.type || task.subscriptionType || 'ics',
                            showNoteInCalendar: subscription.showNoteInCalendar,
                            caldavEditable: isSubscriptionEditable(subscription),
                            caldavDeletable: isSubscriptionDeletable(subscription),
                        };
                    } else {
                        const isPast = isEventPast(task);
                        const completed = task.completed || isPast;

                        allReminders[key] = {
                            ...task,
                            completed,
                            isSubscribed: true,
                            subscriptionId: subscription.id,
                            subscriptionType: subscription.type || task.subscriptionType || 'ics',
                            showNoteInCalendar: subscription.showNoteInCalendar,
                            caldavEditable: isSubscriptionEditable(subscription),
                            caldavDeletable: isSubscriptionDeletable(subscription),
                        };
                    }
                });
            }
        }

        return allReminders;
    } catch (error) {
        console.error('Failed to get environment safe reminders:', error);
        return {};
    }
}
