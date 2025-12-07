"use client";

import { useEffect, useRef, useCallback } from "react";

// Types
export interface AnalyticsEvent {
    eventType: string;
    eventCategory?: string;
    eventLabel?: string;
    eventValue?: number;
    metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
    pageLoadTime?: number;
    canvasInitTime?: number;
    firstPhotoLoadTime?: number;
    avgPhotoLoadTime?: number;
    totalPhotosLoaded?: number;
    connectionType?: string;
    connectionEffectiveType?: string;
}

// Simple UUID generator
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Helper to get or create session ID
function getSessionId(): string {
    if (typeof window === "undefined") return "";

    let sessionId = sessionStorage.getItem("analytics_session_id");

    if (!sessionId) {
        sessionId = generateUUID();
        sessionStorage.setItem("analytics_session_id", sessionId);
    }

    return sessionId;
}

// Helper to get UTM parameters
function getUTMParams() {
    if (typeof window === "undefined") return {};

    const params = new URLSearchParams(window.location.search);
    return {
        utmSource: params.get("utm_source") || undefined,
        utmMedium: params.get("utm_medium") || undefined,
        utmCampaign: params.get("utm_campaign") || undefined,
    };
}

// Helper to check if mobile
function isMobileDevice(): boolean {
    if (typeof window === "undefined") return false;
    return /Mobile|Android|iP(hone|od|ad)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        navigator.userAgent
    );
}

// Helper to get connection info
function getConnectionInfo() {
    if (typeof navigator === "undefined" || !("connection" in navigator)) {
        return { connectionType: undefined, connectionEffectiveType: undefined };
    }

    const connection = (navigator as any).connection;
    return {
        connectionType: connection?.type,
        connectionEffectiveType: connection?.effectiveType,
    };
}

export function useAnalytics() {
    const sessionId = useRef<string>("");
    const sessionInitialized = useRef(false);
    const pageStartTime = useRef<number>(0);

    // Initialize session
    const initSession = useCallback(async (blockedMobile: boolean = false) => {
        if (sessionInitialized.current) return;

        sessionId.current = getSessionId();
        const utm = getUTMParams();

        const payload = {
            sessionId: sessionId.current,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            referrer: document.referrer || undefined,
            ...utm,
            blockedMobile,
        };

        console.log("[Analytics] Initializing session:", payload);

        try {
            const response = await fetch("/pages/api/analytics/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("[Analytics] Session initialized:", data);
                sessionInitialized.current = true;
            } else {
                console.error("[Analytics] Session init failed:", await response.text());
            }
        } catch (error) {
            console.error("[Analytics] Failed to initialize analytics session:", error);
        }
    }, []);

    // Track event
    const trackEvent = useCallback(async (event: AnalyticsEvent) => {
        if (!sessionId.current) {
            console.warn("[Analytics] Session not initialized, initializing now...");
            await initSession();
        }

        const payload = {
            sessionId: sessionId.current,
            ...event,
        };

        console.log("[Analytics] Tracking event:", payload);

        try {
            const response = await fetch("/pages/api/analytics/event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.error("[Analytics] Event tracking failed:", await response.text());
            }
        } catch (error) {
            console.error("[Analytics] Failed to track event:", error);
        }
    }, [initSession]);

    // Track page view
    const trackPageView = useCallback(async (
        pagePath: string,
        pageTitle?: string,
        viewDuration?: number
    ) => {
        if (!sessionId.current) {
            console.warn("Session not initialized, initializing now...");
            await initSession();
        }

        try {
            await fetch("/pages/api/analytics/pageview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: sessionId.current,
                    pagePath,
                    pageTitle,
                    viewDuration,
                }),
            });
        } catch (error) {
            console.error("Failed to track page view:", error);
        }
    }, [initSession]);

    // Track performance
    const trackPerformance = useCallback(async (metrics: PerformanceMetrics) => {
        if (!sessionId.current) {
            console.warn("Session not initialized, initializing now...");
            await initSession();
        }

        const connectionInfo = getConnectionInfo();

        // Map field names to match API expectations
        const payload = {
            sessionId: sessionId.current,
            pageLoadTime: metrics.pageLoadTime,
            canvasInitTime: metrics.canvasInitTime,
            firstPhotoLoadTime: metrics.firstPhotoLoadTime,
            avgPhotoLoadTime: metrics.avgPhotoLoadTime,
            totalPhotosLoaded: metrics.totalPhotosLoaded,
            connectionType: connectionInfo.connectionType || metrics.connectionType,
            connectionEffectiveType: connectionInfo.connectionEffectiveType || metrics.connectionEffectiveType,
        };

        console.log("[Analytics] Tracking performance:", payload);

        try {
            const response = await fetch("/pages/api/analytics/performance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.error("[Analytics] Performance tracking failed:", await response.text());
            }
        } catch (error) {
            console.error("[Analytics] Failed to track performance:", error);
        }
    }, [initSession]);

    // End session
    const endSession = useCallback(async () => {
        if (!sessionId.current) return;

        try {
            await fetch("/pages/api/analytics/session", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: sessionId.current,
                }),
            });
        } catch (error) {
            console.error("Failed to end session:", error);
        }
    }, []);

    // Auto-initialize session on mount
    useEffect(() => {
        const isMobile = isMobileDevice();
        const isDesktop = !isMobile;

        // Check if it's the main portfolio page
        const isPortfolioPage = window.location.pathname === "/";

        if (isPortfolioPage && isMobile) {
            // Track that a mobile user tried to access but was blocked
            initSession(true);
            trackEvent({
                eventType: "mobile_blocked",
                eventCategory: "access",
                eventLabel: "mobile_device_blocked",
            });
        } else if (isPortfolioPage && isDesktop) {
            // Normal desktop initialization
            initSession(false);
        } else {
            // Other pages
            initSession(false);
        }

        // Track page view
        pageStartTime.current = Date.now();
        trackPageView(window.location.pathname, document.title);

        // Track page load performance
        if (typeof window !== "undefined" && window.performance) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

            if (pageLoadTime > 0) {
                trackPerformance({ pageLoadTime });
            }
        }

        // End session on page unload
        const handleBeforeUnload = () => {
            const duration = Math.floor((Date.now() - pageStartTime.current) / 1000);

            console.log("[Analytics] Page unload - ending session, duration:", duration, "seconds");

            // Use synchronous fetch with keepalive for reliable tracking on page exit
            if (sessionId.current) {
                // End session
                fetch("/pages/api/analytics/session", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: sessionId.current }),
                    keepalive: true, // Ensures request completes even if page unloads
                }).catch(err => console.error("[Analytics] Failed to end session:", err));

                // Track final page view duration
                fetch("/pages/api/analytics/pageview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: sessionId.current,
                        pagePath: window.location.pathname,
                        pageTitle: document.title,
                        viewDuration: duration,
                    }),
                    keepalive: true,
                }).catch(err => console.error("[Analytics] Failed to track final page view:", err));
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [initSession, trackEvent, trackPageView, trackPerformance]);

    return {
        trackEvent,
        trackPageView,
        trackPerformance,
        endSession,
    };
}
