import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SiteSettings from '@/lib/models/SiteSettings';

// Ensure this route is always dynamic and not statically cached
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/theme
 * Fetch the current theme settings
 */
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
        { success: true, theme: plainSettings?.theme || null },
        { headers: { 'Cache-Control': 'no-store, must-revalidate' } }
      );
    }

    return NextResponse.json(
      { success: true, theme: settings.theme || null },
      { headers: { 'Cache-Control': 'no-store, must-revalidate' } }
    );
  } catch (error: any) {
    console.error('[Theme GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: { 'Cache-Control': 'no-store, must-revalidate' } }
    );
  }
}

/**
 * PUT /api/theme
 * Update the theme settings (admin only)
 *
 * Request body:
 * - theme: object with color properties (background, foreground, primary, etc.)
 * - resetTheme: boolean to reset theme to defaults
 */
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    console.log('[Theme PUT] Request body:', JSON.stringify(body, null, 2));

    const settings = await SiteSettings.getSettings();
    console.log('[Theme PUT] Current theme before update:', settings.theme);

    // Handle theme update/reset
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
      console.log('[Theme PUT] Resetting theme to undefined');
      settings.theme = undefined as any;
      settings.markModified('theme');
    } else {
      const newTheme: Record<string, string> = {};

      // Accept nested theme object
      if (body && typeof body.theme === 'object' && body.theme !== null) {
        const incoming = body.theme as Record<string, unknown>;
        console.log('[Theme PUT] Processing theme object:', incoming);

        for (const [key, value] of Object.entries(incoming)) {
          if (!allowedKeys.has(key)) {
            console.log(`[Theme PUT] Skipping disallowed key: ${key}`);
            continue;
          }
          if (typeof value === 'string' && value.trim().length > 0) {
            newTheme[key] = value.trim();
          }
        }
      }

      // Also accept top-level keys as fallback
      for (const key of allowedKeys) {
        const value = (body as any)[key];
        if (typeof value === 'string' && value.trim().length > 0 && !newTheme[key]) {
          newTheme[key] = value.trim();
        }
      }

      console.log('[Theme PUT] New theme to save:', newTheme);
      console.log('[Theme PUT] New theme keys count:', Object.keys(newTheme).length);

      if (Object.keys(newTheme).length > 0) {
        const currentTheme = (settings as any).theme || {};
        settings.theme = { ...currentTheme, ...newTheme } as any;
        settings.markModified('theme');
        console.log('[Theme PUT] Theme merged and marked as modified:', settings.theme);
      } else {
        return NextResponse.json(
          { success: false, error: 'No valid theme properties provided' },
          { status: 400, headers: { 'Cache-Control': 'no-store, must-revalidate' } }
        );
      }
    }

    console.log('[Theme PUT] About to save settings with theme:', settings.theme);
    await (settings as any).save();
    console.log('[Theme PUT] Settings saved');

    // Return latest saved theme using lean() for plain object
    const latest = await SiteSettings.findById((settings as any)._id).lean();
    console.log('[Theme PUT] Latest from DB (lean):', JSON.stringify(latest));

    return NextResponse.json(
      { success: true, theme: latest?.theme || null },
      { headers: { 'Cache-Control': 'no-store, must-revalidate' } }
    );
  } catch (error: any) {
    console.error('[Theme PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: { 'Cache-Control': 'no-store, must-revalidate' } }
    );
  }
}
