"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmojiPicker from "emoji-picker-react";

export default function ChatToolbar({
  onEmojiSelect,
  onImageUpload,
  onAudioStart,
  onAudioStop,
  isRecording,
  theme = "dark",
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Dialog open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={
              theme === "dark"
                ? "text-gray-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }
          >
            <span className="text-xl">😊</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Choose Emoji</DialogTitle>
          </DialogHeader>
          <EmojiPicker
            onEmojiClick={(emojiObject) => {
              onEmojiSelect(emojiObject);
              setShowEmojiPicker(false);
            }}
            theme={theme}
          />
        </DialogContent>
      </Dialog>

      <Input
        type="file"
        accept="image/*"
        id="image-upload"
        className="hidden"
        onChange={onImageUpload}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => document.getElementById("image-upload").click()}
        className={
          theme === "dark"
            ? "text-gray-400 hover:text-white"
            : "text-gray-600 hover:text-gray-900"
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={isRecording ? onAudioStop : onAudioStart}
        className={`${
          isRecording
            ? "text-red-500"
            : theme === "dark"
            ? "text-gray-400 hover:text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
            clipRule="evenodd"
          />
        </svg>
      </Button>
    </div>
  );
}
