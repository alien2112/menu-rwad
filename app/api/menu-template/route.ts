import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteSettings from '@/lib/models/SiteSettings';
import { MENU_TEMPLATES, TemplateId } from '@/lib/types/MenuTemplate';

// GET: Fetch available templates and current selection
export async function GET() {
  try {
    await connectDB();

    const settings = await SiteSettings.findOne();
    const currentTemplate = settings?.layoutTemplate || 'classic';

    return NextResponse.json({
      success: true,
      availableTemplates: MENU_TEMPLATES,
      currentTemplate,
    });
  } catch (error: unknown) {
    console.error('Error fetching menu template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch menu template',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT: Update the selected template
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { layoutTemplate } = body;

    // Validate template ID
    const validTemplates: TemplateId[] = ['classic', 'modern', 'minimal', 'elegant'];
    if (!layoutTemplate || !validTemplates.includes(layoutTemplate)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid template ID',
          validTemplates
        },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      {
        $set: {
          layoutTemplate,
          updatedAt: new Date()
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    return NextResponse.json({
      success: true,
      layoutTemplate: settings.layoutTemplate,
      message: 'Template updated successfully'
    });
  } catch (error: unknown) {
    console.error('Error updating menu template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update menu template',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
