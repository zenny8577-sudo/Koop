import axios from 'axios';

export const WooCommerceService = {
  async importProducts(storeUrl: string, consumerKey: string, consumerSecret: string) {
    const response = await axios.get(`${storeUrl}/wp-json/wc/v3/products`, {
      params: {
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      }
    });
    return response.data;
  },

  async syncInventory(productId: string, stockQuantity: number) {
  }
};