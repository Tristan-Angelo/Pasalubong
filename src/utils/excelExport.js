import * as XLSX from 'xlsx';

/**
 * Modern Excel Export Utility for Pasalubong Dashboard
 * Features: Enhanced styling, visual hierarchy, modern layout, and professional design
 */

// Enhanced color palette with gradients and modern tones
const COLORS = {
  // Primary brand colors
  primary: 'FFEF4444',        // Rose-500
  primaryDark: 'FFDC2626',    // Rose-600
  primaryLight: 'FFFEF2F2',   // Rose-50
  primaryMid: 'FFFECACA',     // Rose-200
  
  // Accent colors
  accent: 'FFF97316',         // Orange-500
  accentLight: 'FFFFF7ED',    // Orange-50
  accentMid: 'FFFED7AA',      // Orange-200
  
  // Status colors
  blue: 'FF3B82F6',           // Blue-500
  blueLight: 'FFEFF6FF',      // Blue-50
  blueMid: 'FFBFDBFE',        // Blue-200
  
  green: 'FF10B981',          // Green-500
  greenLight: 'FFF0FDF4',     // Green-50
  greenMid: 'FFA7F3D0',       // Green-200
  
  yellow: 'FFF59E0B',         // Yellow-500
  yellowLight: 'FFFEFCE8',    // Yellow-50
  yellowMid: 'FFFEF08A',      // Yellow-200
  
  purple: 'FF9333EA',         // Purple-500
  purpleLight: 'FFFAF5FF',    // Purple-50
  purpleMid: 'FFE9D5FF',      // Purple-200
  
  // Neutral colors
  gray: 'FF64748B',           // Slate-500
  grayLight: 'FFF8FAFC',      // Slate-50
  grayMid: 'FFE2E8F0',        // Slate-200
  grayDark: 'FF475569',       // Slate-600
  
  text: 'FF0F172A',           // Slate-900
  textMuted: 'FF475569',      // Slate-600
  border: 'FFE2E8F0',         // Slate-200
  white: 'FFFFFFFF'
};

/**
 * Create a modern styled cell with enhanced formatting
 */
const createModernCell = (value, options = {}) => {
  const {
    bgColor = COLORS.white,
    fontColor = COLORS.text,
    bold = false,
    fontSize = 11,
    alignment = 'left',
    verticalAlign = 'center',
    border = true,
    borderColor = COLORS.border,
    wrapText = false,
    italic = false
  } = options;

  const cell = {
    v: value,
    t: typeof value === 'number' ? 'n' : 's',
    s: {
      fill: { fgColor: { rgb: bgColor } },
      font: { 
        color: { rgb: fontColor }, 
        bold: bold,
        italic: italic,
        sz: fontSize,
        name: 'Inter'
      },
      alignment: { 
        vertical: verticalAlign, 
        horizontal: alignment, 
        wrapText: wrapText 
      }
    }
  };

  if (border) {
    cell.s.border = {
      top: { style: 'thin', color: { rgb: borderColor } },
      bottom: { style: 'thin', color: { rgb: borderColor } },
      left: { style: 'thin', color: { rgb: borderColor } },
      right: { style: 'thin', color: { rgb: borderColor } }
    };
  }

  return cell;
};

/**
 * Create a modern header cell with gradient-like effect
 */
const createModernHeader = (value, icon = '') => {
  return createModernCell(`${icon} ${value}`, {
    bgColor: COLORS.primary,
    fontColor: COLORS.white,
    bold: true,
    fontSize: 13,
    alignment: 'center',
    borderColor: COLORS.primaryDark
  });
};

/**
 * Create a section title cell
 */
const createSectionTitle = (value, bgColor = COLORS.primaryLight) => {
  return createModernCell(value, {
    bgColor: bgColor,
    fontColor: COLORS.text,
    bold: true,
    fontSize: 12,
    alignment: 'left',
    borderColor: COLORS.primaryMid
  });
};

/**
 * Create a metric card cell (for KPI display)
 */
const createMetricCard = (label, value, bgColor, iconColor = COLORS.text) => {
  return {
    label: createModernCell(label, {
      bgColor: bgColor,
      fontColor: iconColor,
      bold: true,
      fontSize: 11,
      alignment: 'left'
    }),
    value: createModernCell(value, {
      bgColor: COLORS.white,
      fontColor: COLORS.text,
      bold: true,
      fontSize: 12,
      alignment: 'right'
    })
  };
};

