import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Users } from "lucide-react";
import { useChallengeChat } from "@/hooks/useChallenges";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface ChallengeChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
  challengeTitle: string;
  challengeEmoji: string;
}

export const ChallengeChatDialog = ({
  open,
  onOpenChange,
  challengeId,
  challengeTitle,
  challengeEmoji
}: ChallengeChatDialogProps) => {
  const { user } = useAuthContext();
  const { messages, isLoading, sendMessage, isSending } = useChallengeChat(challengeId);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage.trim());
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{challengeEmoji}</span>
            {challengeTitle}
          </DialogTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Чат участников</span>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <p className="text-4xl mb-2">💬</p>
              <p>Пока нет сообщений</p>
              <p className="text-sm">Начните общение с другими участниками!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.user_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={message.user_avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {message.user_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!isOwn && (
                          <span className="text-xs font-medium">{message.user_name}</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.created_at), { 
                            locale: ru, 
                            addSuffix: true 
                          })}
                        </span>
                      </div>
                      <div className={`inline-block p-3 rounded-2xl ${
                        isOwn 
                          ? 'bg-primary text-primary-foreground rounded-br-md' 
                          : 'bg-muted rounded-bl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Напишите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={isSending || !newMessage.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
