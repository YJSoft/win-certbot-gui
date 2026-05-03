export type JobEventType = 'event.job.progress' | 'event.job.completed' | 'event.job.failed';

export interface JobEvent {
  type: JobEventType;
  jobId: string;
  message: string;
  progress?: number;
  at: string;
}

export function createJobEvent(type: JobEventType, jobId: string, message: string, progress?: number): JobEvent {
  return { type, jobId, message, progress, at: new Date().toISOString() };
}
