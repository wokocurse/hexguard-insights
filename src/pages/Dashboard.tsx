import { HexGuardProvider, useHexGuard } from '@/context/HexGuardContext';
import { Layout } from '@/components/Layout';
import { UploadArea } from '@/components/UploadArea';
import { IncidentCard } from '@/components/IncidentCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, ShieldCheck, Activity, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardContent = () => {
  const { isDetecting, detectionRun, runDetection, incidents, uploadResult } = useHexGuard();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white glow-text-primary">
          Turn Invisible Threats Into Readable Intelligence
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Detect encoded DNS exfiltration, decode hidden payloads, and transform raw logs into investigation-ready incidents in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <UploadArea />
          
          {uploadResult && !isDetecting && !detectionRun && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button 
                size="lg" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02]"
                onClick={runDetection}
              >
                <Activity className="mr-2 h-5 w-5" />
                Run Detection Engine
              </Button>
            </motion.div>
          )}

          {isDetecting && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 glass rounded-xl border border-primary/20">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-3 rounded-full border-4 border-accent/20 border-b-accent animate-spin-slow" />
              </div>
              <p className="text-sm font-mono animate-pulse text-primary">ANALYZING LOGS...</p>
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2">
          {!detectionRun ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/50 rounded-xl bg-card/20">
              <ShieldCheck className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-medium text-muted-foreground">System Ready</h3>
              <p className="text-muted-foreground/60 max-w-sm mt-2">
                Upload generic DNS logs (CSV/JSON) to begin threat hunting. HexGuard will normalize and analyze events locally.
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center">
                  <span className="w-2 h-8 bg-primary rounded-sm mr-3" />
                  Recent Incidents
                  <span className="ml-3 text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {incidents.length} DETECTED
                  </span>
                </h2>
                <Button variant="outline" className="border-primary/30 hover:bg-primary/10 text-primary">
                  View All <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {incidents.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-border bg-card/50">
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium">No Threats Detected</h3>
                    <p className="text-muted-foreground">The uploaded logs appear clean based on current detection rules.</p>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {incidents.slice(0, 3).map((incident) => (
                    <IncidentCard key={incident.incident_id} incident={incident} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => (
  <Layout>
    <DashboardContent />
  </Layout>
);

export default Dashboard;

import { CheckCircle } from 'lucide-react';
