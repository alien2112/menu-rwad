import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SiteSettings from '@/lib/models/SiteSettings';

// Ensure this route is always dynamic and not statically cached
// Updated: Fixed theme save/retrieve functionality
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();
    // Use findOne().lean() to get plain JavaScript object with all fields
    const settings = await SiteSettings.findOne().lean();
    if (!settings) {
      // Create default settings if none exist
      const newSettings = await SiteSettings.create({});
      const plainSettings = await SiteSettings.findById(newSettings._id).lean();
      return NextResponse.json(
        { success: true, data: plainSettings },
        { headers: { 'Cache-Control': 'no-store, must-revalidate' } }
      );
    }
    return NextResponse.json(
      { success: true, data: settings },
      { headers: { 'Cache-Control': 'no-store, must-revalidate' } }
    );
  } catch (error: any) {
    console.error('[Site Settings GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: { 'Cache-Control': 'no-store, must-revalidate' } }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    console.log('[Site Settings PUT] Request body:', JSON.stringify(body, null, 2));
    const settings = await SiteSettings.getSettings();
    console.log('[Site Settings PUT] Current theme before update:', settings.theme);

    if (typeof body.logoUrl === 'string') settings.logoUrl = body.logoUrl;
    if (['left', 'center', 'right'].includes(body.logoPosition)) settings.logoPosition = body.logoPosition;

    // Handle theme update/reset and persist through document save to ensure middleware runs
    const allowedKeys = new Set([
      'background',
      'foreground',
      'primary',
      'secondary',
      'accent',
      'card',
      'card-foreground',
      'muted',
      'muted-foreground',
      'ring',
      'scroll-thumb-start',
      'scroll-thumb-end',
      'scroll-track'
    ]);

    if (body && typeof body.resetTheme === 'boolean' && body.resetTheme === true) {
      console.log('[Site Settings PUT] Resetting theme to undefined');
      settings.theme = undefined as any;
      settings.markModified('theme');
    } else {
      const newTheme: Record<string, string> = {};

      // Accept nested object
      if (body && typeof body.theme === 'object' && body.theme !== null) {
        const incoming = body.theme as Record<string, unknown>;
        console.log('[Site Settings PUT] Processing nested theme object:', incoming);
        for (const [key, value] of Object.entries(incoming)) {
          if (!allowedKeys.has(key)) {
            console.log(`[Site Settings PUT] Skipping disallowed key: ${key}`);
            continue;
          }
          if (typeof value === 'string' && value.trim().length > 0) {
            newTheme[key] = value.trim();
          }
        }
      }

      // Also accept top-level keys as a fallback (in case client posts them directly)
      for (const key of allowedKeys) {
        const value = (body as any)[key];
        if (typeof value === 'string' && value.trim().length > 0) {
          newTheme[key] = value.trim();
        }
      }

      console.log('[Site Settings PUT] New theme to save:', newTheme);
      console.log('[Site Settings PUT] New theme keys count:', Object.keys(newTheme).length);

      if (Object.keys(newTheme).length > 0) {
        const currentTheme = (settings as any).theme || {};
        settings.theme = { ...currentTheme, ...newTheme } as any;
        settings.markModified('theme');
        console.log('[Site Settings PUT] Theme merged and marked as modified:', settings.theme);
      }
    }

    console.log('[Site Settings PUT] About to save settings with theme:', settings.theme);
    await (settings as any).save();
    console.log('[Site Settings PUT] Settings saved');

    // Return latest saved document with theme field using lean() for plain object
    const latest = await SiteSettings.findById((settings as any)._id).lean();
    console.log('[Site Settings PUT] Latest from DB (lean):', JSON.stringify(latest));

    return NextResponse.json(
      { success: true, data: latest },
      { headers: { 'Cache-Control': 'no-store, must-revalidate' } }
    );
  } catch (error: any) {
    console.error('[Site Settings PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: { 'Cache-Control': 'no-store, must-revalidate' } }
    );
  }
}


