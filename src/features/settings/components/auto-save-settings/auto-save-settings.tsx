'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AUTO_SAVE_INTERVALS, type AutoSaveInterval } from '@/lib/constants/auto-save';
import { cn } from '@/lib/utils';

import { usePreferences } from '../preferences-provider';

const AUTO_SAVE_LABEL = 'Auto-save';
const SAVE_EVERY_LABEL = 'Save every';

export const AutoSaveSettings = () => {
  const { autoSave, autoSaveInterval, setAutoSave, setAutoSaveInterval } = usePreferences();

  return (
    <div className="divide-y">
      <div className="flex items-center justify-between p-4">
        <Label htmlFor="auto-save" className="text-sm font-medium">
          {AUTO_SAVE_LABEL}
        </Label>
        <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
      </div>

      <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-muted-foreground text-sm">{SAVE_EVERY_LABEL}</span>
        <div className="flex gap-1 rounded-lg border p-1">
          {AUTO_SAVE_INTERVALS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={!autoSave}
              aria-label={opt.label}
              onClick={() => setAutoSaveInterval(opt.value as AutoSaveInterval)}
              className={cn(
                'flex-1 cursor-pointer rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-40',
                autoSaveInterval === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              <span className="sm:hidden">{opt.shortLabel}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
