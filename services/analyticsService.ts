export class AnalyticsService {
  static trackEvent(eventName: string, properties: any = {}) {
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track(eventName, properties);
    }

    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        properties,
        timestamp: new Date().toISOString()
      }),
    }).catch(console.error);
  }

  static identifyUser(userId: string, traits: any = {}) {
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.identify(userId, traits);
    }
  }

  static pageView(pageName: string, properties: any = {}) {
    this.trackEvent('page_view', {
      page: pageName,
      ...properties
    });
  }
}