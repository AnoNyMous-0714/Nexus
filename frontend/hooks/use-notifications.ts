"use client"

/**
 * Custom hook for managing notifications
 * Handles browser push notification permissions and display
 */
import { useEffect, useState, useCallback } from "react"

interface Notification {
  id: string
  title: string
  message: string
  type: "match" | "message" | "info"
  timestamp: number
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default")

  useEffect(() => {
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("[v0] Browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      setPermissionStatus("granted")
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)
      return permission === "granted"
    }

    return false
  }, [])

  const sendNotification = useCallback(
    (title: string, message: string, type: "match" | "message" | "info" = "info") => {
      const notificationId = `${Date.now()}`

      // Add to state for UI display
      setNotifications((prev) => [...prev, { id: notificationId, title, message, type, timestamp: Date.now() }])

      // Send browser notification if permission is granted
      if (Notification.permission === "granted") {
        new Notification(title, {
          body: message,
          icon: "/heart-icon.png",
          badge: "/badge.png",
          tag: type,
        })
      }

      // Auto-remove after 4 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      }, 4000)

      return notificationId
    },
    [],
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return {
    notifications,
    sendNotification,
    removeNotification,
    requestPermission,
    permissionStatus,
  }
}
