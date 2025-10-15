/**
 * ESC/POS Ticket Formatter
 * Formats order data into ESC/POS commands for thermal printers
 */

export interface TicketData {
  items: Array<{
    name: string;
    nameEn?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    customizations?: string[];
    notes?: string;
  }>;
  customerInfo: {
    name?: string;
    phone?: string;
    tableNumber?: string;
  };
  orderInfo: {
    orderNumber: string;
    orderDate: Date;
    totalAmount: number;
    taxInfo?: {
      subtotal: number;
      taxRate: number;
      taxAmount: number;
    };
  };
  departmentInfo: {
    department: string;
    assignedTo?: string;
    estimatedPrepTime?: number;
  };
}

export interface PrintSettings {
  copies: number;
  includeLogo: boolean;
  includeQRCode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  paperCut: boolean;
  buzzer: boolean;
  paperWidth: 58 | 80;
}

export class ESCPOSFormatter {
  private settings: PrintSettings;
  private paperWidth: number;

  constructor(settings: PrintSettings) {
    this.settings = settings;
    this.paperWidth = settings.paperWidth;
  }

  /**
   * Format complete ticket
   */
  formatTicket(ticketData: TicketData): Buffer {
    const commands: number[] = [];

    // Initialize printer
    commands.push(...this.initialize());

    // Print header
    commands.push(...this.printHeader(ticketData));

    // Print order info
    commands.push(...this.printOrderInfo(ticketData));

    // Print items
    commands.push(...this.printItems(ticketData.items));

    // Print totals
    commands.push(...this.printTotals(ticketData));

    // Print footer
    commands.push(...this.printFooter(ticketData));

    // Cut paper and finish
    commands.push(...this.finish());

    return Buffer.from(commands);
  }

  /**
   * Initialize printer
   */
  private initialize(): number[] {
    const commands: number[] = [];
    
    // ESC @ - Initialize printer
    commands.push(0x1B, 0x40);
    
    // Set character encoding to UTF-8
    commands.push(0x1B, 0x74, 0x00);
    
    // Set line spacing
    commands.push(0x1B, 0x33, 0x18);
    
    return commands;
  }

  /**
   * Print header with restaurant info
   */
  private printHeader(ticketData: TicketData): number[] {
    const commands: number[] = [];
    
    // Center alignment
    commands.push(0x1B, 0x61, 0x01);
    
    // Double height and width
    commands.push(0x1B, 0x21, 0x30);
    
    // Restaurant name
    commands.push(...this.encodeText('مقهى مراكش\n'));
    
    // Reset formatting
    commands.push(0x1B, 0x21, 0x00);
    
    // Department ticket
    const departmentName = this.getDepartmentName(ticketData.departmentInfo.department);
    commands.push(...this.encodeText(`${departmentName}\n`));
    
    // Separator line
    commands.push(...this.printSeparator());
    
    // Left alignment
    commands.push(0x1B, 0x61, 0x00);
    
    return commands;
  }

  /**
   * Print order information
   */
  private printOrderInfo(ticketData: TicketData): number[] {
    const commands: number[] = [];
    
    // Order number
    commands.push(...this.encodeText(`رقم الطلب: ${ticketData.orderInfo.orderNumber}\n`));
    
    // Date and time
    const dateStr = new Date(ticketData.orderInfo.orderDate).toLocaleString('ar-SA');
    commands.push(...this.encodeText(`التاريخ: ${dateStr}\n`));
    
    // Customer info
    if (ticketData.customerInfo.name) {
      commands.push(...this.encodeText(`العميل: ${ticketData.customerInfo.name}\n`));
    }
    
    if (ticketData.customerInfo.phone) {
      commands.push(...this.encodeText(`الهاتف: ${ticketData.customerInfo.phone}\n`));
    }
    
    if (ticketData.customerInfo.tableNumber) {
      commands.push(...this.encodeText(`الطاولة: ${ticketData.customerInfo.tableNumber}\n`));
    }
    
    // Assigned staff
    if (ticketData.departmentInfo.assignedTo) {
      commands.push(...this.encodeText(`المسؤول: ${ticketData.departmentInfo.assignedTo}\n`));
    }
    
    // Estimated prep time
    if (ticketData.departmentInfo.estimatedPrepTime) {
      commands.push(...this.encodeText(`الوقت المتوقع: ${ticketData.departmentInfo.estimatedPrepTime} دقيقة\n`));
    }
    
    // Separator
    commands.push(...this.printSeparator());
    
    return commands;
  }

