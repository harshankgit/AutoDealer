import { NextResponse } from "next/server";
import { getSupabaseServiceRole } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServiceRole();
    const body = await req.json();

    const { deviceId, browser, os, deviceType } = body;

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthName = now.toLocaleString("en-US", { month: "short", year: "numeric" });

    // Fetch current row
    const { data, error } = await supabase
      .from("monthly_visits")
      .select("*")
      .eq("year_month", yearMonth)
      .single();

    let devices: string[] = [];
    if (data?.last_updated_devices) {
      try {
        devices = JSON.parse(data.last_updated_devices);
      } catch (parseError) {
        console.error("Error parsing last_updated_devices:", parseError);
        devices = [];
      }
    }

    const isNewDevice = !devices.includes(deviceId);

    // Update or insert row
    const updatedDeviceList = isNewDevice ? [...devices, deviceId] : devices;

    const updateFields = {
      visit_count: (data?.visit_count || 0) + 1,
      unique_users: isNewDevice ? (data?.unique_users || 0) + 1 : data?.unique_users || 1,
      last_updated_devices: JSON.stringify(updatedDeviceList),
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("monthly_visits")
      .upsert({
        year_month: yearMonth,
        month_name: monthName,
        ...updateFields,
      }, { onConflict: 'year_month' });

    if (upsertError) {
      console.error("Error upserting monthly visit:", upsertError);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      visit_count: updateFields.visit_count,
      unique_users: updateFields.unique_users,
      isNewDevice
    });
  } catch (error) {
    console.error('Error in track visit API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}