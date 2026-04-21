import axios from 'axios';
import Papa from 'papaparse';

import { Product } from './types';

const googleSheetLink =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vT5OVvUu3-cRCPUaDRXpbV0tG8sa1IAaxx_OcVgpqLXfgMH6uyrn4trPzXk11dbdyG8IMVhkWFFx7G2/pub?output=csv';

const api = {
  getProducts: async (customUrl?: string): Promise<Product[]> => {
    const sheetUrl = customUrl || googleSheetLink;
    return axios
      .get(sheetUrl, { responseType: 'blob' })
      .then((response) => {
        // Papaparse does not use Promises, so we create a new one to use it.
        return new Promise<Product[]>((resolve, reject) => {
          Papa.parse(response.data, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              console.log('CSV Raw data:', results.data);
              console.log('CSV Errors:', results.errors);
              console.log('CSV Meta:', results.meta);
              
              const products = results.data as Product[];
              
              // Filtrar productos con datos válidos
              const validProducts = products.filter(product => {
                const hasTitle = product.title && product.title.trim() !== '';
                const hasPrice = product.price && !isNaN(Number(product.price));
                return hasTitle && hasPrice;
              });
              
              console.log('Valid products:', validProducts);
              console.log('Total products found:', validProducts.length);
              console.log('Sample product:', validProducts[0]);
              
              return resolve(
                validProducts.map((product, index) => ({
                  id: product.id || `product-${index}`,
                  title: product.title?.trim() || '',
                  category: product.category?.trim() || '',
                  description: product.description?.trim() || '',
                  image: product.image?.trim() || '',
                  price: Number(product.price) || 0,
                }))
              );
            },
            error: (error) => reject(error.message),
          });
        });
      });
  },
};
export default api;
