import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { FileText, Users, Target, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TemplateOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  preview: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'blank',
    name: 'Blank Document',
    description: 'Start fresh with a clean, distraction-free page',
    icon: <FileText className="w-5 h-5 text-accent" />,
    preview: 'Type something wonderful...',
  },
  {
    id: 'meeting-notes',
    name: 'Team Sync & Meeting Notes',
    description: 'Structured agenda, attendees, and action checklists',
    icon: <Users className="w-5 h-5 text-semantic-info" />,
    preview: 'Meeting agenda with tasks and action items...',
  },
  {
    id: 'project-brief',
    name: 'Product Spec & Brief',
    description: 'Problem framing, architecture goals, and success metrics',
    icon: <Target className="w-5 h-5 text-semantic-warning" />,
    preview: 'Target metrics: INP < 100ms, 60fps animations...',
  },
  {
    id: 'weekly-report',
    name: 'Weekly Status Report',
    description: 'Summarize engineering milestones and shipped features',
    icon: <Calendar className="w-5 h-5 text-semantic-success" />,
    preview: 'Shipped features, active tests, performance stats...',
  },
];

export function TemplatePickerModal({
  open,
  onOpenChange,
  onSelectTemplate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (templateId: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Create a New Document</DialogTitle>
          <DialogDescription>
            Choose a starting layout or begin with an empty canvas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => {
                onSelectTemplate(tmpl.id);
                onOpenChange(false);
              }}
              className="p-4 rounded-xl border border-border bg-surface hover:border-accent hover:shadow-card cursor-pointer transition-all duration-150 flex flex-col gap-2 group select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-surface-subtle group-hover:scale-105 transition-transform">
                  {tmpl.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary text-sm group-hover:text-accent transition-colors">
                    {tmpl.name}
                  </h4>
                  <p className="text-xs text-text-muted line-clamp-1">{tmpl.description}</p>
                </div>
              </div>

              <div className="mt-2 p-2.5 rounded-lg bg-surface-subtle/50 text-[11px] text-text-muted/70 font-mono border border-border/40 line-clamp-2">
                {tmpl.preview}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
