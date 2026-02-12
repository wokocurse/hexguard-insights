import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Incident } from '@/lib/types';
import { AlertTriangle, Clock, Target, Eye, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface IncidentCardProps {
  incident: Incident;
}

export const IncidentCard = ({ incident }: IncidentCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      onClick={() => navigate(`/incidents/${incident.incident_id}`)}
      className="group cursor-pointer border-border/50 bg-card/40 hover:bg-card/60 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] relative overflow-hidden"
    >
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1",
        incident.severity_label === 'Critical' ? "bg-severity-critical" :
        incident.severity_label === 'High' ? "bg-severity-high" :
        incident.severity_label === 'Medium' ? "bg-severity-medium" : "bg-severity-low"
      )} />
      
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-muted-foreground">{incident.incident_id}</span>
              <span className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider",
                incident.severity_label === 'Critical' ? "text-severity-critical bg-severity-critical/10" :
                incident.severity_label === 'High' ? "text-severity-high bg-severity-high/10" :
                incident.severity_label === 'Medium' ? "text-severity-medium bg-severity-medium/10" : "text-severity-low bg-severity-low/10"
              )}>
                {incident.severity_label}
              </span>
            </div>
            <CardTitle className="text-base font-medium flex items-center space-x-2">
              <span className="text-foreground">{incident.src_ip}</span>
            </CardTitle>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold font-mono text-primary/90">{incident.severity_score}</span>
            <span className="text-[10px] uppercase text-muted-foreground tracking-widest">Score</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 px-5 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {incident.detections.map((det, i) => (
            <Badge key={i} variant="outline" className="border-primary/20 bg-primary/5 text-primary-foreground/80 hover:bg-primary/10 text-xs py-0 h-5">
              {det.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {incident.mitre_tags.map((tag, i) => (
            <Badge key={i} className="bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 text-[10px] h-5 py-0">
              MITRE: {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(incident.time_range.start).toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{incident.timeline_events.length} Events</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
