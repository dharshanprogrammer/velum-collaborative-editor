import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { Role, AccessPolicy, DocumentItem } from '../../types';
import { Copy, Check, Globe, Lock, Shield, UserMinus } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export function ShareDialog({
  doc,
  open,
  onOpenChange,
  onDocUpdated,
}: {
  doc: DocumentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocUpdated: (updated: DocumentItem) => void;
}) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('editor');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!doc) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/documents/${doc._id}/members`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      onDocUpdated(res.data.document);
      setInviteEmail('');
      toast.success(`Access granted to ${inviteEmail}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to invite collaborator');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePolicy = async (newPolicy: AccessPolicy) => {
    try {
      const res = await api.patch(`/documents/${doc._id}`, { accessPolicy: newPolicy });
      onDocUpdated(res.data.document);
      toast.success(`General access updated to ${newPolicy.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update access policy');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 space-y-4">
        <DialogHeader>
          <DialogTitle className="text-base">Share "{doc.title}"</DialogTitle>
          <DialogDescription className="text-xs">
            Manage who has view, edit, or ownership access to this document.
          </DialogDescription>
        </DialogHeader>

        {/* Invite Input */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Invite by email address..."
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            className="text-xs"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as Role)}
            className="h-9 px-2 text-xs rounded-md border border-border bg-surface text-text-primary outline-none focus:border-accent"
          >
            <option value="editor">Can edit</option>
            <option value="viewer">Can view</option>
          </select>
          <Button size="sm" onClick={handleInvite} loading={loading} disabled={!inviteEmail.trim()}>
            Invite
          </Button>
        </div>

        {/* Members List */}
        <div className="space-y-3 pt-2">
          <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            People with access
          </h4>

          {/* Owner Row */}
          <div className="flex items-center justify-between py-1 text-xs">
            <div className="flex items-center gap-2.5">
              <Avatar
                name={doc.ownerId?.name || 'Owner'}
                colorIndex={doc.ownerId?.colorIndex ?? 0}
                size="sm"
              />
              <div>
                <p className="font-semibold text-text-primary">{doc.ownerId?.name || 'Document Owner'}</p>
                <p className="text-[11px] text-text-muted">{doc.ownerId?.email}</p>
              </div>
            </div>
            <span className="text-[11px] text-text-muted font-medium bg-surface-subtle px-2 py-0.5 rounded">
              Owner
            </span>
          </div>

          {/* Collaborator Members */}
          {doc.members?.map((member) => (
            <div key={member.user?.id || member.user?.email} className="flex items-center justify-between py-1 text-xs">
              <div className="flex items-center gap-2.5">
                <Avatar
                  name={member.user?.name || 'User'}
                  colorIndex={member.user?.colorIndex ?? 0}
                  size="sm"
                />
                <div>
                  <p className="font-semibold text-text-primary">{member.user?.name || 'User'}</p>
                  <p className="text-[11px] text-text-muted">{member.user?.email}</p>
                </div>
              </div>
              <span className="text-[11px] text-text-muted capitalize">
                Can {member.role}
              </span>
            </div>
          ))}
        </div>

        {/* General Access Row */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted">
              {doc.accessPolicy === 'restricted' ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4 text-accent" />}
            </div>
            <div>
              <p className="font-semibold text-text-primary">General access</p>
              <select
                value={doc.accessPolicy}
                onChange={(e) => handleUpdatePolicy(e.target.value as AccessPolicy)}
                className="text-[11px] text-text-muted bg-transparent outline-none cursor-pointer hover:text-text-primary"
              >
                <option value="restricted">Restricted (Only invited members)</option>
                <option value="public_view">Anyone with the link can view</option>
                <option value="public_edit">Anyone with the link can edit</option>
              </select>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-semantic-success stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy link'}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
