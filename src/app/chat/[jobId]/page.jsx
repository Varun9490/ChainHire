"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Globe, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { jobId } = params;
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [showTranslation, setShowTranslation] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (jobId) {
      initializeChat();
    }
  }, [jobId]);

  const initializeChat = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) {
        router.push("/login");
        return;
      }
      setUser(storedUser);

      const jobRes = await fetch(`/api/jobs/${jobId}`);
      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setJob(jobData);
        
        if (storedUser.userType === "client") {
          const proposalRes = await fetch(`/api/proposals/job/${jobId}`);
          if (proposalRes.ok) {
            const proposals = await proposalRes.json();
            const acceptedProposal = proposals.find(p => p.isAccepted);
            if (acceptedProposal) {
              setOtherUser(acceptedProposal.freelancerId);
            }
          }
        } else {
          setOtherUser({ name: jobData.clientName || "Client", _id: jobData.clientId });
        }
      }

      await fetchMessages();
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast.error("Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const detectLanguage = async (text) => {
    const patterns = {
      'en': /^[a-zA-Z\s.,!?]+$/,
      'hi': /[\u0900-\u097F]/,
      'es': /[áéíóúñü]/i,
      'fr': /[àâäéèêëïîôöùûüÿç]/i,
      'de': /[äöüß]/i,
      'zh': /[\u4e00-\u9fff]/,
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
      'ko': /[\uac00-\ud7af]/,
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }
    return 'en';
  };

  const translateMessage = async (text, targetLang = 'en') => {
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`);
      const data = await response.json();
      return data.responseData.translatedText;
    } catch (error) {
      console.error("Translation failed:", error);
      return text;
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const detectedLang = await detectLanguage(newMessage);
      setDetectedLanguage(detectedLang);

      const response = await fetch(`/api/chat/${jobId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          senderId: user._id,
          senderName: user.name,
          language: detectedLang,
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleTranslateMessage = async (messageId, text, targetLang = 'en') => {
    try {
      const translated = await translateMessage(text, targetLang);
      setTranslatedMessages(prev => ({
        ...prev,
        [messageId]: translated
      }));
    } catch (error) {
      console.error("Translation failed:", error);
      toast.error("Translation failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl"
        >
          Loading chat...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 p-4"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                Chat with {otherUser?.name || "User"}
              </h1>
              <p className="text-gray-400 text-sm">
                {job?.title || "Project Discussion"}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranslation(!showTranslation)}
            className="text-white border-gray-600 hover:bg-gray-800"
          >
            <Globe className="w-4 h-4 mr-2" />
            {showTranslation ? "Hide Translation" : "Show Translation"}
          </Button>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="h-[calc(100vh-200px)] overflow-y-auto space-y-4 mb-4">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="text-gray-400 text-lg">
                  No messages yet. Start the conversation!
                </div>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message._id || index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.senderId === user._id ? "justify-end" : "justify-start"}`}
                >
                  <Card className={`max-w-xs lg:max-w-md ${message.senderId === user._id ? "bg-blue-600 text-white" : "bg-gray-800 text-white"}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">
                          {message.senderName}
                        </div>
                        <div className="flex items-center gap-2">
                          {message.language && (
                            <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                              {message.language.toUpperCase()}
                            </span>
                          )}
                          {showTranslation && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleTranslateMessage(message._id || index, message.content)}
                              className="text-xs p-1 h-6 w-6"
                            >
                              <Globe className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm mb-2">
                        {message.content}
                      </div>
                      
                      {translatedMessages[message._id || index] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-xs bg-gray-700/50 p-2 rounded mt-2"
                        >
                          <div className="text-gray-300 mb-1">Translation:</div>
                          {translatedMessages[message._id || index]}
                        </motion.div>
                      )}
                      
                      <div className="text-xs opacity-75 mt-2">
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <motion.form
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={sendMessage}
          className="flex gap-3"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 text-white border-gray-700 focus:border-blue-500"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </motion.form>

        {detectedLanguage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Detected language: {detectedLanguage.toUpperCase()}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 