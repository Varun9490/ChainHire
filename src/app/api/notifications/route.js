import { connectDB } from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { getUnreadCount, markAllAsRead, markAsRead } from "@/utils/notifications";
import jwt from "jsonwebtoken";

/**
 * GET /api/notifications - Fetch user notifications
 */
export async function GET(req) {
    await connectDB();

    try {
        // Get userId from token
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const unreadOnly = searchParams.get("unreadOnly") === "true";

        const query = { userId };
        if (unreadOnly) {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .populate("relatedJob", "title")
            .populate("relatedProposal", "proposedAmount")
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const unreadCount = await getUnreadCount(userId);

        return Response.json({
            notifications,
            unreadCount,
            total: notifications.length,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return Response.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/notifications - Mark notification(s) as read
 */
export async function POST(req) {
    await connectDB();

    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const body = await req.json();
        const { notificationId, markAll } = body;

        if (markAll) {
            await markAllAsRead(userId);
            return Response.json({ message: "All notifications marked as read" });
        } else if (notificationId) {
            const notification = await markAsRead(notificationId);
            if (!notification) {
                return Response.json({ error: "Notification not found" }, { status: 404 });
            }
            return Response.json({ message: "Notification marked as read", notification });
        } else {
            return Response.json({ error: "Invalid request" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return Response.json(
            { error: "Failed to mark notifications as read" },
            { status: 500 }
        );
    }
}
