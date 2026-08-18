export interface CommandRequest { input: string; submittedAt: string; }
export function createCommandRequest(input: string): CommandRequest {
  const value = input.trim();
  if (!value) throw new Error('Command cannot be empty');
  return { input: value, submittedAt: new Date().toISOString() };
}
