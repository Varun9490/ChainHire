import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Picker } from "emoji-mart";
import data from "@emoji-mart/data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import io from "socket.io-client";
import toast from "react-hot-toast";

export default function Chat({ jobId, currentUser, otherUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [theme, setTheme] = useState("dark");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (jobId) {
      initializeSocket();
      fetchMessages();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [jobId]);

  const initializeSocket = async () => {
    await fetch("/api/socket");
    socketRef.current = io();

    socketRef.current.emit("join_chat", jobId);

    socketRef.current.on("message_received", (message) => {
      if (message.sender !== currentUser._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socketRef.current.on("user_typing", (user) => {
      setTypingUsers((prev) => [...prev, user]);
    });

    socketRef.current.on("user_stop_typing", (user) => {
      setTypingUsers((prev) => prev.filter((u) => u._id !== user._id));
    });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat?jobId=${jobId}`);
      if (response.ok) {
        const { messages: fetchedMessages } = await response.json();
        setMessages(fetchedMessages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = () => {
    socketRef.current?.emit("typing", { jobId, user: currentUser });
  };

  const handleStopTyping = () => {
    socketRef.current?.emit("stop_typing", { jobId, user: currentUser });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          await sendMessage(null, {
            messageType: "audio",
            content: base64Audio,
            metadata: { duration: recordingTime },
          });
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startRecordingTimer();
    } catch (error) {
      toast.error("Error accessing microphone");
      console.error("Error:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = async () => {
          await sendMessage(null, {
            messageType: "image",
            content: reader.result,
            metadata: {
              dimensions: {
                width: img.width,
                height: img.height,
              },
            },
          });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji.native);
    setShowEmoji(false);
  };

  const sendMessage = async (e, customContent) => {
    if (e) e.preventDefault();

    if (!customContent && !newMessage.trim()) return;

    const messageData = customContent || {
      messageType: "text",
      content: newMessage,
    };

    try {
      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          message: messageData.content,
          senderId: currentUser._id,
          messageType: messageData.messageType || "text",
          content: messageData.content,
          metadata: messageData.metadata || {},
        }),
      });

      if (response.ok) {
        const { message } = await response.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
        socketRef.current?.emit("new_message", message);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border border-gray-800">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full"
              />
            </div>
            <div className="space-y-2">
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="h-4 w-32 bg-gradient-to-r from-gray-700 to-gray-600 rounded"
              />
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.2,
                }}
                className="h-3 w-24 bg-gradient-to-r from-gray-700 to-gray-600 rounded"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={`flex ${
                  i % 2 === 0 ? "justify-end" : "justify-start"
                }`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                <div
                  className={`max-w-xs lg:max-w-md rounded-2xl p-4 ${
                    i % 2 === 0
                      ? "bg-gradient-to-br from-gray-700 to-gray-600"
                      : "bg-gradient-to-br from-gray-800 to-gray-700"
                  }`}
                >
                  <div className="h-4 w-32 bg-gradient-to-r from-gray-600 to-gray-500 rounded mb-2" />
                  <div className="space-y-1">
                    <div className="h-3 w-48 bg-gradient-to-r from-gray-600 to-gray-500 rounded" />
                    <div className="h-3 w-40 bg-gradient-to-r from-gray-600 to-gray-500 rounded" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border border-gray-800">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {otherUser?.name?.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          <div>
            <div className="font-semibold">
              {otherUser?.name || "Freelancer"}
            </div>
            <div className="text-sm text-gray-400">Active now</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <motion.div
          className="h-[400px] overflow-y-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                No messages yet. Start the conversation!
              </motion.p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((message, index) => {
                const { ref, inView } = useInView({
                  threshold: 0.5,
                  triggerOnce: true,
                });

                return (
                  <motion.div
                    ref={ref}
                    key={message._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      message.senderId === currentUser._id
                        ? "justify-end"
                        : "justify-start"
                    } mb-4`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 ${
                        message.senderId === currentUser._id
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                          : "bg-gradient-to-br from-gray-700 to-gray-800 text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-semibold">
                          {message.senderName.charAt(0)}
                        </div>
                        <span className="text-xs opacity-75">
                          {message.senderName}
                        </span>
                      </div>
                      <div className="text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div className="text-xs opacity-75 mt-1 flex items-center gap-1">
                        {new Date(message.createdAt).toLocaleTimeString()}
                        {message.senderId === currentUser._id && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-blue-300"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </motion.div>

        <div className="p-4 border-t border-gray-800">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 text-white border-gray-700 rounded-full px-4"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim()}
              className="rounded-full px-6"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-2"
              >
                <span>Send</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </motion.div>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
