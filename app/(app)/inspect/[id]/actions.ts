"use server";

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { revalidatePath } from 'next/cache';

export async function submitVerdict(
  id: string, 
  status: 'passed' | 'rejected' | 'rework', 
  qcNotes: string
) {
  const payload = await getPayload({ config: configPromise });

  try {
    // If the status is final (Passed or Rejected), grab the exact time to stop the clock.
    const timeCompleted = (status === 'passed' || status === 'rejected') 
      ? new Date().toISOString() 
      : null;

    await payload.update({
      collection: 'inspections' as any, 
      id: id,
      data: {
        status: status,
        qcNotes: qcNotes,
        // Only update timeCompleted if it exists
        ...(timeCompleted && { timeCompleted }),
      },
    });

    // Force Next.js to refresh the dashboard data so the new status shows up instantly
    revalidatePath('/');
    revalidatePath(`/inspect/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update inspection:", error);
    return { success: false, error: "Failed to update database." };
  }
}