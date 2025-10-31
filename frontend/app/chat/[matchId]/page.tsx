/**
 * Enhanced Chat page with message notifications and better UI
 */
"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Send, ArrowLeft, Smile } from "lucide-react"
import Link from "next/link"
import { useNotifications } from "@/hooks/use-notifications"

interface Message {
  _id: string
  sender: string
  content: string
  createdAt: string
  isRead: boolean
}

interface MatchInfo {
  _id: string
  user1: {
    _id: string
    name: string
    profilePicture?: string
  }
  user2: {
    _id: string
    name: string
    profilePicture?: string
  }
}

export default function ChatPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const matchId = params.matchId as string
  const { sendNotification } = useNotifications()

  const [messages, setMessages] = useState<Message[]>([])
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null)
  const [messageContent, setMessageContent] = useState("")
  const [sending, setSending] = useState(false)
  const [loadingChat, setLoadingChat] = useState(true)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (token && matchId) {
      fetchMessages()
      // Poll for new messages every 2 seconds
      const interval = setInterval(fetchMessages, 2000)
      return () => clearInterval(interval)
    }
  }, [token, matchId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (messages.length > lastMessageCount) {
      const newMessage = messages[messages.length - 1]
      if (newMessage.sender !== user?._id) {
        sendNotification("New message", "You received a new message in your chat", "message")
      }
      setLastMessageCount(messages.length)
    }
  }, [messages, user?._id, sendNotification, lastMessageCount])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
      setLoadingChat(false)
    } catch (err) {
      console.error("Failed to fetch messages:", err)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageContent.trim()) return

    try {
      setSending(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId,
          content: messageContent,
        }),
      })

      if (response.ok) {
        setMessageContent("")
        await fetchMessages()
      }
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setSending(false)
    }
  }

  if (loading || loadingChat) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Heart className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse-subtle" />
          <p className="text-muted">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto w-full px-4 py-4 flex items-center justify-between">
          <Link href="/matches" className="flex items-center gap-2 text-foreground hover:text-accent transition">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-lg font-bold text-foreground">Message</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center p-4 bg-accent/10 rounded-full mb-4">
                <Smile className="w-8 h-8 text-accent" />
              </div>
              <p className="text-foreground font-medium">Start the conversation!</p>
              <p className="text-sm text-muted mt-1">Say something nice to get the ball rolling</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender === user._id ? "justify-end" : "justify-start"} animate-scale-in`}
              >
                <div
                  className={`max-w-xs px-5 py-3 rounded-2xl ${
                    message.sender === user._id
                      ? "bg-accent text-secondary rounded-br-none"
                      : "bg-card border border-border text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-card border-t border-border">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto w-full px-4 py-4 flex gap-3">
          <Input
            type="text"
            placeholder="Type a message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            disabled={sending}
            className="input-focus bg-input/50 border-border flex-1"
          />
          <Button
            type="submit"
            disabled={sending || !messageContent.trim()}
            className="bg-accent hover:bg-accent/90 text-secondary px-6 btn-glow disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </main>
  )
}
