import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 h-screen overflow-hidden bg-background text-foreground">
      {/* LEFT PANEL - Marketing / Content */}
      <div className="flex flex-col h-full overflow-y-auto p-8 lg:p-16 hide-scrollbar relative">
        <div className="max-w-xl mx-auto flex-1 flex flex-col justify-center">
          <header className="mb-16">
            {/* Logo placeholder */}
            <div className="text-primary tracking-widest text-sm uppercase font-semibold mb-4">CONSSOR</div>
            <h1 className="text-5xl lg:text-6xl font-heading mb-6 leading-tight">
              Collaborative Intelligence<br />
              <span className="text-primary italic">for the Future.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10 font-sans tracking-wide">
              A premium, three-portal consulting marketplace connecting world-class 
              organizations with vetted domain experts. Powered by our proprietary AI engagement pricing engine.
            </p>
            
            <div className="flex gap-4 flex-wrap">
              <Link href="/client/onboarding">
                <Button data-testid="btn-get-started" className="bg-primary text-background hover:bg-primary/90 px-8 py-6 rounded-sm uppercase tracking-wide font-medium transition-all">
                  Find Your Consultant
                </Button>
              </Link>
              <div className="flex gap-2 items-center">
                <Link href="/consultant/login">
                  <Button data-testid="btn-login-consultant" variant="outline" className="border-primary text-primary hover:bg-primary/10 px-6 py-6 rounded-sm uppercase tracking-wide font-medium transition-all">
                    Consultant Login
                  </Button>
                </Link>
                <Link href="/consultant/register">
                  <Button data-testid="btn-register-consultant" variant="outline" className="border-primary text-primary hover:bg-primary/10 px-6 py-6 rounded-sm uppercase tracking-wide font-medium transition-all">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          <section className="mt-8 border-t border-white/10 pt-8">
            <h3 className="font-heading text-2xl mb-6">Expertise Driven by AI.</h3>
            <div className="grid grid-cols-2 gap-6 mb-8">
              {[
                "Strategic Consulting",
                "Digital Transformation",
                "Financial Advisory",
                "Technical Consulting"
              ].map((service) => (
                <div key={service} className="p-6 bg-secondary/50 border border-white/5 hover:border-primary/30 transition-all rounded-sm shadow-sm group">
                  <span className="text-sm uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{service}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 border-t border-white/10 pt-8">
               <h4 className="font-heading text-xl mb-6 text-foreground tracking-tight">16+ Global Industry Verticals</h4>
               <div className="flex flex-wrap gap-2">
                 {[
                   "Aerospace & Defense", "Agriculture & FoodTech", "Automotive & Mobility", 
                   "Chemicals & Materials", "Smart Infrastructure", "Consumer & Retail", 
                   "Digital Economy & ICT", "Energy & Utilities", "Financial Services", 
                   "Healthcare & Life Sciences", "Industrial & Manufacturing", "Media & Entertainment", 
                   "Private Equity", "Public Sector", "Telecommunications", "Transportation & Logistics"
                 ].map(vertical => (
                   <span key={vertical} className="text-[10px] uppercase tracking-wider bg-background border border-white/10 text-muted-foreground px-3 py-1.5 rounded-sm hover:border-primary/50 hover:text-primary transition-colors cursor-default">
                     {vertical}
                   </span>
                 ))}
               </div>
            </div>
          </section>
        </div>
        
        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10 text-xs text-muted-foreground uppercase tracking-widest flex justify-between">
          <span>© 2026 CONSSOR</span>
          <span className="flex gap-4"><a href="#" className="hover:text-primary">Privacy</a> <a href="#" className="hover:text-primary">Terms</a></span>
        </footer>
      </div>

      {/* RIGHT PANEL - AI Advisory Chat */}
      <div className="relative hidden lg:flex flex-col h-full bg-secondary overflow-hidden border-l border-white/5">
        {/* Abstract Gold Texture Background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1640027659327-96f1043e4278?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxkYXJrJTIwbmF2eSUyMGJsdWUlMjBhYnN0cmFjdCUyMGdvbGQlMjB0ZXh0dXJlfGVufDB8fHx8MTc3NTA3NzExM3ww&ixlib=rb-4.1.0&q=85')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <div className="flex-1 overflow-y-auto p-8 relative z-10 hide-scrollbar flex flex-col justify-end pb-32">
          {/* Mock Chat Messages */}
          <div className="space-y-6 max-w-xl mx-auto w-full">
            <div className="flex justify-end">
              <div className="bg-primary text-background p-4 rounded-sm rounded-br-none max-w-[80%] shadow-lg">
                <p className="font-sans text-sm">We need an expert to help redesign our core banking digital product.</p>
              </div>
            </div>
            
            <div className="flex justify-start">
              <div className="bg-background/80 backdrop-blur border-l-2 border-primary text-foreground p-5 rounded-sm max-w-[90%] shadow-xl">
                <p className="font-sans text-sm mb-4">Based on your requirement, I recommend focusing on <strong>Digital Transformation</strong> within the <strong>Financial Services</strong> vertical.</p>
                <div className="bg-secondary/50 p-4 text-xs border border-white/10 rounded-sm">
                  <span className="text-primary uppercase tracking-widest text-[10px] block mb-3 border-b border-white/10 pb-2">AI Quote Generated</span>
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-muted-foreground">Estimated Engagement</span>
                     <span className="font-semibold text-foreground">16 Weeks</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-muted-foreground">Complexity Factor</span>
                     <span className="font-semibold text-foreground">High (Growth Stage)</span>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                     <span className="text-muted-foreground">Recommended Scope</span>
                     <span className="font-semibold text-primary tracking-wide text-base">Calculated Post-Scope</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Input Area using Glassmorphism */}
        <div className="absolute bottom-0 left-0 right-0 p-8 glass-panel z-20">
          <div className="max-w-xl mx-auto relative group">
            <input 
              data-testid="input-ai-chat"
              type="text" 
              placeholder="Describe your challenge..." 
              className="w-full bg-background/50 border border-white/20 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 rounded-sm py-4 pl-4 pr-12 outline-none transition-all focus:ring-1 focus:ring-primary/50"
            />
            <button data-testid="btn-ai-submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary-hover transition-colors p-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
