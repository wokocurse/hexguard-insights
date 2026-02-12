import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useHexGuard } from '@/context/HexGuardContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, FileText, Cpu, AlertTriangle, Terminal, Shield } from 'lucide-react';
import { generateJSONReport, generateMarkdownReport } from '@/lib/reporter';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const IncidentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getIncident, generateSummary } = useHexGuard();
  const incident = getIncident(id || '');

  if (!incident) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <h2 className="text-2xl font-bold">Incident Not Found</h2>
          <Button onClick={() => navigate('/incidents')}>Back to List</Button>
        </div>
      </Layout>
    );
  }

  const handleDownloadReport = () => {
    const json = generateJSONReport(incident);
    const md = generateMarkdownReport(incident);
    
    // Download JSON
    const blobJson = new Blob([json], { type: 'application/json' });
    const urlJson = URL.createObjectURL(blobJson);
    const aJson = document.createElement('a');
    aJson.href = urlJson;
    aJson.download = `${incident.incident_id}_report.json`;
    aJson.click();
    
    // Download Markdown
    const blobMd = new Blob([md], { type: 'text/markdown' });
    const urlMd = URL.createObjectURL(blobMd);
    const aMd = document.createElement('a');
    aMd.href = urlMd;
    aMd.download = `${incident.incident_id}_report.md`;
    aMd.click();
    
    toast.success('Incident reports downloaded successfully');
  };

  const handleGenerateAI = () => {
    if (!incident.ai_summary) {
      generateSummary(incident.incident_id);
      toast.success('AI Summary generated');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Incidents
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold font-mono tracking-tight text-white">{incident.incident_id}</h1>
              <Badge className={cn(
                "text-sm px-3 py-1",
                incident.severity_label === 'Critical' ? "bg-severity-critical text-white" :
                incident.severity_label === 'High' ? "bg-severity-high text-white" :
                incident.severity_label === 'Medium' ? "bg-severity-medium text-black" : "bg-severity-low text-white"
              )}>
                {incident.severity_label} SEVERITY
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono text-sm">
              SOURCE IP: <span className="text-primary">{incident.src_ip}</span> • 
              DETECTED: {new Date(incident.time_range.start).toLocaleString()}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" className="border-primary/30 hover:bg-primary/10 hover:text-primary" onClick={handleGenerateAI}>
              <Cpu className="mr-2 h-4 w-4" />
              {incident.ai_summary ? 'Regenerate AI Summary' : 'AI Investigation'}
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow" onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Decoded Payload Highlight - THE WOW FACTOR */}
            {incident.decoded_payloads.length > 0 && (
              <Card className="border-hex-glow/50 bg-hex-glow/5 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Terminal className="w-24 h-24 text-hex-glow" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-hex-glow/10 to-transparent pointer-events-none" />
                
                <CardHeader>
                  <CardTitle className="flex items-center text-hex-glow glow-text-hex">
                    <Shield className="w-5 h-5 mr-2" />
                    Payload Decoded Successfully
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="p-4 bg-black/40 rounded-lg border border-hex-glow/30 font-mono text-sm md:text-base break-all text-hex-glow shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    {incident.decoded_payloads[0]}
                  </div>
                  {incident.decoded_payloads.length > 1 && (
                    <p className="text-xs text-muted-foreground">
                      + {incident.decoded_payloads.length - 1} other decoded fragments
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI Summary */}
            {incident.ai_summary && (
              <Card className="border-primary/20 bg-card/60 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Cpu className="w-5 h-5 mr-2 text-primary" />
                    AI Investigation Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert prose-sm max-w-none text-muted-foreground">
                    <div className="whitespace-pre-wrap font-sans leading-relaxed">
                      {incident.ai_summary.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-white mb-2">{line.substring(2)}</h1>;
                        if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-primary mt-4 mb-2">{line.substring(3)}</h2>;
                        if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold text-white mt-3 mb-1">{line.substring(4)}</h3>;
                        if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.substring(2)}</li>;
                        if (line === '') return <div key={i} className="h-2" />;
                        return <p key={i} className="mb-1">{line}</p>;
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card className="border-border/50 bg-card/40">
              <CardHeader>
                <CardTitle className="text-lg">Attack Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative border-l border-border/50 ml-3 space-y-8 py-2">
                  {incident.timeline_events.map((event, idx) => (
                    <div key={idx} className="relative pl-8 group">
                      <div className={cn(
                        "absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 transition-all",
                        event.score > 50 ? "bg-background border-severity-high group-hover:bg-severity-high" : "bg-background border-muted-foreground group-hover:border-primary"
                      )} />
                      
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground font-mono mb-1">
                          {new Date(event.timestamp).toLocaleTimeString()}
                          <span className="mx-2">•</span>
                          {event.reasons.join(', ')}
                        </div>
                        
                        <div className="font-mono text-xs md:text-sm bg-black/20 p-2 rounded border border-white/5 break-all text-foreground/80 group-hover:text-foreground group-hover:border-primary/20 transition-colors">
                          {event.query}
                        </div>

                        {event.decoded_payload && (
                          <div className="mt-1 pl-3 border-l-2 border-hex-glow/50 text-xs font-mono text-hex-glow">
                            ↳ Decoded: {event.decoded_payload}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <Card className="bg-card/40 border-border/50">
              <CardHeader><CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Detection Rules</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {incident.detections.map(d => (
                  <Badge key={d} variant="secondary" className="bg-secondary/50 border-border">{d.replace(/_/g, ' ')}</Badge>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border/50">
              <CardHeader><CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">MITRE ATT&CK</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {incident.mitre_tags.map(t => (
                  <Badge key={t} className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">{t}</Badge>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border/50">
              <CardHeader><CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Details</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Event Count</span>
                  <span className="font-mono">{incident.timeline_events.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-mono">
                    {Math.round((new Date(incident.time_range.end).getTime() - new Date(incident.time_range.start).getTime()) / 1000)}s
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Target Client</span>
                  <span className="font-mono truncate max-w-[150px]">{incident.timeline_events[0].client || 'Unknown'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IncidentDetail;