/**
 * Create an empty spacer row
 */
const createSpacerRow = (cols = 2) => {
  return Array(cols).fill(createModernCell('', { border: false }));
};

/**
 * Export dashboard summary to modern Excel format
 */
export const exportDashboardSummary = (data) => {
  const {
    statistics,
    products,
    orders,
    sellers,
    riders,
    customers,
    lowStockProducts,
    topProducts,
    orderStatusData,
    categoryData
  } = data;

  const wb = XLSX.utils.book_new();

  // ==================== MODERN OVERVIEW SHEET ====================
  const overviewData = [];
  
  // Hero Title Section
  overviewData.push([
    createModernCell('📊 PASALUBONG DASHBOARD', {
      bgColor: COLORS.primary,
      fontColor: COLORS.white,
      bold: true,
      fontSize: 16,
      alignment: 'center'
    })
  ]);
  
  overviewData.push([
    createModernCell('Executive Summary Report', {
      bgColor: COLORS.primaryMid,
      fontColor: COLORS.primaryDark,
      bold: false,
      fontSize: 11,
      alignment: 'center',
      italic: true
    })
  ]);
  
  // Timestamp with modern styling
  overviewData.push(createSpacerRow(2));
  overviewData.push([
    createModernCell('📅 Generated:', {
      bgColor: COLORS.grayLight,
      fontColor: COLORS.grayDark,
      bold: true,
      fontSize: 10
    }),
    createModernCell(new Date().toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    }), {
      bgColor: COLORS.white,
      fontColor: COLORS.text,
      fontSize: 10
    })
  ]);
  
  overviewData.push(createSpacerRow(2));

  // Sales & Revenue Section
  overviewData.push([
    createSectionTitle('💰 SALES & REVENUE', COLORS.greenLight)
  ]);
  
  const salesMetrics = [
    { label: '💵 Total Revenue', value: `₱${statistics.totalSales.toLocaleString()}`, bg: COLORS.greenLight, color: COLORS.green },
    { label: '📦 Total Orders', value: statistics.totalOrders.toLocaleString(), bg: COLORS.blueLight, color: COLORS.blue },
    { label: '📊 Avg Order Value', value: statistics.totalOrders > 0 ? `₱${(statistics.totalSales / statistics.totalOrders).toFixed(2)}` : '₱0.00', bg: COLORS.purpleLight, color: COLORS.purple }
  ];

  salesMetrics.forEach(metric => {
    const card = createMetricCard(metric.label, metric.value, metric.bg, metric.color);
    overviewData.push([card.label, card.value]);
  });

  overviewData.push(createSpacerRow(2));

  // Inventory Section
  overviewData.push([
    createSectionTitle('🏷️ INVENTORY STATUS', COLORS.purpleLight)
  ]);
  
  const inventoryMetrics = [
    { label: '📦 Total Products', value: statistics.totalProducts.toLocaleString(), bg: COLORS.purpleLight, color: COLORS.purple },
    { label: '⚠️ Low Stock Items', value: statistics.lowStockProducts.toLocaleString(), bg: COLORS.yellowLight, color: COLORS.yellow },
    { label: '✅ Stock Health', value: `${((1 - statistics.lowStockProducts / statistics.totalProducts) * 100).toFixed(1)}%`, bg: COLORS.greenLight, color: COLORS.green }
  ];

  inventoryMetrics.forEach(metric => {
    const card = createMetricCard(metric.label, metric.value, metric.bg, metric.color);
    overviewData.push([card.label, card.value]);
  });

  overviewData.push(createSpacerRow(2));

  // Operations Section
  overviewData.push([
    createSectionTitle('🚀 OPERATIONS', COLORS.blueLight)
  ]);
  
  const operationsMetrics = [
    { label: '⏳ Pending Orders', value: statistics.pendingOrders.toLocaleString(), bg: COLORS.yellowLight, color: COLORS.yellow },
    { label: '🚚 Active Deliveries', value: statistics.activeDeliveries.toLocaleString(), bg: COLORS.accentLight, color: COLORS.accent },
    { label: '✅ Completion Rate', value: `${statistics.totalOrders > 0 ? ((statistics.totalOrders - statistics.pendingOrders) / statistics.totalOrders * 100).toFixed(1) : 0}%`, bg: COLORS.greenLight, color: COLORS.green }
  ];

  operationsMetrics.forEach(metric => {
    const card = createMetricCard(metric.label, metric.value, metric.bg, metric.color);
    overviewData.push([card.label, card.value]);
  });

  overviewData.push(createSpacerRow(2));

  // User Base Section
  overviewData.push([
    createSectionTitle('👥 USER BASE', COLORS.accentLight)
  ]);
  
  const totalUsers = statistics.totalSellers + statistics.totalRiders + statistics.totalCustomers;
  const userMetrics = [
    { label: '🏪 Sellers', value: `${statistics.totalSellers} (${(statistics.totalSellers / totalUsers * 100).toFixed(1)}%)`, bg: COLORS.accentLight, color: COLORS.accent },
    { label: '🚚 Delivery Partners', value: `${statistics.totalRiders} (${(statistics.totalRiders / totalUsers * 100).toFixed(1)}%)`, bg: COLORS.blueLight, color: COLORS.blue },
    { label: '👤 Customers', value: `${statistics.totalCustomers} (${(statistics.totalCustomers / totalUsers * 100).toFixed(1)}%)`, bg: COLORS.purpleLight, color: COLORS.purple },
    { label: '📊 Total Users', value: totalUsers.toLocaleString(), bg: COLORS.grayLight, color: COLORS.gray }
  ];

  userMetrics.forEach(metric => {
    const card = createMetricCard(metric.label, metric.value, metric.bg, metric.color);
    overviewData.push([card.label, card.value]);
  });

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  
  // Enhanced column widths
  wsOverview['!cols'] = [
    { wch: 35 },
    { wch: 28 }
  ];

  // Merge cells for headers
  wsOverview['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },  // Main title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },  // Subtitle
    { s: { r: 5, c: 0 }, e: { r: 5, c: 1 } },  // Sales section
    { s: { r: 10, c: 0 }, e: { r: 10, c: 1 } }, // Inventory section
    { s: { r: 15, c: 0 }, e: { r: 15, c: 1 } }, // Operations section
    { s: { r: 20, c: 0 }, e: { r: 20, c: 1 } }  // User base section
  ];

  XLSX.utils.book_append_sheet(wb, wsOverview, '📊 Overview');

  // ==================== ORDER ANALYTICS SHEET ====================
  if (orderStatusData && orderStatusData.length > 0) {
    const orderSheet = [];
    
    // Modern header
    orderSheet.push([
      createModernCell('📦 ORDER ANALYTICS', {
        bgColor: COLORS.blue,
        fontColor: COLORS.white,
        bold: true,
        fontSize: 14,
        alignment: 'center'
      })
    ]);
    
    orderSheet.push(createSpacerRow(3));
    
    // Column headers
    orderSheet.push([
      createModernHeader('Status', '📊'),
      createModernHeader('Count', '🔢'),
      createModernHeader('Percentage', '📈')
    ]);

    const totalOrders = orderStatusData.reduce((sum, item) => sum + item.value, 0);
    
    orderStatusData.forEach(item => {
      const percentage = totalOrders > 0 ? ((item.value / totalOrders) * 100).toFixed(1) : 0;
      let bgColor = COLORS.white;
      
      // Color code by status
      if (item.label === 'Pending') bgColor = COLORS.yellowLight;
      else if (item.label === 'Processing' || item.label === 'Confirmed') bgColor = COLORS.blueLight;
      else if (item.label === 'Delivered' || item.label === 'Completed') bgColor = COLORS.greenLight;
      else if (item.label === 'Cancelled') bgColor = COLORS.yellowMid;
      else if (item.label === 'Out for Delivery') bgColor = COLORS.accentLight;

      orderSheet.push([
        createModernCell(item.label, { bgColor, bold: true }),
        createModernCell(item.value, { alignment: 'center' }),
        createModernCell(`${percentage}%`, { alignment: 'center', bold: true })
      ]);
    });

    const wsOrders = XLSX.utils.aoa_to_sheet(orderSheet);
    wsOrders['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
    wsOrders['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
    XLSX.utils.book_append_sheet(wb, wsOrders, '📦 Order Analytics');
  }

  // ==================== TOP PERFORMERS SHEET ====================
  if (topProducts && topProducts.length > 0) {
    const topSheet = [];
    
    topSheet.push([
      createModernCell('🏆 TOP PERFORMING PRODUCTS', {
        bgColor: COLORS.green,
        fontColor: COLORS.white,
        bold: true,
        fontSize: 14,
        alignment: 'center'
      })
    ]);
    
    topSheet.push(createSpacerRow(4));
    
    topSheet.push([
      createModernHeader('Rank', '🏅'),
      createModernHeader('Product Name', '📦'),
      createModernHeader('Units Sold', '📊'),
      createModernHeader('Revenue', '💰')
    ]);

    topProducts.forEach((product, index) => {
      let rankBg = COLORS.white;
      if (index === 0) rankBg = COLORS.yellowMid;      // Gold
      else if (index === 1) rankBg = COLORS.grayMid;   // Silver
      else if (index === 2) rankBg = COLORS.accentMid; // Bronze

      topSheet.push([
        createModernCell(`#${index + 1}`, { 
          bgColor: rankBg, 
          bold: true, 
          alignment: 'center',
          fontSize: 12
        }),
        createModernCell(product.label, { bgColor: COLORS.greenLight }),
        createModernCell(product.value, { alignment: 'center', bold: true }),
        createModernCell(`₱${product.revenue.toLocaleString()}`, { 
          alignment: 'right', 
          bold: true,
          fontColor: COLORS.green
        })
      ]);
    });

    const wsTop = XLSX.utils.aoa_to_sheet(topSheet);
    wsTop['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 15 }, { wch: 20 }];
    wsTop['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
    XLSX.utils.book_append_sheet(wb, wsTop, '🏆 Top Products');
  }

  // ==================== CATEGORY INSIGHTS SHEET ====================
  if (categoryData && categoryData.length > 0) {
    const catSheet = [];
    
    catSheet.push([
      createModernCell('📂 CATEGORY INSIGHTS', {
        bgColor: COLORS.purple,
        fontColor: COLORS.white,
        bold: true,
        fontSize: 14,
        alignment: 'center'
      })
    ]);
    
    catSheet.push(createSpacerRow(4));
    
    catSheet.push([
      createModernHeader('Category', '📂'),
      createModernHeader('Products', '📦'),
      createModernHeader('Sales Volume', '📊'),
      createModernHeader('Performance', '⭐')
    ]);

    const totalSales = categoryData.reduce((sum, cat) => sum + cat.sales, 0);
    
    categoryData.forEach(cat => {
      const performance = totalSales > 0 ? ((cat.sales / totalSales) * 100).toFixed(1) : 0;
      let perfRating = '⭐';
      if (performance > 30) perfRating = '⭐⭐⭐⭐⭐';
      else if (performance > 20) perfRating = '⭐⭐⭐⭐';
      else if (performance > 10) perfRating = '⭐⭐⭐';
      else if (performance > 5) perfRating = '⭐⭐';

      catSheet.push([
        createModernCell(cat.label, { bgColor: COLORS.purpleLight, bold: true }),
        createModernCell(cat.value, { alignment: 'center' }),
        createModernCell(cat.sales, { alignment: 'center', bold: true }),
        createModernCell(`${perfRating} ${performance}%`, { alignment: 'center' })
      ]);
    });

    const wsCat = XLSX.utils.aoa_to_sheet(catSheet);
    wsCat['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 20 }];
    wsCat['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
    XLSX.utils.book_append_sheet(wb, wsCat, '📂 Categories');
  }

  // ==================== INVENTORY ALERTS SHEET ====================
  if (lowStockProducts && lowStockProducts.length > 0) {
    const alertSheet = [];
    
    alertSheet.push([
      createModernCell('⚠️ INVENTORY ALERTS', {
        bgColor: COLORS.yellow,
        fontColor: COLORS.white,
        bold: true,
        fontSize: 14,
        alignment: 'center'
      })
    ]);
    
    alertSheet.push([
      createModernCell('Critical stock levels requiring immediate attention', {
        bgColor: COLORS.yellowLight,
        fontColor: COLORS.grayDark,
        italic: true,
        fontSize: 10,
        alignment: 'center'
      })
    ]);
    
    alertSheet.push(createSpacerRow(5));
    
    alertSheet.push([
      createModernHeader('SKU', '🔖'),
      createModernHeader('Product', '📦'),
      createModernHeader('Category', '📂'),
      createModernHeader('Stock', '📊'),
      createModernHeader('Price', '💰')
    ]);

    lowStockProducts.forEach(product => {
      let stockBg = COLORS.yellowLight;
      let urgency = '⚠️';
      if (product.stock <= 3) {
        stockBg = COLORS.yellowMid;
        urgency = '🚨';
      }
      if (product.stock === 0) {
        stockBg = COLORS.yellowMid;
        urgency = '❌';
      }

      alertSheet.push([
        createModernCell(product.sku, { bgColor: COLORS.grayLight }),
        createModernCell(product.name, { bgColor: COLORS.white }),
        createModernCell(product.category, { bgColor: COLORS.white }),
        createModernCell(`${urgency} ${product.stock}`, { 
          bgColor: stockBg, 
          bold: true,
          alignment: 'center'
        }),
        createModernCell(`₱${product.price}`, { alignment: 'right' })
      ]);
    });

    const wsAlert = XLSX.utils.aoa_to_sheet(alertSheet);
    wsAlert['!cols'] = [{ wch: 15 }, { wch: 38 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
    wsAlert['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }
    ];
    XLSX.utils.book_append_sheet(wb, wsAlert, '⚠️ Stock Alerts');
  }

  // ==================== RECENT TRANSACTIONS SHEET ====================
  if (orders && orders.length > 0) {
    const transSheet = [];
    
    transSheet.push([
      createModernCell('💳 RECENT TRANSACTIONS', {
        bgColor: COLORS.accent,
        fontColor: COLORS.white,
        bold: true,
        fontSize: 14,
        alignment: 'center'
      })
    ]);
    
    transSheet.push([
      createModernCell(`Last 50 orders • Updated: ${new Date().toLocaleString()}`, {
        bgColor: COLORS.accentLight,
        fontColor: COLORS.grayDark,
        italic: true,
        fontSize: 10,
        alignment: 'center'
      })
    ]);
    
    transSheet.push(createSpacerRow(5));
    
    transSheet.push([
      createModernHeader('Order #', '🔖'),
      createModernHeader('Customer', '👤'),
      createModernHeader('Amount', '💰'),
      createModernHeader('Status', '📊'),
      createModernHeader('Date', '📅')
    ]);

    const recentOrders = orders.slice(-50).reverse();
    
    recentOrders.forEach(order => {
      let statusBg = COLORS.white;
      let statusIcon = '⏳';
      
      if (order.status === 'Pending') {
        statusBg = COLORS.yellowLight;
        statusIcon = '⏳';
      } else if (order.status === 'Processing' || order.status === 'Confirmed') {
        statusBg = COLORS.blueLight;
        statusIcon = '⚙️';
      } else if (order.status === 'Out for Delivery') {
        statusBg = COLORS.accentLight;
        statusIcon = '🚚';
      } else if (order.status === 'Completed' || order.status === 'Delivered') {
        statusBg = COLORS.greenLight;
        statusIcon = '✅';
      } else if (order.status === 'Cancelled') {
        statusBg = COLORS.yellowMid;
        statusIcon = '❌';
      }

      transSheet.push([
        createModernCell(order.orderNumber || 'N/A', { bgColor: COLORS.grayLight }),
        createModernCell(order.customer || 'N/A', { bgColor: COLORS.white }),
        createModernCell(`₱${(order.amount || 0).toLocaleString()}`, { 
          alignment: 'right',
          bold: true,
          fontColor: COLORS.green
        }),
        createModernCell(`${statusIcon} ${order.status || 'Pending'}`, { 
          bgColor: statusBg,
          bold: true,
          alignment: 'center'
        }),
        createModernCell(
          order.date ? new Date(order.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }) : 'N/A', 
          { alignment: 'center' }
        )
      ]);
    });

    const wsTrans = XLSX.utils.aoa_to_sheet(transSheet);
    wsTrans['!cols'] = [{ wch: 22 }, { wch: 28 }, { wch: 18 }, { wch: 20 }, { wch: 18 }];
    wsTrans['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }
    ];
    XLSX.utils.book_append_sheet(wb, wsTrans, '💳 Transactions');
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `Pasalubong_Dashboard_${timestamp}.xlsx`;

  // Write the file
  XLSX.writeFile(wb, filename);
};