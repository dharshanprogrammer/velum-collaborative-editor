import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Check, Bell, Shield, Heart, Zap, Sliders, Type } from 'lucide-react';
import { Button } from '../components/ui/button';
import { IconButton } from '../components/ui/icon-button';
import { Input, Textarea } from '../components/ui/input';
import { Switch, Checkbox } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Kbd } from '../components/ui/kbd';
import { Avatar, AvatarStack } from '../components/ui/avatar';
import { Spinner } from '../components/ui/spinner';
import { SegmentedControl } from '../components/ui/segmented-control';
import { ColorSwatchPicker } from '../components/ui/color-swatch';
import { StatusPill } from '../components/editor/StatusPill';
import { toast } from 'sonner';

export function DesignSystemRoute() {
  const [switchVal, setSwitchVal] = useState(true);
  const [checkVal, setCheckVal] = useState(true);
  const [selectedColor, setSelectedColor] = useState(0);
  const [segment, setSegment] = useState<'preview' | 'tokens' | 'motion'>('preview');

  const DEMO_USERS = [
    { id: '1', name: 'Ana Silva', colorIndex: 0, isTyping: true },
    { id: '2', name: 'Liam Vance', colorIndex: 1 },
    { id: '3', name: 'Sofia Chen', colorIndex: 5, isIdle: true },
    { id: '4', name: 'Marcus Brody', colorIndex: 4 },
    { id: '5', name: 'Elena Rostova', colorIndex: 7 },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary p-6 sm:p-12 max-w-6xl mx-auto space-y-12 bg-mesh-glow">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <IconButton icon={<ArrowLeft className="w-4 h-4" />} label="Back to Dashboard" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-text-primary font-display">
                Studio Design System
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold border border-accent/20">
                v2.0 BESPOKE
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Curated tokens, HSL palette, accessibility states, and micro-animations.
            </p>
          </div>
        </div>

        <SegmentedControl
          value={segment}
          onChange={setSegment}
          size="sm"
          options={[
            { value: 'preview', label: 'Live Primitives' },
            { value: 'tokens', label: 'Color Tokens' },
            { value: 'motion', label: 'Motion & Depth' },
          ]}
        />
      </div>

      {/* 1. Buttons */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted font-display">
          <Zap className="w-3.5 h-3.5 text-accent" />
          <span>1. Interactive Actions & Triggers</span>
        </div>
        <div className="p-7 rounded-3xl border border-border/80 bg-surface/80 shadow-subtle flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary Gradient CTA</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Destructive Danger</Button>
          <Button variant="primary" loading>Loading State</Button>
          <Button size="sm">Small (32px)</Button>
          <Button size="lg">Large (44px)</Button>
        </div>
      </section>

      {/* 2. Interactive Toolbars & Status Pills */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted font-display">
          <Sliders className="w-3.5 h-3.5 text-accent" />
          <span>2. Live Status Pills & Indicators</span>
        </div>
        <div className="p-7 rounded-3xl border border-border/80 bg-surface/80 shadow-subtle flex flex-wrap items-center gap-4">
          <StatusPill status="saved" />
          <StatusPill status="saving" />
          <StatusPill status="offline" />
          <StatusPill status="reconnecting" reconnectCountdown={3} />
          <StatusPill status="readonly" />
        </div>
      </section>

      {/* 3. Avatars & Collaboration Stacks */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted font-display">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>3. Presence & 12 Accessible Collaborator Colors</span>
        </div>
        <div className="p-7 rounded-3xl border border-border/80 bg-surface/80 shadow-subtle space-y-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Avatar name="Ana Silva" colorIndex={0} size="md" isOnline />
              <span className="text-xs font-medium">Online Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Avatar name="Sofia Chen" colorIndex={5} size="md" isOnline isIdle />
              <span className="text-xs font-medium">Idle Desaturated</span>
            </div>
            <div className="flex items-center gap-2">
              <AvatarStack users={DEMO_USERS} maxVisible={3} />
              <span className="text-xs font-medium">+N Overflow Popover</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-text-muted mb-3 font-display">
              Curated Accessible Palette
            </p>
            <ColorSwatchPicker selectedIndex={selectedColor} onSelectIndex={setSelectedColor} />
          </div>
        </div>
      </section>

      {/* 4. Form Controls */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted font-display">
          <Type className="w-3.5 h-3.5 text-accent" />
          <span>4. Form Controls & Inputs</span>
        </div>
        <div className="p-7 rounded-3xl border border-border/80 bg-surface/80 shadow-subtle grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Input placeholder="Standard studio text input..." />
            <Input error="Invalid email address" placeholder="Input with error state..." />
          </div>
          <div className="space-y-4 flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <Switch checked={switchVal} onCheckedChange={setSwitchVal} />
              <span className="text-xs text-text-muted">Accessible Radix Switch</span>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox checked={checkVal} onCheckedChange={setCheckVal} />
              <span className="text-xs text-text-muted">Accessible Radix Checkbox</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Toasts & Badges */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted font-display">
          <Bell className="w-3.5 h-3.5 text-accent" />
          <span>5. Badges, Shortcuts & Sonner Toasts</span>
        </div>
        <div className="p-7 rounded-3xl border border-border/80 bg-surface/80 shadow-subtle flex flex-wrap items-center gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Kbd>⌘ K</Kbd>
          <Kbd>⌘ ⌥ M</Kbd>

          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => toast.success('Optimistic UI action applied seamlessly')}
          >
            Trigger Success Toast
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() =>
              toast.error('Network drop detected. Edits saved locally.', {
                action: { label: 'Retry', onClick: () => toast.info('Reconnected successfully') },
              })
            }
          >
            Trigger Action Toast
          </Button>
        </div>
      </section>
    </div>
  );
}
