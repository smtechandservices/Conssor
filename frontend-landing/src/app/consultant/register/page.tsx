import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ConsultantRegister() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <div className="text-primary tracking-widest text-sm uppercase font-semibold text-center hover:opacity-80 transition-opacity">CONSSOR</div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-heading font-medium tracking-tight text-foreground">
          Join the Network
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground font-sans">
          Apply to become a vetted domain expert.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-secondary/50 py-8 px-4 shadow sm:rounded-sm sm:px-10 border border-white/5">
          <form className="space-y-6" action="#" method="POST">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-foreground tracking-wide uppercase text-[10px]">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-sm bg-background placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors text-foreground"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground tracking-wide uppercase text-[10px]">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-sm bg-background placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors text-foreground"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-foreground tracking-wide uppercase text-[10px]">
                LinkedIn URL
              </label>
              <div className="mt-1">
                <input
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-sm bg-background placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors text-foreground"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground tracking-wide uppercase text-[10px]">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-sm bg-background placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors text-foreground"
                />
              </div>
            </div>

            <div>
              <Button type="button" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-background bg-primary hover:bg-primary/90 focus:outline-none uppercase tracking-widest transition-all">
                Submit Application
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#112A42] text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/consultant/login" className="font-medium text-primary hover:text-primary-hover">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
