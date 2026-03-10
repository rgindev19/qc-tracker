"use server";

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { revalidatePath } from 'next/cache';

export async function createInspection(data: {
  jobNo: string;
  partName: string;
  quantity: number;
  targetTatHours: number;
}) {
  const payload = await getPayload({ config: configPromise });

  try {
    // 1. Generate the exact timestamp securely on the server
    const exactServerTime = new Date().toISOString();

    // 2. Write to the database (with 'as any' to fix your TypeScript errors)
    const inspection = await payload.create({
      collection: 'inspections' as any,
      data: {
        jobNo: data.jobNo,
        partName: data.partName,
        quantity: data.quantity,
        targetTatHours: data.targetTatHours,
        timeReceived: exactServerTime, 
        status: 'pending', // All new parts start as pending
      },
    });

    // 3. CRUCIAL FIX: Clear the cache so the dashboard updates instantly
    revalidatePath('/');

    return { success: true, id: inspection.id };
  } catch (error) {
    console.error("Payload Database Error:", error);
    return { success: false, error: 'Failed to write to the QC database.' };
  }
}