  /**
   * Print order items
   */
  private printItems(items: TicketData['items']): number[] {
    const commands: number[] = [];
    
    // Items header
    commands.push(...this.encodeText('المنتجات المطلوبة:\n'));
    commands.push(...this.printSeparator('='));
    
    items.forEach((item, index) => {
      // Item number
      commands.push(...this.encodeText(`${index + 1}. `));
      
      // Item name (Arabic)
      commands.push(...this.encodeText(`${item.name}\n`));
      
      // Item name (English) if available
      if (item.nameEn) {
        commands.push(...this.encodeText(`   ${item.nameEn}\n`));
      }
      
      // Quantity and price
      const quantityPrice = `الكمية: ${item.quantity} × ${item.unitPrice.toFixed(2)} ر.س`;
      const totalPrice = `المجموع: ${item.totalPrice.toFixed(2)} ر.س`;
      
      commands.push(...this.encodeText(`   ${quantityPrice}\n`));
      commands.push(...this.encodeText(`   ${totalPrice}\n`));
      
      // Customizations
      if (item.customizations && item.customizations.length > 0) {
        commands.push(...this.encodeText('   التخصيصات:\n'));
        item.customizations.forEach(custom => {
          commands.push(...this.encodeText(`   - ${custom}\n`));
        });
      }
      
      // Notes
      if (item.notes) {
        commands.push(...this.encodeText(`   ملاحظات: ${item.notes}\n`));
      }
      
      // Item separator
      if (index < items.length - 1) {
        commands.push(...this.printSeparator('-'));
      }
    });
    
    commands.push(...this.printSeparator('='));
    
    return commands;
  }

  /**
   * Print totals and tax information
   */
  private printTotals(ticketData: TicketData): number[] {
    const commands: number[] = [];
    
    // Subtotal
    if (ticketData.orderInfo.taxInfo) {
      commands.push(...this.encodeText(`المجموع الفرعي: ${ticketData.orderInfo.taxInfo.subtotal.toFixed(2)} ر.س\n`));
      commands.push(...this.encodeText(`الضريبة (${ticketData.orderInfo.taxInfo.taxRate}%): ${ticketData.orderInfo.taxInfo.taxAmount.toFixed(2)} ر.س\n`));
    }
    
    // Total
    commands.push(0x1B, 0x21, 0x08); // Bold
    commands.push(...this.encodeText(`المجموع الكلي: ${ticketData.orderInfo.totalAmount.toFixed(2)} ر.س\n`));
    commands.push(0x1B, 0x21, 0x00); // Reset bold
    
    return commands;
  }

  /**
   * Print footer
   */
  private printFooter(ticketData: TicketData): number[] {
    const commands: number[] = [];
    
    // Separator
    commands.push(...this.printSeparator());
    
    // Center alignment
    commands.push(0x1B, 0x61, 0x01);
    
    // Thank you message
    commands.push(...this.encodeText('شكراً لكم\n'));
    commands.push(...this.encodeText('نتمنى لكم وجبة شهية\n'));
    
    // QR Code if enabled
    if (this.settings.includeQRCode) {
      commands.push(...this.printQRCode(ticketData.orderInfo.orderNumber));
    }
    
    // Left alignment
    commands.push(0x1B, 0x61, 0x00);
    
    return commands;
  }

