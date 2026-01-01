import Notification from "@/models/Notification";

/**
 * Create a notification for a user
 */
export async function createNotification({ userId, type, title, message, relatedJob, relatedProposal }) {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            relatedJob,
            relatedProposal,
        });
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(notifications) {
    try {
        const created = await Notification.insertMany(notifications);
        return created;
    } catch (error) {
        console.error("Error creating bulk notifications:", error);
        return [];
    }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId) {
    try {
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );
        return notification;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return null;
    }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId) {
    try {
        const result = await Notification.updateMany(
            { userId, read: false },
            { read: true }
        );
        return result;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return null;
    }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId) {
    try {
        const count = await Notification.countDocuments({ userId, read: false });
        return count;
    } catch (error) {
        console.error("Error getting unread count:", error);
        return 0;
    }
}
