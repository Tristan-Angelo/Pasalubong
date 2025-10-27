// Mock data for admin dashboard

export const mockStore = null; // Not using global state store

export const mockQuery = null; // Not using API framework

export const mockRootProps = {
  // Admin Login Props
  adminLogin: {
    credentials: {
      username: "admin",
      password: "pasalubong123"
    }
  },
  
  // Admin Dashboard Props
  adminDashboard: {
    products: [
      { 
        id: 1, 
        sku: 'SKU-1001', 
        name: 'Ube Halaya', 
        category: 'Sweets', 
        price: 250, 
        stock: 15, 
        seller: "Maria's Store", 
        description: 'Traditional Filipino purple yam dessert', 
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300' 
      },
      { 
        id: 2, 
        sku: 'SKU-1002', 
        name: 'Dried Mangoes', 
        category: 'Snacks', 
        price: 180, 
        stock: 8, 
        seller: "Juan's Pasalubong", 
        description: 'Sweet and chewy dried mango strips', 
        image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300' 
      },
      { 
        id: 3, 
        sku: 'SKU-1003', 
        name: 'Barong Tagalog', 
        category: 'Clothing', 
        price: 1500, 
        stock: 3, 
        seller: 'Traditional Wear Co.', 
        description: 'Traditional Filipino formal shirt', 
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300' 
      }
    ],
    orders: [
      { 
        id: 1, 
        orderNumber: 'ORD-2024-001', 
        customer: 'Juan Dela Cruz', 
        amount: 430, 
        status: 'Processing', 
        date: '2024-01-15', 
        notes: 'Rush order' 
      },
      { 
        id: 2, 
        orderNumber: 'ORD-2024-002', 
        customer: 'Maria Santos', 
        amount: 250, 
        status: 'Completed', 
        date: '2024-01-14', 
        notes: '' 
      },
      { 
        id: 3, 
        orderNumber: 'ORD-2024-003', 
        customer: 'Pedro Garcia', 
        amount: 1680, 
        status: 'Pending', 
        date: '2024-01-16', 
        notes: 'Gift wrap requested' 
      }
    ],
    sellers: [
      { 
        id: 1, 
        name: 'Maria Santos', 
        email: 'maria@example.com', 
        phone: '+63 900 000 0001', 
        address: 'Cebu City', 
        storeName: "Maria's Store", 
        businessLicense: 'BL-2024-001', 
        storeDescription: 'Traditional Filipino sweets and delicacies', 
        image: 'https://i.pravatar.cc/150?img=1' 
      },
      { 
        id: 2, 
        name: 'Juan Dela Cruz', 
        email: 'juan@example.com', 
        phone: '+63 900 000 0002', 
        address: 'Manila', 
        storeName: "Juan's Pasalubong", 
        businessLicense: 'BL-2024-002', 
        storeDescription: 'Authentic Filipino snacks and treats', 
        image: 'https://i.pravatar.cc/150?img=2' 
      }
    ],
    riders: [
      { 
        id: 1, 
        name: 'Carlos Rodriguez', 
        email: 'carlos@example.com', 
        phone: '+63 900 000 0003', 
        address: 'Quezon City', 
        vehicleType: 'Motorcycle', 
        licenseNumber: 'A01-23-456789', 
        plateNumber: 'ABC-1234', 
        emergencyContact: '+63 900 000 0004', 
        image: 'https://i.pravatar.cc/150?img=3' 
      },
      { 
        id: 2, 
        name: 'Ana Reyes', 
        email: 'ana@example.com', 
        phone: '+63 900 000 0005', 
        address: 'Makati', 
        vehicleType: 'Bicycle', 
        licenseNumber: 'B02-34-567890', 
        plateNumber: 'DEF-5678', 
        emergencyContact: '+63 900 000 0006', 
        image: 'https://i.pravatar.cc/150?img=4' 
      }
    ],
    customers: [
      { 
        id: 1, 
        name: 'Juan Dela Cruz', 
        email: 'customer1@example.com', 
        phone: '+63 900 000 0007', 
        address: 'Taguig City', 
        image: 'https://i.pravatar.cc/150?img=5' 
      },
      { 
        id: 2, 
        name: 'Maria Santos', 
        email: 'customer2@example.com', 
        phone: '+63 900 000 0008', 
        address: 'Pasig City', 
        image: 'https://i.pravatar.cc/150?img=6' 
      },
      { 
        id: 3, 
        name: 'Pedro Garcia', 
        email: 'customer3@example.com', 
        phone: '+63 900 000 0009', 
        address: 'Mandaluyong City', 
        image: 'https://i.pravatar.cc/150?img=7' 
      }
    ]
  }
};