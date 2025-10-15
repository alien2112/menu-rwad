import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TaxSettings from '@/lib/models/TaxSettings';

// GET tax settings
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const settings = await TaxSettings.getTaxSettings();
    
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    console.error('[Tax Settings API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update tax settings
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    const {
      enableTaxHandling,
      taxType,
      vatRate,
      includeTaxInPrice,
      displayTaxBreakdown,
      generateTaxReports,
      taxNumber,
      complianceMode
    } = body;

    // Validate VAT rate
    if (vatRate < 0 || vatRate > 100) {
      return NextResponse.json(
        { success: false, error: 'VAT rate must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate tax number format for Saudi ZATCA
    if (complianceMode === 'Saudi ZATCA' && taxNumber) {
      // Saudi tax number format: 3XXXXXXXXXXXXXXX (15 digits)
      const saudiTaxNumberRegex = /^3\d{14}$/;
      if (!saudiTaxNumberRegex.test(taxNumber)) {
        return NextResponse.json(
          { success: false, error: 'Saudi tax number must be 15 digits starting with 3' },
          { status: 400 }
        );
      }
    }

    const updatedSettings = await TaxSettings.updateTaxSettings({
      enableTaxHandling: Boolean(enableTaxHandling),
      taxType,
      vatRate: Number(vatRate),
      includeTaxInPrice: Boolean(includeTaxInPrice),
      displayTaxBreakdown: Boolean(displayTaxBreakdown),
      generateTaxReports: Boolean(generateTaxReports),
      taxNumber: taxNumber || null,
      complianceMode
    });

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Tax settings updated successfully'
    });
  } catch (error: any) {
    console.error('[Tax Settings API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create tax settings (fallback)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Check if settings already exist
    const existingSettings = await TaxSettings.findOne();
    if (existingSettings) {
      return NextResponse.json(
        { success: false, error: 'Tax settings already exist. Use PUT to update.' },
        { status: 400 }
      );
    }

    const newSettings = await TaxSettings.create(body);
    
    return NextResponse.json({
      success: true,
      data: newSettings,
      message: 'Tax settings created successfully'
    });
  } catch (error: any) {
    console.error('[Tax Settings API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}