  /**
   * Finish printing
   */
  private finish(): number[] {
    const commands: number[] = [];
    
    // Feed paper
    commands.push(0x0A, 0x0A, 0x0A);
    
    // Cut paper if enabled
    if (this.settings.paperCut) {
      commands.push(0x1D, 0x56, 0x00); // Full cut
    }
    
    // Buzzer if enabled
    if (this.settings.buzzer) {
      commands.push(0x1B, 0x42, 0x05, 0x05); // Buzzer pattern
    }
    
    return commands;
  }

  /**
   * Print separator line
   */
  private printSeparator(char: string = '='): number[] {
    const commands: number[] = [];
    const line = char.repeat(this.paperWidth / 8); // Approximate characters per line
    commands.push(...this.encodeText(`${line}\n`));
    return commands;
  }

  /**
   * Print QR Code
   */
  private printQRCode(data: string): number[] {
    const commands: number[] = [];
    
    // QR Code model
    commands.push(0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
    
    // QR Code size
    commands.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x08);
    
    // Error correction
    commands.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30);
    
    // Store data
    const dataBytes = Buffer.from(data, 'utf8');
    const dataLength = dataBytes.length + 3;
    commands.push(0x1D, 0x28, 0x6B, dataLength & 0xFF, (dataLength >> 8) & 0xFF, 0x31, 0x50, 0x30);
    commands.push(...dataBytes);
    
    // Print QR Code
    commands.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30);
    
    // Feed line
    commands.push(0x0A);
    
    return commands;
  }

  /**
   * Encode text with proper character encoding
   */
  private encodeText(text: string): number[] {
    // Convert Arabic text to proper encoding
    // This is a simplified version - in production, you'd use proper Arabic ESC/POS encoding
    const buffer = Buffer.from(text, 'utf8');
    return Array.from(buffer);
  }

  /**
   * Get department name in Arabic
   */
  private getDepartmentName(department: string): string {
    const departmentNames: { [key: string]: string } = {
      kitchen: 'تذكرة المطبخ',
      barista: 'تذكرة البارستا',
      shisha: 'تذكرة الشيشة',
      general: 'تذكرة عامة'
    };
    return departmentNames[department] || 'تذكرة';
  }

  /**
   * Format text with proper alignment and formatting
   */
  private formatText(text: string, alignment: 'left' | 'center' | 'right' = 'left', bold: boolean = false): number[] {
    const commands: number[] = [];
    
    // Set alignment
    const alignCode = alignment === 'center' ? 0x01 : alignment === 'right' ? 0x02 : 0x00;
    commands.push(0x1B, 0x61, alignCode);
    
    // Set bold
    if (bold) {
      commands.push(0x1B, 0x21, 0x08);
    }
    
    // Add text
    commands.push(...this.encodeText(text));
    
    // Reset formatting
    if (bold) {
      commands.push(0x1B, 0x21, 0x00);
    }
    
    return commands;
  }
}

/**
 * Utility function to format ticket for printing
 */
export function formatTicketForPrinting(ticketData: TicketData, settings: PrintSettings): Buffer {
  const formatter = new ESCPOSFormatter(settings);
  return formatter.formatTicket(ticketData);
}

/**
 * Utility function to create test ticket
 */
export function createTestTicket(printerName: string, department: string): Buffer {
  const testData: TicketData = {
    items: [
      {
        name: 'اختبار الطباعة',
        nameEn: 'Print Test',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        notes: 'تذكرة اختبار للطابعة'
      }
    ],
    customerInfo: {
      name: 'اختبار النظام',
      tableNumber: 'TEST'
    },
    orderInfo: {
      orderNumber: 'TEST-' + Date.now(),
      orderDate: new Date(),
      totalAmount: 0
    },
    departmentInfo: {
      department,
      assignedTo: 'System Test'
    }
  };

  const testSettings: PrintSettings = {
    copies: 1,
    includeLogo: false,
    includeQRCode: true,
    fontSize: 'medium',
    paperCut: true,
    buzzer: true,
    paperWidth: 58
  };

  return formatTicketForPrinting(testData, testSettings);
}





