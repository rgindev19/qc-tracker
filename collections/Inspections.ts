import { CollectionConfig } from 'payload'

export const Inspections: CollectionConfig = {
  slug: 'inspections',
  admin: {
    useAsTitle: 'jobNo',
    defaultColumns: ['jobNo', 'partName', 'status', 'timeReceived'],
  },
  access: {
    read: () => true, 
    create: () => true, // Allows the frontend form to submit new parts
    update: () => true, 
  },
  fields: [
    {
      name: 'jobNo',
      type: 'text',
      required: true,
      label: 'Job / Routing Number',
    },
    {
      name: 'partName',
      type: 'text',
      required: true,
      label: 'Part Description',
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'targetTatHours',
      type: 'number',
      required: true,
      defaultValue: 2, // Hardcoded to your new 2-hour standard
      label: 'Target TAT (Hours)',
    },
    {
      name: 'timeReceived',
      type: 'date',
      required: true,
      admin: {
        description: 'The exact moment the part entered the QC queue.',
      }
    },
    {
      name: 'timeCompleted',
      type: 'date',
      admin: {
        description: 'Stamped automatically when the inspection is finalized.',
      }
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Passed', value: 'passed' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Rework Required', value: 'rework' },
      ],
      required: true,
    },
    {
      // Optional: A field for the inspector to leave notes if a part fails
      name: 'qcNotes',
      type: 'textarea',
      label: 'Quality Control Notes',
    }
  ],
}