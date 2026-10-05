// src/Data/productsData.js
import Product1 from '../../Images/Shop_Images/Product1.jpg';
// You can import other images here if you have them, e.g., Product2, Product3...

export const productsData = [
  { 
    id: 1, 
    name: 'Accu-Chek Instant', 
    category: 'Blood glucose meters', 
    price: 45, 
    // We use an array for multiple images. I'm reusing Product1 for demo purposes.
    images: [Product1, Product1, Product1, Product1], 
    desc: 'Instant clarity, instant confidence. Wireless connection to your phone.',
    deliveryTime: '2-3 Days'
  },
  { 
    id: 2, 
    name: 'OneTouch Verio', 
    category: 'Blood glucose meters', 
    price: 55, 
    images: [Product1, Product1, Product1, Product1], 
    desc: 'Simple and accurate testing. ColorSure technology highlights results.',
    deliveryTime: '2-3 Days'
  },
  { 
    id: 3, 
    name: 'NovoPen Echo', 
    category: 'Glucose pens', 
    price: 80, 
    images: [Product1, Product1, Product1, Product1], 
    desc: 'Memory function pen for kids. Records the last dose.',
    deliveryTime: '3-5 Days'
  },
  { 
    id: 4, 
    name: 'Humalog KwikPen', 
    category: 'Insulin', 
    price: 120, 
    images: [Product1, Product1, Product1, Product1], 
    desc: 'Rapid-acting insulin. Convenient pre-filled pen.',
    deliveryTime: 'Next Day Delivery'
  },
  { 
    id: 5, 
    name: 'Lantus SoloStar', 
    category: 'Insulin', 
    price: 135, 
    images: [Product1, Product1, Product1, Product1], 
    desc: 'Long-acting basal insulin for 24-hour sugar control.',
    deliveryTime: 'Next Day Delivery'
  },
  { 
    id: 6, 
    name: 'Alcohol Swabs (100pcs)', 
    category: 'Diabetes supplies', 
    price: 8, 
    images: [Product1, Product1, Product1, Product1], 
    desc: 'Sterile alcohol prep pads for skin preparation.',
    deliveryTime: '3-5 Days'
  },
  { 
    id: 7, 
    name: 'Test Strips (50pcs)', 
    category: 'Diabetes supplies', 
    price: 25, 
    images: [Product1, Product1, Product1, Product1], 
    desc: 'High precision test strips compatible with Accu-Chek.',
    deliveryTime: '2-3 Days'
  },
  { 
    id: 8, 
    name: 'FreeStyle Libre Sensor', 
    category: 'Blood glucose meters', 
    price: 90, 
    images: [Product1, Product1, Product1, Product1], 
    desc: 'Continuous glucose monitoring. No fingersticks required.',
    deliveryTime: '2-4 Days'
  },
];