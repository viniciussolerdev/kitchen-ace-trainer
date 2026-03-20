import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, X, CalendarPlus, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "new_booking" | "confirmed" | "cancelled";
  clientName: string;
  serviceName: string;
  time: string;
  createdAt: Date;
}

interface StoredState {
  knownIds: string[];
  statusMap: Record<string, string>;
  notifications: Array<Notification & { createdAt: string }>;
  unreadCount: number;
}

const STORAGE_KEY = "notification_bell_state";

function loadStoredState(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveStoredState(state: StoredState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const typeConfig = {
  new_booking: {
    icon: CalendarPlus,
    label: "Novo agendamento",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  confirmed: {
    icon: CheckCircle,
    label: "Confirmado",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelado",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
};

export function NotificationBell() {
  const { salonId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = loadStoredState();
    if (stored?.notifications) {
      return stored.notifications.map(n => ({ ...n, createdAt: new Date(n.createdAt) }));
    }
    return [];
  });
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(() => {
    const stored = loadStoredState();
    return stored?.unreadCount ?? 0;
  });
  const knownIdsRef = useRef<Set<string>>(new Set());
  const lastStatusMapRef = useRef<Map<string, string>>(new Map());
  const initializedRef = useRef(false);

  // Initialize refs from storage on mount
  useEffect(() => {
    const stored = loadStoredState();
    if (stored) {
      knownIdsRef.current = new Set(stored.knownIds);
      lastStatusMapRef.current = new Map(Object.entries(stored.statusMap));
      initializedRef.current = true;
    }
  }, []);

  // Save state to localStorage whenever notifications change
  useEffect(() => {
    const state: StoredState = {
      knownIds: Array.from(knownIdsRef.current),
      statusMap: Object.fromEntries(lastStatusMapRef.current),
      notifications: notifications.map(n => ({ ...n, createdAt: n.createdAt.toISOString() as any })),
      unreadCount,
    };
    saveStoredState(state);
  }, [notifications, unreadCount]);

  const addNotification = useCallback(
    (type: Notification["type"], clientName: string, serviceName: string, startTime: string, appointmentId: string) => {
      const notifId = `${appointmentId}-${type}-${Date.now()}`;
      const notification: Notification = {
        id: notifId,
        type,
        clientName,
        serviceName,
        time: new Date(startTime).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: new Date(),
      };

      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
    },
    []
  );

  useEffect(() => {
    if (!salonId) return;

    const checkForChanges = async () => {
      try {
        const { data: appointments, error } = await supabase
          .from("appointments")
          .select("id, status, start_time, created_at, booking_source, clients(name), services(name)")
          .eq("salon_id", salonId)
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false })
          .limit(20);

        if (error || !appointments) return;

        // On first load (no stored state), just record existing state
        if (!initializedRef.current) {
          appointments.forEach((apt) => {
            knownIdsRef.current.add(apt.id);
            lastStatusMapRef.current.set(apt.id, apt.status);
          });
          initializedRef.current = true;
          // Save initial state
          const state: StoredState = {
            knownIds: Array.from(knownIdsRef.current),
            statusMap: Object.fromEntries(lastStatusMapRef.current),
            notifications: [],
            unreadCount: 0,
          };
          saveStoredState(state);
          return;
        }

        for (const apt of appointments) {
          const clientName = (apt.clients as any)?.name || "Cliente";
          const serviceName = (apt.services as any)?.name || "Serviço";

          // New appointment
          if (!knownIdsRef.current.has(apt.id)) {
            knownIdsRef.current.add(apt.id);
            lastStatusMapRef.current.set(apt.id, apt.status);
            addNotification("new_booking", clientName, serviceName, apt.start_time, apt.id);
            continue;
          }

          // Status changed
          const prevStatus = lastStatusMapRef.current.get(apt.id);
          if (prevStatus && prevStatus !== apt.status) {
            lastStatusMapRef.current.set(apt.id, apt.status);
            if (apt.status === "confirmed") {
              addNotification("confirmed", clientName, serviceName, apt.start_time, apt.id);
            } else if (apt.status === "cancelled") {
              addNotification("cancelled", clientName, serviceName, apt.start_time, apt.id);
            }
          }
        }
      } catch (err) {
        console.error("[NotificationBell] Polling error:", err);
      }
    };

    checkForChanges();
    const interval = setInterval(checkForChanges, 15000);

    const channel = supabase
      .channel(`notif-${salonId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => checkForChanges()
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [salonId, addNotification]);

  const handleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    knownIdsRef.current = new Set();
    lastStatusMapRef.current = new Map();
    initializedRef.current = false;
    localStorage.removeItem(STORAGE_KEY);
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "agora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 max-h-96 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground text-sm">Notificações</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpar tudo
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-72">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((n) => {
                const config = typeConfig[n.type];
                const Icon = config.icon;
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 p-3 border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn("p-1.5 rounded-lg mt-0.5", config.bg)}>
                      <Icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        {config.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {n.clientName} • {n.serviceName}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        📅 {n.time}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap mt-0.5">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleOpen}
        className={cn(
          "relative h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95",
          isOpen
            ? "bg-muted text-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Bell className="h-5 w-5" />}

        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold animate-in zoom-in duration-200">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
