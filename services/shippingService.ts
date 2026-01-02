import axios from 'axios';

export const ShippingService = {
  async createLabel(orderId: string) {
    const response = await axios.post('https://api.sendcloud.com/labels', {
      order_id: orderId,
      carrier: 'postnl'
    }, {
      headers: {
        Authorization: `Bearer ${process.env.SENDCLOUD_API_KEY}`
      }
    });
    return response.data.label_url;
  }
};