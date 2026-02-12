import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useHexGuard } from '@/context/HexGuardContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const UploadArea = () => {
  const { handleUpload, isUploading, uploadResult, reset, loadSampleData } = useHexGuard();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      await handleUpload(e.target.files[0]);
    }
  };

  if (uploadResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-xl p-8 border border-primary/20 bg-card/50"
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/10 p-4 ring-1 ring-primary/40">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl font-medium text-foreground">Log File Parsed Successfully</h3>
          <div className="flex items-center space-x-2 text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg border border-border">
            <FileText className="w-4 h-4" />
            <span className="font-mono text-sm">{uploadResult.filename}</span>
            <span className="w-1 h-1 bg-muted-foreground rounded-full mx-2" />
            <span className="font-mono text-sm text-primary">{uploadResult.event_count} events</span>
          </div>
          <Button variant="ghost" onClick={reset} className="text-muted-foreground hover:text-foreground">
            Upload Different File
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "relative overflow-hidden border-2 border-dashed border-muted-foreground/20 bg-muted/5 transition-all duration-300 hover:border-primary/50 hover:bg-muted/10",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-6">
          <div className="rounded-full bg-secondary p-4 ring-1 ring-border shadow-lg">
            <Upload className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-lg font-medium">Upload DNS Logs</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop CSV or JSON files here, or click to browse.
              <br />
              <span className="text-xs opacity-70 mt-2 block">Supported: timestamp, src_ip, query, type</span>
            </p>
          </div>
          <div className="relative">
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={onFileChange}
              accept=".csv,.json,.txt"
              disabled={isUploading}
            />
            <Button variant="secondary" className="pointer-events-none" disabled={isUploading}>
              {isUploading ? 'Parsing...' : 'Select Log File'}
            </Button>
          </div>
        </div>
      </Card>
      
      <div className="text-center">
        <Button variant="link" onClick={loadSampleData} className="text-primary/70 hover:text-primary text-sm">
          No logs? Load sample attack data
        </Button>
      </div>
    </div>
  );
};
