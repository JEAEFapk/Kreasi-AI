export type LayoutMode = 'mobile' | 'desktop';
export type AppState = 'entry' | 'dashboard';

export interface ModeConfig {
  id: string;
  name: string;
  icon: any;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
}
