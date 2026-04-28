"use client";

import { useEffect, useState } from "react";
import { BaseLayout } from "@/components/BaseLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Globe, Briefcase, FileText, Save, Plus, X } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("conssor_user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    fetch(`http://localhost:8000/api/consultant/profile/${user.consultant_id}/`)
      .then(res => res.json())
      .then(data => {
        setProfile(data.profile);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const user = JSON.parse(localStorage.getItem("conssor_user") || "{}");
    try {
      const res = await fetch(`http://localhost:8000/api/consultant/profile/${user.consultant_id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (newTag && !profile.domain_expertise.includes(newTag)) {
      setProfile({ ...profile, domain_expertise: [...profile.domain_expertise, newTag] });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setProfile({ ...profile, domain_expertise: profile.domain_expertise.filter((t: string) => t !== tag) });
  };

  if (loading) return <BaseLayout><div className="flex items-center justify-center h-64 text-primary uppercase tracking-[0.3em] text-xs">Loading Profile...</div></BaseLayout>;

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-primary/50 transition-all font-sans";
  const labelCls = "block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 font-semibold";

  return (
    <BaseLayout>
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-medium tracking-tight mb-2">Professional Profile</h1>
          <p className="text-muted-foreground text-sm font-sans">Manage your consulting resume and domain expertise.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#112A42]/30 border-white/5">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                <User className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Full Name</label>
                <input 
                  className={inputCls} 
                  value={profile.full_name} 
                  onChange={e => setProfile({...profile, full_name: e.target.value})}
                />
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input className={inputCls} value={profile.email} disabled />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <input 
                  className={inputCls} 
                  value={profile.phone || ""} 
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                />
              </div>
              <div>
                <label className={labelCls}>LinkedIn URL</label>
                <input 
                  className={inputCls} 
                  value={profile.linkedin_url || ""} 
                  onChange={e => setProfile({...profile, linkedin_url: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#112A42]/30 border-white/5">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Experience & Bio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className={labelCls}>Years of Experience</label>
                <input 
                  type="number"
                  className={inputCls} 
                  value={profile.years_experience || ""} 
                  onChange={e => setProfile({...profile, years_experience: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className={labelCls}>Professional Bio</label>
                <textarea 
                  className={`${inputCls} h-32 resize-none`}
                  value={profile.bio || ""} 
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                  placeholder="Tell clients about your expertise..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#112A42]/30 border-white/5">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Domain Expertise
              </CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-widest">Tags that help matching you to projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.domain_expertise.map((tag: string) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/20 rounded-sm text-[10px] text-primary uppercase font-bold">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(tag)} />
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  className={inputCls} 
                  value={newTag} 
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="Add expertise..."
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                />
                <Button size="icon" variant="outline" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#112A42]/30 border-white/5">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Consulting Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Resume URL (PDF/LinkedIn)</label>
                  <input 
                    className={inputCls} 
                    value={profile.resume_url || ""} 
                    onChange={e => setProfile({...profile, resume_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                  Provide a link to your full professional resume. This is shown to clients during the matching phase.
                </p>
                {profile.resume_url && (
                  <Button variant="outline" size="sm" className="w-full text-[9px] gap-2" onClick={() => window.open(profile.resume_url, '_blank')}>
                    View Current Resume
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  );
}
