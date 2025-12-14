import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { paymentServices } from '@/lib/supabase/services/paymentService';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('scannerImage') as File | null;
    const paymentId = formData.get('paymentId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Scanner image is required' },
        { status: 400 }
      );
    }

    if (paymentId && paymentId !== 'general') {
      // For payment-specific uploads, check if the payment belongs to admin's room
      const payment = await paymentServices.getPaymentById(paymentId);
      if (!payment) {
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }

      // Check if admin has permission to modify this payment
      const { roomServices } = await import('@/lib/supabase/services/generalServices');
      const { supabase } = await import('@/lib/supabase/client');

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('id, carid')
        .eq('id', payment.booking_id)
        .single();

      if (bookingError || !bookingData) {
        return NextResponse.json(
          { error: 'Booking not found for this payment' },
          { status: 404 }
        );
      }

      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('roomid')
        .eq('id', bookingData.carid)
        .single();

      if (carError || !carData) {
        return NextResponse.json(
          { error: 'Car not found for this booking' },
          { status: 404 }
        );
      }

      const roomData = await roomServices.getRoomById(carData.roomid);
      if (!roomData || roomData.adminid !== decoded.userId) {
        return NextResponse.json(
          { error: 'Unauthorized - Payment does not belong to your room' },
          { status: 403 }
        );
      }
    }

    // In a real implementation, we would upload the file to Supabase storage
    // For now, we'll just return a placeholder URL
    // In a real implementation, you would do something like:
    /*
    const supabase = getSupabaseServiceRole();
    const fileBuffer = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase
      .storage
      .from('scanner-uploads')
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading scanner image:', error);
      return NextResponse.json(
        { error: 'Failed to upload scanner image' },
        { status: 500 }
      );
    }

    const publicUrl = supabase.storage.from('scanner-uploads').getPublicUrl(fileName).data.publicUrl;
    return NextResponse.json({
      message: 'Scanner image uploaded successfully',
      scannerImageUrl: publicUrl
    }, { status: 200 });
    */

    // Placeholder: return a data URL for demonstration
    // For this implementation, we'll just return the data URL but won't update the payment here
    // The payment will be updated in the approval API call
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      message: 'Scanner image processed successfully',
      scannerImageUrl: dataUrl
    }, { status: 200 });

  } catch (error: any) {
    console.error('Upload scanner image error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}