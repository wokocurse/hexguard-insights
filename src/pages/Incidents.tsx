import { Layout } from '@/components/Layout';
import { useHexGuard } from '@/context/HexGuardContext';
import { IncidentCard } from '@/components/IncidentCard';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Incidents = () => {
  const { incidents, detectionRun } = useHexGuard();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Incidents</h1>
            <p className="text-muted-foreground mt-1">
              Correlated security events requiring investigation
            </p>
          </div>
          
          <div className="flex w-full md:w-auto space-x-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by IP, ID, or Tag..." 
                className="pl-9 bg-card/50 border-border focus:ring-primary/50"
              />
            </div>
            <Button variant="outline" className="border-border">Filters</Button>
          </div>
        </div>

        {!detectionRun && incidents.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/20">
            <h3 className="text-xl font-medium text-muted-foreground">No Data Available</h3>
            <p className="text-muted-foreground/60 mt-2">Run a detection scan from the dashboard first.</p>
            <Button className="mt-4" onClick={() => window.location.href = '/'}>Go to Dashboard</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incidents.map((incident) => (
              <IncidentCard key={incident.incident_id} incident={incident} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Incidents;
