export class EmailService {
  static async sendVerificationEmail(email: string, verificationLink: string) {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Verify your Koop account',
        template: 'verification',
        data: {
          verificationLink,
          companyName: 'Koop Marketplace'
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send verification email');
    }

    return response.json();
  }

  static async sendOrderConfirmation(email: string, orderDetails: any) {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Your Koop order confirmation',
        template: 'order_confirmation',
        data: orderDetails
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send order confirmation');
    }

    return response.json();
  }

  static async sendSellerNotification(email: string, productDetails: any) {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'New product submitted for review',
        template: 'seller_notification',
        data: productDetails
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send seller notification');
    }

    return response.json();
  }
}